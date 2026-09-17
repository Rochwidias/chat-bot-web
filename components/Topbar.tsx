"use client";

import { useState } from "react";
import { PROVIDERS } from "@/lib/providers";
import { useDismissible } from "@/lib/useDismissible";
import type { ProviderId } from "@/lib/types";
import {
  CheckIcon,
  ChevronDownIcon,
  KeyIcon,
  MenuIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
} from "./icons";

interface Props {
  provider: ProviderId;
  hasKey: boolean;
  theme: "dark" | "light";
  streaming: boolean;
  chatTitle: string | null;
  onProvider: (p: ProviderId) => void;
  onOpenKeys: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

export default function Topbar(props: Props) {
  const [dropOpen, setDropOpen] = useState(false);
  const current = PROVIDERS.find((p) => p.id === props.provider) ?? PROVIDERS[0];

  // Tutup dropdown saat klik di luar / tekan Escape (hook bersama).
  const dropRef = useDismissible(dropOpen, () => setDropOpen(false));

  return (
    <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={props.onToggleSidebar}
          className="shrink-0 cursor-pointer rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--accent)] md:hidden"
          title="Menu riwayat"
          aria-label="Menu riwayat"
        >
          <MenuIcon size={20} />
        </button>
        {/* Breadcrumb */}
        <p className="truncate text-[13px] text-[var(--muted)]">
          Ruang Obrolan <span className="mx-0.5">/</span>{" "}
          <b className="font-semibold text-[var(--ink)]">{props.chatTitle ?? "Chat baru"}</b>
        </p>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {/* Provider — dropdown custom ngikut tema */}
        <div ref={dropRef} className="relative">
          <button
            onClick={() => setDropOpen((v) => !v)}
            title="Pilih provider"
            aria-haspopup="true"
            aria-expanded={dropOpen}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--mid)] outline-none transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
          >
            <span>{current.label}</span>
            <ChevronDownIcon size={14} />
          </button>
          {dropOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)] p-1 shadow-2xl">
              {PROVIDERS.map((p) => {
                const selected = p.id === props.provider;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      props.onProvider(p.id);
                      setDropOpen(false);
                    }}
                    title={p.keyHint}
                    className={`flex w-full cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                      selected
                        ? "bg-[var(--accent-soft)] font-bold text-[var(--accent)]"
                        : "text-[var(--ink)] hover:bg-[var(--surface)]"
                    }`}
                  >
                    <span className="flex-1">{p.label}</span>
                    {selected && <CheckIcon size={14} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={props.onOpenKeys}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-bold outline-none transition-colors ${
            props.hasKey
              ? "text-[var(--mid)]"
              : "text-[var(--accent)]"
          } hover:border-[var(--accent)] hover:text-[var(--ink)]`}
          title="Atur API key"
        >
          <KeyIcon size={13} />
          {props.hasKey ? "Key OK" : "Isi API Key"}
        </button>
        <button
          onClick={props.onOpenSettings}
          className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
          title="Pengaturan tampilan"
          aria-label="Pengaturan tampilan"
        >
          <SettingsIcon size={15} />
        </button>
        <button
          onClick={props.onToggleTheme}
          className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
          title="Ganti gelap / terang"
          aria-label="Ganti tema"
        >
          {props.theme === "dark" ? <SunIcon size={15} /> : <MoonIcon size={15} />}
        </button>
      </div>

      {props.streaming && (
        <p className="w-full text-[11px] text-[var(--muted)]">
          <span className="typing-dot inline-block">●</span>{" "}
          <span className="typing-dot inline-block">●</span>{" "}
          <span className="typing-dot inline-block">●</span> AI sedang menjawab…
        </p>
      )}
    </header>
  );
}
