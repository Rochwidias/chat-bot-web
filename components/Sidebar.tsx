"use client";

import type { ChatSession } from "@/lib/types";

interface Props {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ sessions, activeId, onSelect, onNew, onDelete, open, onClose }: Props) {
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
        className={`fixed z-30 flex h-full w-72 flex-col border-r border-[var(--surface-border)] bg-[var(--bg)] transition-transform duration-300 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="mb-4 flex items-center gap-2.5 px-1">
            <div className="logo-badge">✦</div>
            <div>
              <p className="text-sm font-bold text-[var(--ice)]">ChatBot Web</p>
              <p className="text-[11px] text-[var(--muted)]">AI Dashboard • BYOK</p>
            </div>
          </div>
          <button
            onClick={() => {
              onNew();
              onClose();
            }}
            className="btn-shine w-full rounded-xl bg-[var(--blue)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            + Chat Baru
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
              Klik <b className="text-[var(--ice)]">+ Chat Baru</b> untuk mulai.
            </p>
          )}
          <ul className="space-y-1">
            {sessions.map((s) => {
              const active = s.id === activeId;
              return (
                <li key={s.id}>
                  <div
                    className={`group flex items-center gap-1 rounded-lg px-2 py-2 text-left text-[13px] transition ${
                      active
                        ? "bg-[var(--blue-hover)] text-[var(--blue)]"
                        : "text-[var(--ice)] hover:bg-[var(--surface)]"
                    }`}
                  >
                    <button
                      onClick={() => {
                        onSelect(s.id);
                        onClose();
                      }}
                      className="min-w-0 flex-1 truncate text-left"
                      title={s.title}
                    >
                      <span className="mr-1.5">💬</span>
                      {s.title}
                    </button>
                    <button
                      onClick={() => onDelete(s.id)}
                      title="Hapus chat"
                      aria-label={`Hapus chat ${s.title}`}
                      className="rounded-md px-1.5 py-0.5 text-[var(--muted)] transition hover:bg-red-500/10 hover:text-red-400 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                    >
                      🗑
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-[var(--surface-border)] p-3 text-[11px] leading-relaxed text-[var(--muted)]">
          🔑 Key tersimpan di browser abang saja.
          <br />
          Tidak dikirim ke server lain selain provider.
        </div>
      </aside>
    </>
  );
}
