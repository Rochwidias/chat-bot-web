"use client";

import { useRef, useState } from "react";
import { REASONING_META, type ModelOption } from "@/lib/providers";
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
const MAX_IMAGE_DIMENSION = 1600;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/** Kompres gambar via canvas (disamakan dengan personal-web). */
function compressImage(dataUrl: string, mime: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas tidak tersedia."));
        ctx.drawImage(img, 0, 0, w, h);

        if (mime === "image/png" || mime === "image/webp") {
          const pixels = ctx.getImageData(0, 0, w, h).data;
          for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 255) {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, w, h);
              ctx.drawImage(img, 0, 0, w, h);
              break;
            }
          }
        }

        const out = canvas.toDataURL("image/jpeg", 0.85);
        resolve(out.length < dataUrl.length ? out : dataUrl);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Gagal memproses gambar."));
    img.src = dataUrl;
  });
}

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
  const fileRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

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

  const currentLabel = models.find((m) => m.id === model)?.label ?? model;

  return (
    <div className="sticky bottom-0 shrink-0 border-t border-[var(--surface-border)] bg-[var(--bg)]">
      <div className="mx-auto w-full max-w-4xl px-3 sm:px-4">
        {/* Dropdown model — ala personal-web + tombol refresh daftar live */}
        <div className="flex items-center gap-1.5 py-2">
          <select
            value={models.some((m) => m.id === model) ? model : ""}
            onChange={(e) => onModel(e.target.value)}
            className="min-w-0 flex-1 cursor-pointer truncate rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--muted)] outline-none transition-colors hover:border-[var(--blue)] hover:text-[var(--ice)] sm:text-sm"
            title={currentLabel}
          >
            {!models.some((m) => m.id === model) && (
              <option value="">{currentLabel} (custom)</option>
            )}
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
                {model === m.id ? " ✓" : ""}
              </option>
            ))}
          </select>
          <button
            onClick={onRefreshModels}
            disabled={modelsLoading}
            title={`Muat ulang daftar model (${models.length} model)`}
            className="shrink-0 cursor-pointer rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-[var(--blue)] hover:text-[var(--ice)] disabled:opacity-50"
          >
            <span className={modelsLoading ? "inline-block animate-spin" : ""}>↻</span>
            <span className="ml-1 hidden sm:inline">{models.length}</span>
          </button>
        </div>

        {/* Pill reasoning Fast/Medium/High */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1 text-xs text-[var(--muted)]">
          {LEVELS.map((lv) => {
            const active = reasoning === lv;
            return (
              <button
                key={lv}
                onClick={() => onReasoning(lv)}
                title={REASONING_META[lv].desc}
                className={`cursor-pointer rounded-full border px-2.5 py-1 font-medium transition-colors ${
                  active
                    ? "border-[var(--blue)] bg-[var(--blue)] text-white"
                    : "border-[var(--surface-border)] bg-[var(--surface)] hover:border-[var(--blue)] hover:text-[var(--ice)]"
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

        {/* Preview gambar sebelum dikirim */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2">
            {images.map((img) => (
              <div key={img.id} className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="h-20 w-20 rounded-lg border border-[var(--surface-border)] object-cover"
                />
                <button
                  onClick={() => setImages(images.filter((i) => i.id !== img.id))}
                  className="absolute -right-2 -top-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-red-500 text-xs text-white transition-colors hover:bg-red-600"
                  title="Hapus gambar"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {warn && <p className="pb-1 text-[11px] text-red-400">{warn}</p>}

        {/* Bar input — ala personal-web */}
        <div className="flex items-center gap-1.5 py-2 sm:gap-2 sm:py-3">
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
            className="shrink-0 cursor-pointer rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-2.5 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:border-[var(--blue)] hover:text-[var(--ice)] disabled:opacity-30 sm:px-3"
            title="Upload gambar (max 4, @5MB)"
          >
            📎
          </button>
          <textarea
            ref={areaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Ketik pesan..."
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            className="min-w-0 flex-1 resize-none rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2.5 text-base text-[var(--ice)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--blue)] disabled:opacity-50 sm:px-4 sm:text-sm"
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
              className="shrink-0 cursor-pointer rounded-xl bg-[var(--blue)] p-2.5 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              title="Kirim"
              aria-label="Kirim pesan"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
