/**
 * Tema tampilan (Settings → Tampilan) — hasil implementasi mockup redesign-v2.
 * Tiga preset beda kepribadian di atas bahasa yang sama (panel + orb + mono):
 * - komando: command-deck gelap, presisi, orb konik (default, evolusi aman)
 * - senja:   plum ekspresif + aksen koral, mesh senja (paling berani)
 * - kertas:  terang dulu, pesan AI model baris tanpa bubble (paling tenang)
 *
 * Struktur & props komponen tetap sama; yang berubah hanya token warna +
 * layout via CSS variables. Display tetap Poppins (tanpa font baru),
 * kode tetap JetBrains Mono.
 */

export type ThemePresetId = "komando" | "senja" | "kertas";
export type ThemeMode = "dark" | "light";
export type FontSizeId = "S" | "M" | "L";
export type RadiusId = "sharp" | "medium" | "round";
export type DensityId = "comfortable" | "compact";

export interface AppearanceSettings {
  preset: ThemePresetId;
  mode: ThemeMode;
  /** Aksen efektif (hex 6-digit). Selalu terisi = default preset saat itu. */
  accent: string;
  fontSize: FontSizeId;
  radius: RadiusId;
  density: DensityId;
}

export interface PresetVars {
  "--bg": string;
  "--panel": string;
  "--card": string;
  "--ink": string;
  "--mid": string;
  "--muted": string;
  "--surface": string;
  "--surface2": string;
  "--border": string;
  "--accent": string;
  "--code": string;
}

interface PresetDef {
  id: ThemePresetId;
  name: string;
  desc: string;
  /** 3 titik warna untuk kartu preset */
  dots: [string, string, string];
  defaultMode: ThemeMode;
  rows: boolean;
  dark: PresetVars;
  light: PresetVars;
}

export const PRESETS: PresetDef[] = [
  {
    id: "komando",
    name: "A · Komando Cyan",
    desc: "Command-deck gelap, presisi, orb konik. Evolusi aman dari desain sekarang.",
    dots: ["#0b0e12", "#00cfff", "#7c5cff"],
    defaultMode: "dark",
    rows: false,
    dark: {
      "--bg": "#0b0e12",
      "--panel": "#0e1319",
      "--card": "#141b24",
      "--ink": "#f2f6f9",
      "--mid": "#c9d2db",
      "--muted": "#9aa6b2",
      "--surface": "rgba(255,255,255,.055)",
      "--surface2": "rgba(255,255,255,.1)",
      "--border": "rgba(255,255,255,.09)",
      "--accent": "#00cfff",
      "--code": "#0c1116",
    },
    light: {
      "--bg": "#f2f5f7",
      "--panel": "#ffffff",
      "--card": "#ffffff",
      "--ink": "#10151a",
      "--mid": "#2b333b",
      "--muted": "#5b6672",
      "--surface": "rgba(16,24,32,.05)",
      "--surface2": "#ffffff",
      "--border": "rgba(16,24,32,.1)",
      "--accent": "#008cb4",
      "--code": "#101820",
    },
  },
  {
    id: "senja",
    name: "B · Senja Botjawir",
    desc: "Plum ekspresif + aksen koral, kartu stiker, mesh senja. Paling berani.",
    dots: ["#140f1c", "#ff8a5c", "#7c5cff"],
    defaultMode: "dark",
    rows: false,
    dark: {
      "--bg": "#140f1c",
      "--panel": "#1a1326",
      "--card": "#231a34",
      "--ink": "#f8f1e9",
      "--mid": "#d9cec2",
      "--muted": "#ab9ebc",
      "--surface": "rgba(255,255,255,.06)",
      "--surface2": "rgba(255,255,255,.11)",
      "--border": "rgba(255,255,255,.1)",
      "--accent": "#ff8a5c",
      "--code": "#1c1226",
    },
    light: {
      "--bg": "#fbf3ec",
      "--panel": "#fffdf9",
      "--card": "#ffffff",
      "--ink": "#231a12",
      "--mid": "#4a3f33",
      "--muted": "#7d6f61",
      "--surface": "rgba(35,26,18,.05)",
      "--surface2": "#ffffff",
      "--border": "rgba(35,26,18,.11)",
      "--accent": "#e05b2b",
      "--code": "#20140c",
    },
  },
  {
    id: "kertas",
    name: "C · Kertas Fokus",
    desc: "Terang dulu, pesan AI model baris (tanpa bubble), hirarki tipografi. Paling tenang & terbaca.",
    dots: ["#f6f4ee", "#0e7c5b", "#181510"],
    defaultMode: "light",
    rows: true,
    dark: {
      "--bg": "#101210",
      "--panel": "#151714",
      "--card": "#1b1e1a",
      "--ink": "#f0efe8",
      "--mid": "#cfccc0",
      "--muted": "#a3a097",
      "--surface": "rgba(255,255,255,.055)",
      "--surface2": "rgba(255,255,255,.1)",
      "--border": "rgba(255,255,255,.09)",
      "--accent": "#3dd598",
      "--code": "#0e120e",
    },
    light: {
      "--bg": "#f6f4ee",
      "--panel": "#ffffff",
      "--card": "#ffffff",
      "--ink": "#181510",
      "--mid": "#33302a",
      "--muted": "#6b655a",
      "--surface": "rgba(24,21,16,.045)",
      "--surface2": "#ffffff",
      "--border": "rgba(24,21,16,.12)",
      "--accent": "#0e7c5b",
      "--code": "#101613",
    },
  },
];

export const SWATCHES = [
  "#00cfff",
  "#7c5cff",
  "#3b82f6",
  "#22c55e",
  "#ffb020",
  "#ff8a5c",
  "#f472b6",
  "#e5e7eb",
];

export const FONT_SIZES: { id: FontSizeId; label: string; px: string }[] = [
  { id: "S", label: "S · Rapat", px: "13.5px" },
  { id: "M", label: "M · Seimbang", px: "14.5px" },
  { id: "L", label: "L · Lega", px: "16px" },
];

export const RADII: { id: RadiusId; label: string; px: string }[] = [
  { id: "sharp", label: "▢ Lancip", px: "9px" },
  { id: "medium", label: "▤ Sedang", px: "14px" },
  { id: "round", label: "⬤ Bulat", px: "20px" },
];

export const DENSITIES: { id: DensityId; label: string }[] = [
  { id: "comfortable", label: "Nyaman" },
  { id: "compact", label: "Ringkas" },
];

export function getPreset(id: ThemePresetId): PresetDef {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  preset: "komando",
  mode: "dark",
  accent: "#00cfff",
  fontSize: "M",
  radius: "medium",
  density: "comfortable",
};

/** Normalisasi hasil parse localStorage (data lama / korup → fallback aman). */
export function normalizeAppearance(
  raw: Partial<AppearanceSettings> | null | undefined,
  fallbackMode?: ThemeMode
): AppearanceSettings {
  const preset: ThemePresetId =
    raw?.preset === "senja" || raw?.preset === "kertas" ? raw.preset : "komando";
  const def = getPreset(preset);
  const mode: ThemeMode =
    raw?.mode === "light" || raw?.mode === "dark"
      ? raw.mode
      : (fallbackMode ?? def.defaultMode);
  const accent =
    typeof raw?.accent === "string" && /^#[0-9a-fA-F]{6}$/.test(raw.accent)
      ? raw.accent.toLowerCase()
      : def[mode]["--accent"];
  return {
    preset,
    mode,
    accent,
    fontSize: raw?.fontSize === "S" || raw?.fontSize === "L" ? raw.fontSize : "M",
    radius:
      raw?.radius === "sharp" || raw?.radius === "round" ? raw.radius : "medium",
    density: raw?.density === "compact" ? "compact" : "comfortable",
  };
}

/** Ganti preset → ikut mode bawaan preset + aksen default-nya (ala mockup). */
export function withPreset(
  a: AppearanceSettings,
  preset: ThemePresetId
): AppearanceSettings {
  const def = getPreset(preset);
  return {
    ...a,
    preset,
    mode: def.defaultMode,
    accent: def[def.defaultMode]["--accent"],
  };
}

/** Ganti mode → aksen ikut default preset di mode itu (ala mockup). */
export function withMode(a: AppearanceSettings, mode: ThemeMode): AppearanceSettings {
  return { ...a, mode, accent: getPreset(a.preset)[mode]["--accent"] };
}

export function fontSizePx(id: FontSizeId): string {
  return FONT_SIZES.find((f) => f.id === id)?.px ?? "14.5px";
}

export function radiusPx(id: RadiusId): string {
  return RADII.find((r) => r.id === id)?.px ?? "14px";
}

// ---------- Util warna aksen (disamakan dengan mockup) ----------

/** Luminance relatif 0–1 untuk hex 6-digit. */
export function hexLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** Warna teks di atas aksen: terang → tinta gelap, gelap → putih. */
export function accentInk(hex: string): string {
  return hexLuminance(hex) > 0.45 ? "#08222c" : "#ffffff";
}

/** Terapkan appearance ke <html>: class preset/mode/density + var aksen/ukuran/radius. */
export function applyAppearance(a: AppearanceSettings): void {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.classList.remove("preset-komando", "preset-senja", "preset-kertas");
  el.classList.add(`preset-${a.preset}`);
  el.classList.toggle("light", a.mode === "light");
  el.classList.toggle("density-compact", a.density === "compact");
  el.style.setProperty("--accent", a.accent);
  el.style.setProperty("--accent-soft", `${a.accent}1f`);
  el.style.setProperty("--accent-glow", `${a.accent}40`);
  el.style.setProperty("--accent-ink", accentInk(a.accent));
  el.style.setProperty("--fs", fontSizePx(a.fontSize));
  el.style.setProperty("--r", radiusPx(a.radius));
}

/**
 * Script anti-flicker untuk <head>: baca cbw.theme.v1 (+ fallback theme dari
 * cbw.settings.v1) lalu pasang class + var SEBELUM paint. Disimpan sebagai
 * string di sini agar layout.tsx dan test memakai sumber yang sama.
 */
export function themeInitScript(): string {
  return `(function(){try{var t=null;try{t=JSON.parse(localStorage.getItem("cbw.theme.v1")||"null")}catch(e){}var s=null;try{s=JSON.parse(localStorage.getItem("cbw.settings.v1")||"null")}catch(e){}var p=(t&&["komando","senja","kertas"].indexOf(t.preset)>-1)?t.preset:"komando";var m=(t&&(t.mode==="light"||t.mode==="dark"))?t.mode:((s&&s.theme==="light")?"light":"dark");var ax=(t&&/^#[0-9a-fA-F]{6}$/.test(t.accent||""))?t.accent.toLowerCase():(p==="senja"?(m==="light"?"#e05b2b":"#ff8a5c"):p==="kertas"?(m==="light"?"#0e7c5b":"#3dd598"):(m==="light"?"#008cb4":"#00cfff"));var fs=(t&&t.fontSize==="S")?"13.5px":(t&&t.fontSize==="L")?"16px":"14.5px";var rr=(t&&t.radius==="sharp")?"9px":(t&&t.radius==="round")?"20px":"14px";var h=document.documentElement;h.classList.add("preset-"+p);if(m==="light")h.classList.add("light");if(t&&t.density==="compact")h.classList.add("density-compact");function lum(x){var r=parseInt(x.slice(1,3),16)/255,g=parseInt(x.slice(3,5),16)/255,b=parseInt(x.slice(5,7),16)/255;function f(c){return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4)}return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)}h.style.setProperty("--accent",ax);h.style.setProperty("--accent-soft",ax+"1f");h.style.setProperty("--accent-glow",ax+"40");h.style.setProperty("--accent-ink",lum(ax)>0.45?"#08222c":"#ffffff");h.style.setProperty("--fs",fs);h.style.setProperty("--r",rr)}catch(e){}})();`;
}
