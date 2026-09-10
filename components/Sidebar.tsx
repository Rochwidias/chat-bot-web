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
        className={`fixed z-30 flex h-full w-72 flex-col border-r border-white/10 bg-zinc-950/95 backdrop-blur transition-transform duration-300 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="mb-4 flex items-center gap-2.5 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-lg font-bold text-white shadow-lg shadow-fuchsia-500/30">
              ✦
            </div>
            <div>
              <p className="text-sm font-bold text-white">ChatBot Web</p>
              <p className="text-[11px] text-zinc-400">AI Dashboard • BYOK</p>
            </div>
          </div>
          <button
            onClick={() => {
              onNew();
              onClose();
            }}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-600/25 transition hover:brightness-110 active:scale-[0.98]"
          >
            + Chat Baru
          </button>
        </div>

        <div className="nice-scroll flex-1 overflow-y-auto px-3 pb-3">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Riwayat ({sessions.length})
          </p>
          {sessions.length === 0 && (
            <p className="px-2 text-xs leading-relaxed text-zinc-500">
              Belum ada riwayat.
              <br />
              Klik <b className="text-zinc-300">+ Chat Baru</b> untuk mulai.
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
                        ? "bg-white/10 text-white"
                        : "text-zinc-300 hover:bg-white/5"
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
                      className="rounded-md px-1.5 py-0.5 text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-300"
                    >
                      🗑
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-white/10 p-3 text-[11px] leading-relaxed text-zinc-500">
          🔑 Key tersimpan di browser abang saja.
          <br />
          Tidak dikirim ke server lain selain provider.
        </div>
      </aside>
    </>
  );
}
