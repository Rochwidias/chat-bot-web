"use client";

import { useState } from "react";
import { PROVIDERS } from "@/lib/providers";
import type { ProviderId, ProviderKeys } from "@/lib/types";
import { CheckIcon, EyeIcon, EyeOffIcon, KeyIcon, XIcon } from "./icons";

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
  const [wasOpen, setWasOpen] = useState(open);

  // Sinkronkan draft dari props tiap modal dibuka (komponen tetap mounted
  // saat tertutup, jadi state lama bisa basi dan tersimpan ulang).
  // Penyesuaian saat render (pola derived-state resmi React), bukan di efek.
  if (open && !wasOpen) {
    setWasOpen(true);
    setDraft(keys);
    setUrl(customBaseUrl);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-[var(--ink)]">
            <KeyIcon size={17} />
            API Key Sendiri (BYOK)
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
            aria-label="Tutup"
          >
            <XIcon size={16} />
          </button>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-[var(--muted)]">
          Tempel key dari provider favoritmu. Key <b className="text-[var(--ink)]">hanya disimpan di browser ini</b>,
          diteruskan langsung ke provider lewat route <code>api/chat</code>.
        </p>

        <div className="space-y-3">
          {PROVIDERS.filter((p) => p.id !== "custom").map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border p-3 ${
                p.id === provider
                  ? "border-[var(--border-accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink)]">
                  {p.label} {p.id === provider && <span className="text-[10px] text-[var(--accent)]">aktif</span>}
                </p>
                <a href={p.docsUrl} target="_blank" rel="noreferrer" className="text-[11px] text-[var(--accent)] hover:underline">
                  ambil key ↗
                </a>
              </div>
              <div className="flex gap-1.5">
                <input
                  type={show[p.id] ? "text" : "password"}
                  value={draft[p.id] ?? ""}
                  // Jangan trim saat ketik (kursor loncat + key ber-spasi rusak);
                  // trim dilakukan sekali saat Simpan.
                  onChange={(e) => setDraft({ ...draft, [p.id]: e.target.value })}
                  placeholder={p.keyPlaceholder}
                  className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 font-mono text-xs text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                />
                <button
                  onClick={() => setShow({ ...show, [p.id]: !show[p.id] })}
                  className="cursor-pointer rounded-lg border border-[var(--border)] p-1.5 text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--ink)]"
                  title={show[p.id] ? "Sembunyikan" : "Tampilkan"}
                  aria-label={show[p.id] ? "Sembunyikan key" : "Tampilkan key"}
                >
                  {show[p.id] ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-[var(--muted)]">{p.keyHint}</p>
            </div>
          ))}

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="mb-1.5 text-[13px] font-semibold text-[var(--ink)]">Custom Base URL</p>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:11434/v1 (kosongkan bila tak dipakai)"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 font-mono text-xs text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
          >
            Batal
          </button>
          <button
            onClick={() => {
              // Normalisasi sekali saat simpan: trim spasi tepi, buang key kosong.
              const cleaned: ProviderKeys = {};
              for (const [k, v] of Object.entries(draft)) {
                const t = (v ?? "").trim();
                if (t) cleaned[k as ProviderId] = t;
              }
              onSave(cleaned, url.trim());
              onClose();
            }}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-ink)] hover:opacity-90"
          >
            <CheckIcon size={15} />
            Simpan Key
          </button>
        </div>
      </div>
    </div>
  );
}
