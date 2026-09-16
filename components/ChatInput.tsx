"use client";

import { useEffect, useRef, useState } from "react";
import { REASONING_META, type ModelOption } from "@/lib/providers";
import { compressImage, fileToDataUrl } from "@/lib/images";
import { useDismissible } from "@/lib/useDismissible";
import type { ChatImage, ReasoningLevel } from "@/lib/types";
import { uid } from "@/lib/types";

interface Props {
  streaming: boolean;
  visionOk: boolean;
  models: ModelOption[];
  model: string;
  modelsLoading: boolean;
  reasoning: ReasoningLevel;
  onModel: (m: string) => void;
  onReasoning: (r: ReasoningLevel) => void;
  onRefreshModels: () => void;
  onSend: (text: string, images: ChatImage[]) => void;
  onStop: () => void;
}

const MAX_FILES = 4;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_LEN = 4000;

const LEVELS: ReasoningLevel[] = ["fast", "medium", "high"];

export default function ChatInput({
  streaming,
  visionOk,
  models,
  model,
  modelsLoading,
  reasoning,
  onModel,
  onReasoning,
  onRefreshModels,
  onSend,
  onStop,
}: Props) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<ChatImage[]>([]);
  const [warn, setWarn] = useState("");
  // Dropdown model custom (searchable, ngikut tema)
  const [dropOpen, setDropOpen] = useState(false);
  const [query, setQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Tutup dropdown saat klik di luar / tekan Escape (hook bersama;
  // reset query tiap tutup agar pencarian tak basi).
  const dropRef = useDismissible(dropOpen, () => setDropOpen(false), {
    reset: () => setQuery(""),
  });

  // Fokus kolom search tiap dropdown dibuka.
  useEffect(() => {
    if (dropOpen) searchRef.current?.focus();
  }, [dropOpen]);

  const pick = async (files: FileList | null) => {
    if (!files) return;
    setWarn("");
    const next = [...images];
    for (const f of Array.from(files)) {
      if (next.length >= MAX_FILES) {
        setWarn(`Maksimal ${MAX_FILES} gambar per pesan.`);
        break;
      }
      if (!f.type.startsWith("image/")) {
        setWarn(`"${f.name}" bukan gambar, dilewati.`);
        continue;
      }
      if (f.size > MAX_SIZE) {
        setWarn(`"${f.name}" > 5MB, dilewati.`);
        continue;
      }
      const raw = await fileToDataUrl(f);
      const dataUrl = await compressImage(raw, f.type).catch(() => raw);
      next.push({ id: uid("img"), dataUrl, name: f.name });
    }
    setImages(next);
  };

  const send = () => {
    if (streaming) return;
    if (!text.trim() && images.length === 0) return;
    onSend(text.trim(), images);
    setText("");
    setImages([]);
    setWarn("");
    requestAnimationFrame(() => areaRef.current?.focus());
  };

  // Autosize textarea 1–5 baris (maks 132px, ala mockup).
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [text]);

  const currentLabel = models.find((m) => m.id === model)?.label ?? model;
  const currentVision = models.find((m) => m.id === model)?.vision ?? visionOk;
  const q = query.trim().toLowerCase();
  const filtered = q
    ? models.filter(
        (m) => m.id.toLowerCase().includes(q) || m.label.toLowerCase().includes(q)
      )
    : models;

  return (
    <div className="sticky bottom-0 shrink-0 border-t border-[var(--border)] bg-[var(--panel)]">
      <div className="mx-auto w-full max-w-[760px] px-3 py-2.5 sm:px-3.5 sm:py-3">
        <div className="chat-panel">
        {/* Baris model: tombol dropdown + refresh (ala mockup) */}
        <div className="flex items-center gap-1.5 py-1.5">
          <div ref={dropRef} className="relative min-w-0 flex-1">
            <button
              onClick={() => setDropOpen((v) => !v)}
              title={currentLabel}
              aria-haspopup="listbox"
              aria-expanded={dropOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-2 truncate rounded-lg px-2 py-1.5 text-[12.5px] font-semibold text-[var(--mid)] outline-none transition-colors hover:bg-[var(--surface2)] hover:text-[var(--ink)]"
            >
              <span className="truncate font-mono text-[11.5px]">{currentLabel}</span>
              <span className="flex shrink-0 items-center gap-1.5">
                {currentVision && (
                  <span className="bdg" title="Support gambar">
                    🖼️ vision
                  </span>
                )}
                <svg
                  className={`h-4 w-4 transition-transform ${dropOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>

            {dropOpen && (
              <div className="absolute bottom-full left-0 right-0 z-50 mb-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl">
                {/* Kolom search */}
                <div className="border-b border-[var(--border)] p-2">
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`🔍 Cari dari ${models.length} model…`}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] sm:text-sm"
                  />
                </div>
                {/* Hasil */}
                <div className="max-h-60 overflow-y-auto p-1" role="listbox">
                  {filtered.length === 0 && (
                    <p className="px-3 py-4 text-center text-xs text-[var(--muted)]">
                      Tidak ketemu “{query}”, coba kata lain.
                    </p>
                  )}
                  {filtered.slice(0, 200).map((m) => {
                    const selected = m.id === model;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          onModel(m.id);
                          setDropOpen(false);
                          setQuery("");
                        }}
                        title={m.id}
                        role="option"
                        aria-selected={selected}
                        className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors sm:text-sm ${
                          selected
                            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                            : "text-[var(--ink)] hover:bg-[var(--surface)]"
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate">{m.label}</span>
                        {m.vision && <span title="Support gambar">🖼️</span>}
                        {m.reasoning && <span title="Support reasoning">🧠</span>}
                        {selected && <span className="shrink-0">✓</span>}
                      </button>
                    );
                  })}
                  {filtered.length > 200 && (
                    <p className="px-3 py-2 text-center text-[11px] text-[var(--muted)]">
                      +{filtered.length - 200} lagi — ketik untuk menyaring…
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onRefreshModels}
            disabled={modelsLoading}
            title={`Muat ulang daftar model (${models.length} model)`}
            className="shrink-0 cursor-pointer rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)] disabled:opacity-50"
          >
            <span className={modelsLoading ? "inline-block animate-spin" : ""}>↻</span>
            <span className="ml-1 hidden sm:inline">{models.length}</span>
          </button>
        </div>

        {/* Pill reasoning Fast/Medium/High */}
        <div className="flex flex-wrap items-center gap-1.5 px-0.5 pb-2 text-xs text-[var(--muted)]" role="group" aria-label="Level reasoning">
          {LEVELS.map((lv) => {
            const active = reasoning === lv;
            return (
              <button
                key={lv}
                onClick={() => onReasoning(lv)}
                title={REASONING_META[lv].desc}
                aria-pressed={active}
                className={`cursor-pointer rounded-full border px-3 py-[5px] text-[11.5px] font-semibold transition-colors ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]"
                    : "border-[var(--border)] bg-transparent hover:border-[var(--accent)] hover:text-[var(--ink)]"
                }`}
              >
                {REASONING_META[lv].icon} {REASONING_META[lv].label}
              </button>
            );
          })}
          {!visionOk && (
            <span className="text-[11px] text-yellow-500">
              ⚠️ Model ini kemungkinan tidak support gambar.
            </span>
          )}
        </div>

        <div className="chat-hr" />

        {/* Preview gambar sebelum dikirim (chip ala mockup) */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 px-0.5 pb-2">
            {images.map((img) => (
              <span key={img.id} className="flex items-center gap-1.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface2)] py-1 pl-1 pr-1.5 text-[11.5px] text-[var(--mid)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="h-7 w-[34px] rounded-[7px] object-cover"
                />
                <span className="max-w-[120px] truncate" title={img.name}>{img.name}</span>
                <button
                  onClick={() => setImages(images.filter((i) => i.id !== img.id))}
                  className="cursor-pointer rounded-md px-1 text-[13px] text-[var(--muted)] hover:text-red-400"
                  title="Hapus gambar"
                  aria-label={`Hapus gambar ${img.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {warn && <p className="px-0.5 pb-1 text-[11px] text-red-400">{warn}</p>}

        {/* Bar input: attach + textarea transparan + kirim */}
        <div className="flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void pick(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={streaming}
            className="shrink-0 cursor-pointer rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)] disabled:opacity-30"
            title="Upload gambar (max 4, @5MB)"
          >
            📎
          </button>
          <textarea
            ref={areaRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LEN + 100))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Ketik pesan… (Enter kirim, Shift+Enter baris baru)"
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            className="max-h-[132px] min-w-0 flex-1 resize-none bg-transparent px-0.5 py-2 text-[var(--fs)] leading-[1.65] text-[var(--ink)] outline-none placeholder:text-[var(--muted)] disabled:opacity-50"
          />
          {streaming ? (
            <button
              onClick={onStop}
              className="shrink-0 cursor-pointer rounded-xl bg-red-500 p-2.5 text-white transition-opacity hover:opacity-90"
              title="Hentikan jawaban"
              aria-label="Hentikan jawaban"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={send}
              disabled={!text.trim() && images.length === 0}
              className="shrink-0 cursor-pointer rounded-xl bg-[var(--accent)] px-3.5 py-[11px] text-[15px] font-bold text-[var(--accent-ink)] transition hover:brightness-[1.07] disabled:cursor-not-allowed disabled:opacity-35"
              title="Kirim"
              aria-label="Kirim pesan"
            >
              ➤
            </button>
          )}
        </div>
        </div>
        {/* Microcopy + counter ala mockup */}
        <div className="flex gap-2 px-1 pt-2 font-mono text-[10.5px] text-[var(--muted)]">
          <span>BYOK · key di browser saja</span>
          <span className="ml-auto">{text.length} / {MAX_LEN}</span>
        </div>
      </div>
    </div>
  );
}
