"use client";

import { useEffect } from "react";
import {
  DENSITIES,
  FONT_SIZES,
  PRESETS,
  RADII,
  SWATCHES,
  type AppearanceSettings,
  type DensityId,
  type FontSizeId,
  type RadiusId,
  type ThemeMode,
  type ThemePresetId,
} from "@/lib/theme";
import { SettingsIcon, XIcon } from "./icons";
import { formatTokens, type GlobalTokens } from "@/lib/types";

interface Props {
  open: boolean;
  value: AppearanceSettings;
  gtok: GlobalTokens;
  onChange: (a: AppearanceSettings) => void;
  onPreset: (p: ThemePresetId) => void;
  onMode: (m: ThemeMode) => void;
  onClose: () => void;
}

function Seg<T extends string>({
  label,
  options,
  active,
  onPick,
}: {
  label: string;
  options: { id: T; label: string }[];
  active: T;
  onPick: (id: T) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
        {label}
      </h3>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onPick(o.id)}
            aria-pressed={active === o.id}
            className={`cursor-pointer rounded-full border px-3 py-[7px] text-[12.5px] font-semibold transition-colors ${
              active === o.id
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                : "border-[var(--border)] bg-transparent text-[var(--ink)] hover:border-[var(--accent)]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AppearanceModal({ open, value, gtok, onChange, onPreset, onMode, onClose }: Props) {
  // Tutup via Escape (overlay click sudah ditangani di bawah).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const accentLower = value.accent.toLowerCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Pengaturan tampilan"
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-[var(--ink)]">
            <SettingsIcon size={17} />
            Pengaturan Tampilan
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
            aria-label="Tutup pengaturan"
          >
            <XIcon size={16} />
          </button>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-[var(--muted)]">
          Setiap perubahan langsung diterapkan dan tersimpan di browser ini.
        </p>

        {/* Preset */}
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
          Preset desain
        </h3>
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onPreset(p.id)}
              aria-pressed={value.preset === p.id}
              className={`flex cursor-pointer items-start gap-2.5 rounded-[14px] border-[1.5px] p-3 text-left transition-shadow ${
                value.preset === p.id
                  ? "border-[var(--accent)] shadow-lg"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]"
              }`}
            >
              <span className="mt-0.5 flex gap-1" aria-hidden>
                {p.dots.map((d) => (
                  <i
                    key={d}
                    className="block h-4 w-4 rounded-full border border-black/20"
                    style={{ background: d }}
                  />
                ))}
              </span>
              <span>
                <b className="block text-[13px] text-[var(--ink)]">{p.name}</b>
                <span className="mt-0.5 block text-[11.5px] leading-[1.55] text-[var(--muted)]">
                  {p.desc}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Aksen */}
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
              Warna aksen
            </h3>
            <div className="flex flex-wrap items-center gap-[7px]" role="group" aria-label="Warna aksen">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  onClick={() => onChange({ ...value, accent: c })}
                  title={c}
                  aria-label={`Aksen ${c}`}
                  aria-pressed={accentLower === c.toLowerCase()}
                  className={`h-[30px] w-[30px] cursor-pointer rounded-full transition-transform ${
                    accentLower === c.toLowerCase() ? "scale-110 ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--bg)]" : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
            <label className="mt-2.5 flex items-center gap-2 text-xs text-[var(--muted)]">
              Custom:{" "}
              <input
                type="color"
                value={accentLower}
                onChange={(e) => onChange({ ...value, accent: e.target.value.toLowerCase() })}
                className="h-[30px] w-[34px] cursor-pointer rounded-lg border border-[var(--border)] bg-transparent p-0.5"
                aria-label="Warna aksen custom"
              />{" "}
              <span className="font-mono">{accentLower}</span>
            </label>
          </div>

          <div className="space-y-4">
            <Seg<ThemeMode>
              label="Mode"
              options={[
                { id: "dark", label: "Gelap" },
                { id: "light", label: "Terang" },
              ]}
              active={value.mode}
              onPick={onMode}
            />
            <Seg<FontSizeId>
              label="Ukuran huruf"
              options={FONT_SIZES.map((f) => ({ id: f.id, label: f.label }))}
              active={value.fontSize}
              onPick={(id) => onChange({ ...value, fontSize: id })}
            />
          </div>

          <Seg<RadiusId>
            label="Sudut"
            options={RADII.map((r) => ({ id: r.id, label: r.label }))}
            active={value.radius}
            onPick={(id) => onChange({ ...value, radius: id })}
          />
          <Seg<DensityId>
            label="Kerapatan"
            options={DENSITIES.map((d) => ({ id: d.id, label: d.label }))}
            active={value.density}
            onPick={(id) => onChange({ ...value, density: id })}
          />
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
          Font: teks Poppins · kode JetBrains Mono. Teks minimal 13,5px dengan
          line-height 1,65–1,7.
        </p>

        {/* Penggunaan token global: dashboard mini */}
        <h3 className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
          Penggunaan token
        </h3>
        <div className="mb-1 rounded-[var(--r)] border border-[var(--border)] bg-[var(--surface)] p-3.5">
          <p
            className="font-mono text-[26px] font-bold leading-none text-[var(--accent)]"
            title={
              gtok.total > 0
                ? `Total ${gtok.total.toLocaleString("id-ID")} token`
                : "Belum ada penggunaan token"
            }
          >
            {formatTokens(gtok.total)}{" "}
            <span className="text-[13px] font-medium">tok</span>
          </p>
          <p className="mb-3 mt-1.5 text-xs text-[var(--muted)]">
            {gtok.total > 0 ? (
              <>
                <b className="font-semibold text-[var(--mid)]">{gtok.sessions}</b> sesi ·{" "}
                <b className="font-semibold text-[var(--mid)]">{gtok.messages}</b> pesan ·
                semua riwayat di browser ini
              </>
            ) : (
              "Mulai chat untuk melihat akumulasi di sini"
            )}
          </p>
          <div
            className="mb-3 flex h-2 overflow-hidden rounded-full bg-[var(--surface2)]"
            role="img"
            aria-label={
              gtok.total > 0
                ? `Proporsi prompt ${formatTokens(gtok.prompt)} dan completion ${formatTokens(gtok.completion)}`
                : "Belum ada data token"
            }
          >
            {gtok.total > 0 ? (
              <>
                <span style={{ flexGrow: gtok.prompt, background: "var(--accent)" }} />
                <span
                  style={{
                    flexGrow: gtok.completion,
                    background: "color-mix(in srgb, var(--accent) 38%, var(--muted))",
                  }}
                />
              </>
            ) : (
              <span className="flex-1 bg-[var(--border)]" />
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[10px] border border-[var(--border)] p-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                ↑ Prompt
              </p>
              <p className="mt-0.5 font-mono text-[14.5px] font-bold text-[var(--ink)]">
                {formatTokens(gtok.prompt)}
              </p>
            </div>
            <div className="rounded-[10px] border border-[var(--border)] p-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                ↓ Completion
              </p>
              <p className="mt-0.5 font-mono text-[14.5px] font-bold text-[var(--ink)]">
                {formatTokens(gtok.completion)}
              </p>
            </div>
            <div className="rounded-[10px] border border-[var(--border)] p-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                Rerata / sesi
              </p>
              <p className="mt-0.5 font-mono text-[14.5px] font-bold text-[var(--accent)]">
                {formatTokens(gtok.sessions > 0 ? Math.round(gtok.total / gtok.sessions) : 0)}
              </p>
            </div>
          </div>
        </div>
        <p className="mb-4 text-[11.5px] leading-relaxed text-[var(--muted)]">
          Dihitung dari angka <code className="font-mono text-[var(--mid)]">usage</code> yang
          dikirim provider tiap jawaban. Provider yang tidak mengirim usage (mis. Ollama
          lokal) terbaca <code className="font-mono text-[var(--mid)]">0</code>.
        </p>

        <div className="mt-4">
          <button
            onClick={onClose}
            className="w-full cursor-pointer rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-ink)] hover:opacity-90"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
