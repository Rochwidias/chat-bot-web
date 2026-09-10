"use client";

const SUGGESTIONS = [
  { icon: "💡", title: "Jelaskan konsep", desc: "mis. 'Jelaskan API dengan simpel'" },
  { icon: "💻", title: "Bantu coding", desc: "mis. 'Buatkan fetch streaming di JS'" },
  { icon: "🖼️", title: "Analisa gambar", desc: "upload gambar + tanya isinya" },
  { icon: "🧠", title: "High reasoning", desc: "ubah ke High untuk soal sulit" },
];

export default function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center text-[var(--muted)]">
      <span className="mb-4 text-5xl">🤖</span>
      <h2 className="mb-1 text-lg font-semibold text-[var(--ice)]">
        Mulai ngobrol dengan AI
      </h2>
      <p className="max-w-sm text-sm">
        Pilih provider + model di bawah, isi API key sendiri, atur reasoning Fast /
        Medium / High, upload gambar, lalu kirim pesan!
      </p>
      <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            onClick={() => onPick(s.desc)}
            className="glass glass-hover cursor-pointer rounded-2xl p-3.5 text-left"
          >
            <p className="text-lg">{s.icon}</p>
            <p className="mt-1 text-[13px] font-semibold text-[var(--ice)]">{s.title}</p>
            <p className="text-xs text-[var(--muted)]">{s.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
