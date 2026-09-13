import { NextRequest } from "next/server";
import {
  getProvider,
  reasoningSystemHint,
  reasoningToEffort,
  supportsReasoning,
} from "@/lib/providers";
import type { ProviderId, ReasoningLevel } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IncomingImage {
  dataUrl: string;
}
interface IncomingMessage {
  role: "user" | "assistant" | "system";
  content: string;
  images?: IncomingImage[];
}
interface ChatBody {
  provider: ProviderId;
  model: string;
  apiKey: string;
  customBaseUrl?: string;
  reasoning: ReasoningLevel;
  messages: IncomingMessage[];
}

function sse(token: string): string {
  return `data: ${JSON.stringify({ token })}\n\n`;
}

/** Ubah pesan frontend → format content OpenAI-compatible (teks + image_url). */
function toOpenAIMessages(body: ChatBody) {
  const out: unknown[] = [
    { role: "system", content: reasoningSystemHint(body.reasoning) },
  ];
  // Batasi 30 pesan terakhir biar hemat token & cepat.
  for (const m of body.messages.slice(-30)) {
    if (m.role === "system") continue;
    if (m.images && m.images.length > 0) {
      out.push({
        role: m.role,
        content: [
          ...(m.content ? [{ type: "text", text: m.content }] : []),
          ...m.images
            .slice(0, 4)
            .map((img) => ({ type: "image_url", image_url: { url: img.dataUrl } })),
        ],
      });
    } else {
      out.push({ role: m.role, content: m.content });
    }
  }
  return out;
}

export async function POST(req: NextRequest) {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return Response.json({ error: "Body JSON tidak valid." }, { status: 400 });
  }

  if (!body.apiKey) {
    return Response.json(
      { error: "API key kosong. Klik tombol “Isi API Key” di topbar dulu bang." },
      { status: 401 }
    );
  }
  if (!body.model) return Response.json({ error: "Model belum dipilih." }, { status: 400 });
  if (!body.messages?.length)
    return Response.json({ error: "Pesan kosong." }, { status: 400 });

  const meta = getProvider(body.provider);
  const baseUrl =
    body.provider === "custom"
      ? (body.customBaseUrl || meta.baseUrl).replace(/\/$/, "")
      : meta.baseUrl;
  if (!baseUrl)
    return Response.json(
      { error: "Base URL custom masih kosong. Isi di modal API key." },
      { status: 400 }
    );

  const payload: Record<string, unknown> = {
    model: body.model,
    stream: true,
    messages: toOpenAIMessages(body),
  };
  // Reasoning effort hanya untuk model yang support (biar tak error 400).
  if (supportsReasoning(body.model)) {
    payload.reasoning_effort = reasoningToEffort(body.reasoning);
  }

  // Referer/title OpenRouter bisa dioverride via env saat deploy
  // (default localhost agar dev tetap jalan tanpa env).
  const appReferer = process.env.OPENROUTER_REFERER || "http://localhost:3000";
  const appTitle = process.env.OPENROUTER_TITLE || "ChatBot Web BYOK";

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${body.apiKey}`,
        // Wajib untuk OpenRouter, diabaikan provider lain.
        "HTTP-Referer": appReferer,
        "X-Title": appTitle,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return Response.json(
      { error: `Gagal menghubungi provider: ${e instanceof Error ? e.message : e}` },
      { status: 502 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return Response.json(
      { error: `Provider menolak (${upstream.status}): ${text.slice(0, 500) || upstream.statusText}` },
      { status: upstream.status || 502 }
    );
  }

  // Teruskan stream provider → frontend sebagai event {token}.
  // Pass-through ketat: [DONE] upstream diteruskan sekali lalu stream
  // ditutup — tanpa [DONE] ganda (dulu: forward + selalu append final).
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buf = "";
      let doneSent = false;

      const push = (t: string) => controller.enqueue(encoder.encode(sse(t)));
      const pushDone = () => {
        if (doneSent) return;
        doneSent = true;
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      };

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const data = t.slice(5).trim();
            if (data === "[DONE]") {
              pushDone();
              continue;
            }
            try {
              const json = JSON.parse(data);
              const token: string =
                json.choices?.[0]?.delta?.content ??
                json.choices?.[0]?.message?.content ??
                "";
              if (token) push(token);
            } catch {
              /* baris non-JSON: lewati */
            }
          }
        }
        pushDone();
        controller.close();
      } catch (e) {
        controller.enqueue(
          encoder.encode(sse(`\n\n[n stream error: ${e instanceof Error ? e.message : e}]`))
        );
        pushDone();
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
