"use client";

import { motion } from "framer-motion";

const SUGGESTIONS = [
  { icon: "💡", title: "Jelaskan konsep", desc: "mis. 'Jelaskan API dengan simpel'" },
  { icon: "💻", title: "Bantu coding", desc: "mis. 'Buatkan fetch streaming di JS'" },
  { icon: "🖼️", title: "Analisa gambar", desc: "upload gambar + tanya isinya" },
  { icon: "🧠", title: "High reasoning", desc: "ubah ke High untuk soal sulit" },
];

export default function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-3xl shadow-2xl shadow-fuchsia-500/30"
      >
        ✦
      </motion.div>
      <motion.h1
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-cyan-200 bg-clip-text text-2xl font-bold text-transparent md:text-3xl"
      >
        Halo bang, mau tanya apa hari ini?
      </motion.h1>
      <p className="mt-2 max-w-md text-[13px] text-zinc-400">
        Pilih provider + model di atas, isi API key sendiri, atur reasoning Fast/Medium/High, lalu mulai chat. Bisa
        juga upload gambar + ketikan sekaligus.
      </p>
      <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s.title}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 * i }}
            onClick={() => onPick(s.desc)}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-left transition hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5"
          >
            <p className="text-lg">{s.icon}</p>
            <p className="mt-1 text-[13px] font-semibold text-zinc-100">{s.title}</p>
            <p className="text-xs text-zinc-400">{s.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
