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

export interface ChatMessage {
  id: string;
  role: Role;
  /** Teks yang diketik user / jawaban AI */
  content: string;
  images?: ChatImage[];
  createdAt: number;
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

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
