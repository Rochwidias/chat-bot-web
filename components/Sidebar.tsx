"use client";

import type { ChatSession } from "@/lib/types";
import { ChatIcon, KeyIcon, LogoIcon, PlusIcon, TrashIcon } from "./icons";

interface Props {
  sessions: ChatSession[];
  activeId: string | null;
  provider: string;
  model: string;
  modelCount: number;
  hasKey: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ sessions, activeId, provider, model, modelCount, hasKey, onSelect, onNew, onDelete, open, onClose }: Props) {
  return (
    <>
      {/* Overlay HP */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed z-30 flex h-full w-72 flex-col border-r border-[var(--border)] bg-[var(--panel)] transition-transform duration-300 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="mb-4 flex items-center gap-2.5 px-1">
            <div className="logo-mark" aria-hidden>
              <LogoIcon size={20} />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-[var(--ink)]">RuangTanya</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">BYOK Chat</p>
            </div>
          </div>
          {/* Status provider: nama + model mono + chip key */}
          <div className="mb-3 rounded-[var(--r)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-xs">
            <div className="flex items-center gap-1.5">
              <b className="text-[12.5px] text-[var(--ink)]">{provider}</b>
              <span className="ml-auto font-mono text-[10.5px] text-[var(--muted)]">v1</span>
            </div>
            <p className="mb-2 mt-1.5 truncate font-mono text-[11px] text-[var(--mid)]" title={model}>
              {model}
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                  hasKey ? "text-[var(--muted)]" : "text-[var(--accent)]"
                }`}
              >
                <KeyIcon size={12} />
                {hasKey ? "Key OK" : "Isi Key"}
              </span>
              <span className="ml-auto font-mono text-[10.5px] text-[var(--muted)]">
                {modelCount} model
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              onNew();
              onClose();
            }}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-ink)] transition hover:opacity-90 active:scale-[0.98]"
          >
            <PlusIcon size={16} />
            Chat Baru
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Riwayat ({sessions.length})
          </p>
          {sessions.length === 0 && (
            <p className="px-2 text-xs leading-relaxed text-[var(--muted)]">
              Belum ada riwayat.
              <br />
              Klik <b className="text-[var(--ink)]">Chat Baru</b> untuk mulai.
            </p>
          )}
          <ul className="space-y-1">
            {sessions.map((s) => {
              const active = s.id === activeId;
              const time = new Date(s.updatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
              return (
                <li key={s.id}>
                  <div
                    className={`group rounded-[10px] px-2.5 py-2 text-left text-[13px] transition ${
                      active
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "text-[var(--ink)] hover:bg-[var(--surface)]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onSelect(s.id);
                          onClose();
                        }}
                        className="inline-flex min-w-0 flex-1 items-center gap-1.5 truncate text-left font-medium"
                        title={s.title}
                      >
                        <span className="shrink-0 text-[var(--muted)]">
                          <ChatIcon size={14} />
                        </span>
                        <span className="min-w-0 flex-1 truncate">{s.title}</span>
                      </button>
                      <button
                        onClick={() => onDelete(s.id)}
                        title="Hapus chat"
                        aria-label={`Hapus chat ${s.title}`}
                        className="rounded-md p-1 text-[var(--muted)] transition hover:bg-red-500/10 hover:text-red-400 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                      >
                        <TrashIcon size={15} />
                      </button>
                    </div>
                    <p className="mt-0.5 pl-6 font-mono text-[10.5px] text-[var(--muted)]">
                      {time} · {s.messages.length} pesan
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-start gap-1.5 border-t border-[var(--border)] p-3 text-[11px] leading-relaxed text-[var(--muted)]">
          <span className="mt-0.5 shrink-0">
            <KeyIcon size={13} />
          </span>
          <span>Key tersimpan di browser saja. Tidak dikirim ke server lain selain provider.</span>
        </div>
      </aside>
    </>
  );
}
