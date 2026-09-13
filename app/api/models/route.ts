import { NextRequest } from "next/server";
import {
  getProvider,
  supportsReasoning,
  supportsVision,
  type ModelOption,
} from "@/lib/providers";
import { checkRateLimit, clientIp, validateBaseUrl } from "@/lib/security";
import type { ProviderId } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODELS_WINDOW_MS = 60_000;
const MODELS_MAX_PER_IP = 30;

/** Model yang jelas bukan chat (embedding, TTS, gambar, moderasi). */
const EXCLUDE = /embed|whisper|tts|dall-e|moderation|transcri|realtime|audio|flux|image-gen/i;

interface UpstreamModel {
  id?: string;
  name?: string;
  architecture?: { modality?: string };
  supported_parameters?: string[];
  context_length?: number;
}

function shortCtx(n?: number): string {
  if (!n || n <= 0) return "";
  if (n >= 1_000_000) return ` · ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M ctx`;
  return ` · ${Math.round(n / 1000)}k ctx`;
}

/** Normalisasi 1 entri model upstream → ModelOption. */
function normalize(m: UpstreamModel): ModelOption | null {
  if (!m.id || m.id.startsWith("~") || EXCLUDE.test(m.id)) return null;
  const modality = m.architecture?.modality ?? "";
  const params = m.supported_parameters ?? [];
  const vision = modality.includes("image") || supportsVision(m.id);
  const reasoning =
    params.some((p) => p.toLowerCase().includes("reason")) ||
    supportsReasoning(m.id);
  return {
    id: m.id,
    label: `${m.name || m.id}${shortCtx(m.context_length)}`,
    vision,
    reasoning,
  };
}

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  const limit = checkRateLimit("models:ip", ip, MODELS_MAX_PER_IP, MODELS_WINDOW_MS);
  if (!limit.allowed) {
    return Response.json(
      { error: "Terlalu banyak request. Coba lagi sebentar." },
      { status: 429 }
    );
  }

  const sp = req.nextUrl.searchParams;
  const provider = (sp.get("provider") || "openai") as ProviderId;
  // Key HANYA via header agar tak bocor ke access log via URL.
  // Fallback ?apiKey= dihapus (pecah kompatibilitas lama demi keamanan).
  const apiKey = req.headers.get("x-provider-key") || "";
  const customBaseUrl = sp.get("baseUrl") || "";

  const VALID_PROVIDERS = ["openai", "openrouter", "gemini", "deepseek", "custom"];
  if (!VALID_PROVIDERS.includes(provider)) {
    return Response.json({ error: "Provider tidak dikenal." }, { status: 400 });
  }
  const meta = getProvider(provider);
  let baseUrl = meta.baseUrl;
  if (provider === "custom") {
    const checked = await validateBaseUrl(customBaseUrl);
    if (!checked.ok) {
      return Response.json({ error: checked.error }, { status: 400 });
    }
    baseUrl = checked.baseUrl;
  } else if (!baseUrl) {
    return Response.json({ error: "Base URL provider belum dikonfigurasi." }, { status: 400 });
  }

  // Referer/title OpenRouter bisa dioverride via env saat deploy
  // (default localhost agar dev tetap jalan tanpa env).
  const appReferer = process.env.OPENROUTER_REFERER || "http://localhost:3000";
  const appTitle = process.env.OPENROUTER_TITLE || "ChatBot Web BYOK";

  const headers: Record<string, string> = {};
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  if (provider === "openrouter") {
    // Wajib untuk OpenRouter, diabaikan provider lain.
    headers["HTTP-Referer"] = appReferer;
    headers["X-Title"] = appTitle;
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/models`, {
      headers,
      signal: AbortSignal.timeout(30_000),
    });
  } catch (e) {
    return Response.json(
      { error: `Gagal menghubungi provider: ${e instanceof Error ? e.message : e}` },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return Response.json(
      {
        error:
          upstream.status === 401
            ? "Butuh API key yang valid untuk memuat daftar model provider ini."
            : `Gagal memuat model (${upstream.status}): ${text.slice(0, 300) || upstream.statusText}`,
      },
      { status: upstream.status || 502 }
    );
  }

  const json = (await upstream.json().catch(() => null)) as {
    data?: UpstreamModel[];
  } | null;
  const list = Array.isArray(json?.data) ? json!.data! : [];
  const models = list
    .map(normalize)
    .filter((m): m is ModelOption => m !== null)
    .sort((a, b) => a.id.localeCompare(b.id));

  return Response.json({ models, count: models.length });
}
