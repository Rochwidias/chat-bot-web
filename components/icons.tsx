import type { ReactNode, SVGProps } from "react";

/**
 * Set ikon custom RuangTanya — digambar sendiri sebagai SVG inline,
 * TANPA emoji, TANPA library ikon, TANPA font tambahan.
 * - Gaya "Ink tipis": stroke 1.8px, round caps/joins, ikut warna
 *   teks via currentColor (otomatis ngikut tema).
 * - Server-safe (tanpa "use client"): murni SVG statis.
 */

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

function Base({
  size = 18,
  children,
  ...rest
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Ikon terisi (solid) — untuk glyph kecil yang butuh kontras penuh. */
function Solid({
  size = 18,
  children,
  ...rest
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Logo RuangTanya — bubble + titik, dipakai di dalam kotak .logo-mark
 *  (kotak tinta via CSS) & avatar AI. */
export function LogoIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.36-4.1-1L3 20l1.1-4.4A8.5 8.5 0 1 1 21 11.5z" />
      <circle cx="12" cy="11.5" r="1.4" fill="currentColor" stroke="none" />
    </Base>
  );
}

/** Panah ke atas — tombol kirim. */
export function SendIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </Base>
  );
}

/** Kotak berhenti — tombol hentikan streaming. */
export function StopIcon({ size, ...rest }: IconProps) {
  return (
    <Solid size={size} {...rest}>
      <rect x="6" y="6" width="12" height="12" rx="2.5" />
    </Solid>
  );
}

/** Penjepit kertas — tombol upload gambar. */
export function AttachIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </Base>
  );
}

/** Dua kotak bertumpuk — tombol salin. */
export function CopyIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Base>
  );
}

/** Kunci — status API key. */
export function KeyIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </Base>
  );
}

/** Slider — tombol pengaturan tampilan. */
export function SettingsIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </Base>
  );
}

/** Matahari — mode terang. */
export function SunIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </Base>
  );
}

/** Bulan — mode gelap. */
export function MoonIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Base>
  );
}

/** Tiga garis — tombol menu sidebar (HP). */
export function MenuIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </Base>
  );
}

/** Plus — tombol chat baru. */
export function PlusIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Base>
  );
}

/** Tempat sampah — tombol hapus chat. */
export function TrashIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </Base>
  );
}

/** Balon chat — item riwayat. */
export function ChatIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Base>
  );
}

/** Petir — reasoning Fast. */
export function ZapIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </Base>
  );
}

/** Denyut — reasoning Medium. */
export function ActivityIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </Base>
  );
}

/** Lapis — reasoning High. */
export function LayersIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </Base>
  );
}

/** Gambar — badge vision / saran analisa gambar. */
export function ImageIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </Base>
  );
}

/** CPU — badge reasoning di daftar model. */
export function CpuIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </Base>
  );
}

/** Panah bawah — chevron dropdown. */
export function ChevronDownIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <polyline points="6 9 12 15 18 9" />
    </Base>
  );
}

/** Centang — item terpilih. */
export function CheckIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <polyline points="20 6 9 17 4 12" />
    </Base>
  );
}

/** Silang — tombol tutup / hapus gambar. */
export function XIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Base>
  );
}

/** Mata — tampilkan key. */
export function EyeIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </Base>
  );
}

/** Mata tercoret — sembunyikan key. */
export function EyeOffIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </Base>
  );
}

/** Panah melingkar — muat ulang daftar model. */
export function RefreshIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </Base>
  );
}

/** Segitiga peringatan — banner error / model tanpa vision. */
export function AlertIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Base>
  );
}

/** Bohlam — saran "Jelaskan konsep". */
export function BulbIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </Base>
  );
}

/** Kurung kode — saran "Bantu coding". */
export function CodeIcon({ size, ...rest }: IconProps) {
  return (
    <Base size={size} {...rest}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </Base>
  );
}
