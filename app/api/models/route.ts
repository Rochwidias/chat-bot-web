import { NextRequest } from "next/server";
import {
  getProvider,
  supportsReasoning,
  supportsVision,
  type ModelOption,
} from "@/lib/providers";
import type { ProviderId } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const sp = req.nextUrl.searchParams;
  const provider = (sp.get("provider") || "openai") as ProviderId;
  // Key diutamakan dari header agar tak bocor ke access log via URL;
  // query ?apiKey= tetap didukung sebagai fallback kompatibilitas lama.
  const apiKey = req.headers.get("x-provider-key") || sp.get("apiKey") || "";
  const customBaseUrl = sp.get("baseUrl") || "";

  const meta = getProvider(provider);
  const baseUrl = (
    provider === "custom" ? customBaseUrl || meta.baseUrl : meta.baseUrl
  ).replace(/\/$/, "");
  if (!baseUrl) {
    return Response.json({ error: "Base URL custom masih kosong." }, { status: 400 });
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
    upstream = await fetch(`${baseUrl}/models`, { headers });
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
