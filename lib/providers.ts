import type { ProviderId, ReasoningLevel } from "./types";

export interface ModelOption {
  id: string;
  label: string;
  vision: boolean;
  reasoning: boolean;
}

export interface ProviderMeta {
  id: ProviderId;
  label: string;
  /** Base URL OpenAI-compatible (tanpa /chat/completions) */
  baseUrl: string;
  keyPlaceholder: string;
  keyHint: string;
  docsUrl: string;
  defaultModel: string;
  models: ModelOption[];
}

export const PROVIDERS: ProviderMeta[] = [
  {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    keyPlaceholder: "sk-...",
    keyHint: "Dibuat di platform.openai.com → API keys",
    docsUrl: "https://platform.openai.com/api-keys",
    defaultModel: "gpt-4o-mini",
    models: [
      { id: "gpt-4o-mini", label: "GPT-4o Mini (cepat & murah)", vision: true, reasoning: false },
      { id: "gpt-4o", label: "GPT-4o (vision + pintar)", vision: true, reasoning: false },
      { id: "gpt-5-mini", label: "GPT-5 Mini (reasoning)", vision: true, reasoning: true },
      { id: "o4-mini", label: "o4-mini (reasoning kencang)", vision: true, reasoning: true },
    ],
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    keyPlaceholder: "sk-or-v1-...",
    keyHint: "Satu key untuk ratusan model (gratis & berbayar)",
    docsUrl: "https://openrouter.ai/keys",
    defaultModel: "openai/gpt-4o-mini",
    models: [
      { id: "openai/gpt-4o-mini", label: "GPT-4o Mini via OR", vision: true, reasoning: false },
      { id: "google/gemini-flash-1.5", label: "Gemini Flash 1.5 via OR", vision: true, reasoning: false },
      { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet via OR", vision: true, reasoning: false },
      { id: "deepseek/deepseek-chat", label: "DeepSeek Chat via OR", vision: false, reasoning: false },
    ],
  },
  {
    id: "gemini",
    label: "Google Gemini",
    // Endpoint OpenAI-compatible milik Google, jadi satu jalur kode.
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    keyPlaceholder: "AIza...",
    keyHint: "Gratis di aistudio.google.com → Get API key",
    docsUrl: "https://aistudio.google.com/app/apikey",
    defaultModel: "gemini-2.0-flash",
    models: [
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash (rekomendasi)", vision: true, reasoning: false },
      { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", vision: true, reasoning: false },
      { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", vision: true, reasoning: false },
    ],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    keyPlaceholder: "sk-...",
    keyHint: "Dibuat di platform.deepseek.com → API keys",
    docsUrl: "https://platform.deepseek.com/api_keys",
    defaultModel: "deepseek-chat",
    models: [
      { id: "deepseek-chat", label: "DeepSeek Chat", vision: false, reasoning: false },
      { id: "deepseek-reasoner", label: "DeepSeek Reasoner (High recom.)", vision: false, reasoning: true },
    ],
  },
  {
    id: "custom",
    label: "Custom (OpenAI-compatible)",
    baseUrl: "",
    keyPlaceholder: "key...",
    keyHint: "Isi Base URL manual, mis. http://localhost:11434/v1 (Ollama)",
    docsUrl: "https://platform.openai.com/docs/api-reference",
    defaultModel: "llama3.1",
    models: [{ id: "llama3.1", label: "Model custom (ketik manual)", vision: false, reasoning: false }],
  },
];

export function getProvider(id: ProviderId): ProviderMeta {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}

/** Apakah model ini mendukung kirim gambar? (daftar + heuristik) */
export function supportsVision(modelId: string): boolean {
  // Daftar statik dulu agar katalog tetap otoritatif untuk model dikenal.
  for (const p of PROVIDERS)
    for (const model of p.models)
      if (model.id === modelId) return model.vision;
  const m = modelId.toLowerCase();
  if (
    m.includes("gpt-4o") ||
    m.includes("gpt-5") ||
    m.includes("gemini") ||
    m.includes("claude") ||
    m.includes("vision") ||
    m.includes("o4")
  )
    return true;
  return false;
}

/** Apakah model ini mendukung parameter reasoning? */
export function supportsReasoning(modelId: string): boolean {
  // Daftar statik dulu: otoritatif untuk model yang dikenal (mis.
  // "gpt-4o-mini" punya reasoning:false dan tak boleh kena heuristik "o*").
  for (const p of PROVIDERS)
    for (const model of p.models)
      if (model.id === modelId) return model.reasoning;
  const m = modelId.toLowerCase();
  // Heuristik hanya untuk id tak dikenal: seri o (o1/o3/o4 + varian
  // "o1-mini", "o4-mini-2025-...", dst.), GPT-5, dan reasoner.
  // Pola (^|[/:_-])o\d mewajibkan digit setelah "o" agar "openai/...",
  // "olmo", "orca", dsb. tidak salah kena.
  if (/(^|[/:_-])o\d/i.test(modelId)) return true;
  if (
    m.includes("gpt-5") ||
    m.includes("reasoner") ||
    m.includes("reasoning")
  )
    return true;
  return false;
}

export function reasoningToEffort(level: ReasoningLevel): "low" | "medium" | "high" {
  if (level === "fast") return "low";
  if (level === "high") return "high";
  return "medium";
}

/** Instruksi sistem (Bahasa Indonesia) sesuai level reasoning. */
export function reasoningSystemHint(level: ReasoningLevel): string {
  if (level === "fast")
    return "Jawablah secepat dan seringkas mungkin dalam Bahasa Indonesia yang santai. Langsung ke inti, tanpa penjabaran panjang kecuali diminta.";
  if (level === "high")
    return "Berpikirlah mendalam langkah demi langkah sebelum menjawab. Analisis semua sudut pandang, periksa kembali logikamu, lalu jawab dalam Bahasa Indonesia yang jelas dan terstruktur (gunakan heading/list bila membantu). Akurasi lebih penting dari kecepatan.";
  return "Jawablah dengan seimbang dalam Bahasa Indonesia: jelas, cukup detail, dan terstruktur bila perlu.";
}

/** Meta label + deskripsi per level reasoning (ikon digambar di components/icons.tsx). */
export const REASONING_META: Record<
  ReasoningLevel,
  { label: string; desc: string }
> = {
  fast: { label: "Fast", desc: "Cepat & hemat, untuk tanya ringan" },
  medium: { label: "Medium", desc: "Seimbang (default)" },
  high: { label: "High", desc: "Mikir dalam, lambat tapi akurat" },
};

/** Daftar model live dari provider via route /api/models (server-side proxy). */
export async function loadRemoteModels(
  provider: ProviderId,
  apiKey: string,
  customBaseUrl: string
): Promise<ModelOption[]> {
  // Key dikirim via header (bukan query string) agar tak bocor ke access
  // log/proxy. Route server HANYA menerima header x-provider-key
  // (fallback ?apiKey= sengaja dihapus demi keamanan).
  const q = new URLSearchParams({ provider, baseUrl: customBaseUrl });
  const res = await fetch(`/api/models?${q.toString()}`, {
    headers: apiKey ? { "x-provider-key": apiKey } : undefined,
  });
  const json = (await res.json().catch(() => null)) as {
    models?: ModelOption[];
    error?: string;
  } | null;
  if (!res.ok) throw new Error(json?.error ?? `Gagal memuat model (${res.status})`);
  if (!Array.isArray(json?.models) || json!.models!.length === 0)
    throw new Error("Provider tidak mengembalikan daftar model.");
  return json!.models!;
}
