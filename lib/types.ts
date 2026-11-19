export type Role = "user" | "assistant" | "system";

export type ProviderId =
  | "openai"
  | "openrouter"
  | "gemini"
  | "deepseek"
  | "custom";

export type ReasoningLevel = "fast" | "medium" | "high";

export interface ChatImage {
  id: string;
  /** dataURL base64, mis. data:image/png;base64,.... */
  dataUrl: string;
  name: string;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface ChatMessage {
  id: string;
  role: Role;
  /** Teks yang diketik user / jawaban AI */
  content: string;
  images?: ChatImage[];
  createdAt: number;
  /** Pemakaian token jawaban AI (diisi dari event usage SSE). */
  usage?: TokenUsage;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ProviderKeys {
  openai?: string;
  openrouter?: string;
  gemini?: string;
  deepseek?: string;
  custom?: string;
}

export interface AppSettings {
  provider: ProviderId;
  model: string;
  reasoning: ReasoningLevel;
  customBaseUrl: string;
  theme: "dark" | "light";
}

export const DEFAULT_SETTINGS: AppSettings = {
  provider: "openai",
  model: "gpt-4o-mini",
  reasoning: "medium",
  customBaseUrl: "",
  theme: "dark",
};

/** Format ringkas jumlah token: 0 → "0", 1234 → "1,2k", 2.5jt → "2,5M". */
export function formatTokens(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n < 1000) return String(Math.floor(n));
  if (n < 1_000_000) {
    const v = n / 1000;
    return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(".", ",")}k`;
  }
  const v = n / 1_000_000;
  return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(".", ",")}M`;
}

/** Total token satu sesi (jumlahkan usage tiap pesan AI). */
export function sessionTokens(s: ChatSession): number {
  return s.messages.reduce((a, m) => a + (m.usage?.total || 0), 0);
}

export interface GlobalTokens {
  prompt: number;
  completion: number;
  total: number;
  sessions: number;
  messages: number;
}

/** Agregat token seluruh sesi (untuk ringkasan global + dashboard mini). */
export function globalTokens(sessions: ChatSession[]): GlobalTokens {
  let prompt = 0;
  let completion = 0;
  let messages = 0;
  for (const s of sessions) {
    messages += s.messages.length;
    for (const m of s.messages) {
      if (!m.usage) continue;
      prompt += m.usage.prompt || 0;
      completion += m.usage.completion || 0;
    }
  }
  return { prompt, completion, total: prompt + completion, sessions: sessions.length, messages };
}

export function uid(prefix = "id"): string {  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `${prefix}_${crypto.randomUUID()}`;
    }
  } catch {
    /* fallback di bawah */
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}${Math.random().toString(36).slice(2, 6)}`;
}
