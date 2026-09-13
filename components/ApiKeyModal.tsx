"use client";

import { useEffect, useState } from "react";
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

  // Sinkronkan draft dari props tiap modal dibuka (komponen tetap mounted
  // saat tertutup, jadi state lama bisa basi dan tersimpan ulang).
  useEffect(() => {
    if (open) {
      setDraft(keys);
      setUrl(customBaseUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--surface-border)] bg-[var(--bg)] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--ice)]">🔑 API Key Sendiri (BYOK)</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg px-2 py-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ice)]"
          >
            ✕
          </button>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-[var(--muted)]">
          Tempel key dari provider favoritmu. Key <b className="text-[var(--ice)]">hanya disimpan di browser ini</b>,
          diteruskan langsung ke provider lewat route <code>api/chat</code>.
        </p>

        <div className="space-y-3">
          {PROVIDERS.filter((p) => p.id !== "custom").map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border p-3 ${
                p.id === provider
                  ? "border-[var(--border-accent)] bg-[var(--blue-muted)]"
                  : "border-[var(--surface-border)] bg-[var(--surface)]"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[var(--ice)]">
                  {p.label} {p.id === provider && <span className="text-[10px] text-[var(--blue)]">● aktif</span>}
                </p>
                <a href={p.docsUrl} target="_blank" rel="noreferrer" className="text-[11px] text-[var(--blue)] hover:underline">
                  ambil key ↗
                </a>
              </div>
              <div className="flex gap-1.5">
                <input
                  type={show[p.id] ? "text" : "password"}
                  value={draft[p.id] ?? ""}
                  onChange={(e) => setDraft({ ...draft, [p.id]: e.target.value.trim() })}
                  placeholder={p.keyPlaceholder}
                  className="min-w-0 flex-1 rounded-lg border border-[var(--surface-border)] bg-[var(--bg)] px-2.5 py-1.5 font-mono text-xs text-[var(--ice)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--blue)]"
                />
                <button
                  onClick={() => setShow({ ...show, [p.id]: !show[p.id] })}
                  className="cursor-pointer rounded-lg border border-[var(--surface-border)] px-2 text-xs text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ice)]"
                >
                  {show[p.id] ? "🙈" : "👁"}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-[var(--muted)]">{p.keyHint}</p>
            </div>
          ))}

          <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-3">
            <p className="mb-1.5 text-[13px] font-semibold text-[var(--ice)]">Custom Base URL</p>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value.trim())}
              placeholder="http://localhost:11434/v1 (kosongkan bila tak dipakai)"
              className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--bg)] px-2.5 py-1.5 font-mono text-xs text-[var(--ice)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--blue)]"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-[var(--surface-border)] px-4 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ice)]"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onSave(draft, url);
              onClose();
            }}
            className="flex-1 cursor-pointer rounded-xl bg-[var(--blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Simpan Key
          </button>
        </div>
      </div>
    </div>
  );
}
