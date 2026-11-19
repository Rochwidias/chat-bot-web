"use client";

import { BulbIcon, CodeIcon, CpuIcon, ImageIcon, LogoIcon } from "./icons";

const SUGGESTIONS = [
  { Icon: BulbIcon, title: "Jelaskan konsep", desc: "mis. 'Jelaskan API dengan simpel'" },
  { Icon: CodeIcon, title: "Bantu coding", desc: "mis. 'Buatkan fetch streaming di JS'" },
  { Icon: ImageIcon, title: "Analisa gambar", desc: "upload gambar + tanya isinya" },
  { Icon: CpuIcon, title: "High reasoning", desc: "ubah ke High untuk soal sulit" },
];

export default function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center text-[var(--muted)]">
      <div className="logo-mark logo-mark-lg mb-3" aria-hidden>
        <LogoIcon size={28} />
      </div>
      <h2 className="font-display mb-1 text-[19px] font-bold text-[var(--ink)]">
        Mulai ngobrol dengan AI
      </h2>
      <p className="max-w-[46ch] text-[13.5px] leading-[1.7]">
        Pilih provider + model di bawah, isi API key sendiri, atur reasoning Fast /
        Medium / High, upload gambar, lalu kirim pesan!
      </p>
      <div className="mt-[18px] grid w-full max-w-[640px] grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            onClick={() => onPick(s.desc)}
            className="glass flex cursor-pointer gap-[11px] rounded-[var(--r)] p-[13px_14px] text-left transition-colors hover:border-[var(--border-accent)]"
          >
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[var(--accent-soft)] text-[var(--accent)]" aria-hidden>
              <s.Icon size={18} />
            </span>
            <span>
              <b className="block text-[13px] text-[var(--ink)]">{s.title}</b>
              <span className="text-xs leading-[1.55] text-[var(--muted)]">{s.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
