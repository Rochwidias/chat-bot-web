"use client";

import { useState } from "react";
import { PROVIDERS } from "@/lib/providers";
import type { ProviderId, ProviderKeys } from "@/lib/types";

interface Props {
  open: boolean;
  provider: ProviderId;
  keys: ProviderKeys;
  customBaseUrl: string;
  onClose: () => void;
  onSave: (keys: ProviderKeys, customBaseUrl: string) => void;
}

export default function ApiKeyModal({ open, provider, keys, customBaseUrl, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<ProviderKeys>(keys);
  const [url, setUrl] = useState(customBaseUrl);
  const [show, setShow] = useState<Record<string, boolean>>({});

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="nice-scroll max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">🔑 API Key Sendiri (BYOK)</h2>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-white/10 hover:text-white">
            ✕
          </button>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-zinc-400">
          Tempel key dari provider favoritmu. Key <b className="text-zinc-200">hanya disimpan di browser ini</b>,
          diteruskan langsung ke provider lewat route <code>/api/chat</code>.
        </p>

        <div className="space-y-3">
          {PROVIDERS.filter((p) => p.id !== "custom").map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border p-3 ${p.id === provider ? "border-fuchsia-500/50 bg-fuchsia-500/5" : "border-white/10 bg-white/[0.02]"}`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-zinc-100">
                  {p.label} {p.id === provider && <span className="text-[10px] text-fuchsia-300">● aktif</span>}
                </p>
                <a href={p.docsUrl} target="_blank" rel="noreferrer" className="text-[11px] text-cyan-300 hover:underline">
                  ambil key ↗
                </a>
              </div>
              <div className="flex gap-1.5">
                <input
                  type={show[p.id] ? "text" : "password"}
                  value={draft[p.id] ?? ""}
                  onChange={(e) => setDraft({ ...draft, [p.id]: e.target.value.trim() })}
                  placeholder={p.keyPlaceholder}
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 font-mono text-xs text-zinc-100 outline-none focus:border-fuchsia-500"
                />
                <button
                  onClick={() => setShow({ ...show, [p.id]: !show[p.id] })}
                  className="rounded-lg border border-white/10 px-2 text-xs text-zinc-300 hover:bg-white/10"
                >
                  {show[p.id] ? "🙈" : "👁"}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">{p.keyHint}</p>
            </div>
          ))}

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <p className="mb-1.5 text-[13px] font-semibold text-zinc-100">Custom Base URL</p>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value.trim())}
              placeholder="http://localhost:11434/v1 (kosongkan bila tak dipakai)"
              className="w-full rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 font-mono text-xs text-zinc-100 outline-none focus:border-fuchsia-500"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onSave(draft, url);
              onClose();
            }}
            className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
          >
            Simpan Key
          </button>
        </div>
      </div>
    </div>
  );
}
