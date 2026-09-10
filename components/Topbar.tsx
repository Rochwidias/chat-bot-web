"use client";

import { PROVIDERS } from "@/lib/providers";
import type { ProviderId } from "@/lib/types";

interface Props {
  provider: ProviderId;
  hasKey: boolean;
  theme: "dark" | "light";
  streaming: boolean;
  onProvider: (p: ProviderId) => void;
  onOpenKeys: () => void;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

export default function Topbar(props: Props) {
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--surface-border)] bg-[var(--bg)] px-3 py-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={props.onToggleSidebar}
          className="shrink-0 cursor-pointer rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--blue)] md:hidden"
          title="Menu riwayat"
          aria-label="Menu riwayat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="shrink-0 text-lg">🤖</span>
        <h1 className="truncate font-semibold text-[var(--ice)]">ChatBot Web</h1>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {/* Provider */}
        <select
          value={props.provider}
          onChange={(e) => props.onProvider(e.target.value as ProviderId)}
          className="cursor-pointer rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] outline-none transition-colors hover:border-[var(--blue)] hover:text-[var(--ice)]"
          title="Pilih provider"
        >
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        <button
          onClick={props.onOpenKeys}
          className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
            props.hasKey
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
              : "border-yellow-400/30 bg-yellow-500/10 text-yellow-200 hover:opacity-90"
          } cursor-pointer`}
          title="Atur API key"
        >
          {props.hasKey ? "🟢 Key OK" : "🔑 Isi API Key"}
        </button>
        <button
          onClick={props.onToggleTheme}
          className="cursor-pointer rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-[var(--blue)] hover:text-[var(--ice)]"
          title="Ganti gelap / terang"
          aria-label="Ganti tema"
        >
          {props.theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      {props.streaming && (
        <p className="w-full text-[11px] text-[var(--muted)]">
          <span className="typing-dot inline-block">●</span> AI sedang menjawab…
        </p>
      )}
    </header>
  );
}
