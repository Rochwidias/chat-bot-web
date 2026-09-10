import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type ChatSession,
  type ProviderKeys,
  type ProviderId,
} from "./types";
import type { ModelOption } from "./providers";

const K_SESSIONS = "cbw.sessions.v1";
const K_KEYS = "cbw.keys.v1";
const K_SETTINGS = "cbw.settings.v1";
const K_MODELS = "cbw.models.v1";

/** Cache daftar model per provider: { at: timestamp, models } */
export type ModelsCache = Partial<
  Record<ProviderId, { at: number; models: ModelOption[] }>
>;

export function loadModelsCache(): ModelsCache {
  if (typeof window === "undefined") return {};
  return safeParse<ModelsCache>(localStorage.getItem(K_MODELS), {});
}

export function saveModelsCache(c: ModelsCache): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(K_MODELS, JSON.stringify(c));
  } catch {
    /* abaikan */
  }
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ---------- Sessions (riwayat chat) ----------
export function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  const list = safeParse<ChatSession[]>(localStorage.getItem(K_SESSIONS), []);
  return Array.isArray(list) ? list : [];
}

/**
 * Simpan sesi. Kalau localStorage penuh (biasanya karena gambar base64),
 * otomatis coba simpan ulang TANPA gambar agar teks riwayat tetap aman.
 */
export function saveSessions(sessions: ChatSession[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(K_SESSIONS, JSON.stringify(sessions));
  } catch {
    try {
      const slim = sessions.map((s) => ({
        ...s,
        messages: s.messages.map((m) => ({ ...m, images: undefined })),
      }));
      localStorage.setItem(K_SESSIONS, JSON.stringify(slim));
    } catch {
      /* ruang habis total: abaikan agar app tidak crash */
    }
  }
}

// ---------- API Keys (BYOK, hanya di browser user) ----------
export function loadKeys(): ProviderKeys {
  if (typeof window === "undefined") return {};
  return safeParse<ProviderKeys>(localStorage.getItem(K_KEYS), {});
}

export function saveKeys(keys: ProviderKeys): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(K_KEYS, JSON.stringify(keys));
  } catch {
    /* abaikan */
  }
}

// ---------- Settings ----------
export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = safeParse<Partial<AppSettings>>(localStorage.getItem(K_SETTINGS), {});
  return { ...DEFAULT_SETTINGS, ...raw };
}

export function saveSettings(s: AppSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(K_SETTINGS, JSON.stringify(s));
  } catch {
    /* abaikan */
  }
}
