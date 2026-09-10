"use client";

import { PROVIDERS, REASONING_META, getProvider } from "@/lib/providers";
import type { ProviderId, ReasoningLevel } from "@/lib/types";

interface Props {
  provider: ProviderId;
  model: string;
  reasoning: ReasoningLevel;
  customModel: boolean;
  customModelText: string;
  hasKey: boolean;
  theme: "dark" | "light";
  streaming: boolean;
  onProvider: (p: ProviderId) => void;
  onModel: (m: string) => void;
  onCustomModelText: (v: string) => void;
  onReasoning: (r: ReasoningLevel) => void;
  onOpenKeys: () => void;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

const LEVELS: ReasoningLevel[] = ["fast", "medium", "high"];

export default function Topbar(props: Props) {
  const meta = getProvider(props.provider);

  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-zinc-950/80 px-3 py-2.5 backdrop-blur md:px-5">
      <button
        onClick={props.onToggleSidebar}
        className="rounded-lg px-2.5 py-1.5 text-zinc-300 hover:bg-white/10 md:hidden"
        title="Menu"
      >
        ☰
      </button>

      {/* Provider */}
      <select
        value={props.provider}
        onChange={(e) => props.onProvider(e.target.value as ProviderId)}
        className="rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 outline-none focus:border-fuchsia-500"
        title="Pilih provider"
      >
        {PROVIDERS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>

      {/* Model */}
      {props.provider === "custom" || props.customModel ? (
        <input
          value={props.customModelText}
          onChange={(e) => {
            props.onCustomModelText(e.target.value);
            props.onModel(e.target.value);
          }}
          placeholder="ketik id model…"
          className="w-40 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-fuchsia-500"
        />
      ) : (
        <select
          value={props.model}
          onChange={(e) => props.onModel(e.target.value)}
          className="max-w-52 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 outline-none focus:border-fuchsia-500"
          title="Pilih model"
        >
          {meta.models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      )}

      {/* Reasoning Fast/Medium/High */}
      <div
        className="flex items-center rounded-lg border border-white/10 bg-zinc-900 p-0.5"
        title="Level penalaran: Fast cepat, High mikir dalam"
      >
        {LEVELS.map((lv) => {
          const active = props.reasoning === lv;
          return (
            <button
              key={lv}
              onClick={() => props.onReasoning(lv)}
              title={`${REASONING_META[lv].label} — ${REASONING_META[lv].desc}`}
              className={`rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                active
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {REASONING_META[lv].icon} {REASONING_META[lv].label}
            </button>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={props.onOpenKeys}
          className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
            props.hasKey
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:brightness-110"
          }`}
          title="Atur API key"
        >
          {props.hasKey ? "🟢 Key OK" : "🔑 Isi API Key"}
        </button>
        <button
          onClick={props.onToggleTheme}
          className="rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
          title="Ganti gelap / terang"
        >
          {props.theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      {props.streaming && (
        <p className="w-full text-[11px] text-fuchsia-300/90">
          <span className="typing-dot inline-block">●</span> AI sedang menjawab…
        </p>
      )}
    </header>
  );
}
