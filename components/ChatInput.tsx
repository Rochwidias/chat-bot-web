"use client";

import { useRef, useState } from "react";
import type { ChatImage } from "@/lib/types";
import { uid } from "@/lib/types";

interface Props {
  streaming: boolean;
  visionOk: boolean;
  onSend: (text: string, images: ChatImage[]) => void;
  onStop: () => void;
}

const MAX_FILES = 4;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function ChatInput({ streaming, visionOk, onSend, onStop }: Props) {
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
      const dataUrl = await fileToDataUrl(f);
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

  return (
    <div className="border-t border-white/10 bg-zinc-950/80 px-3 pb-3 pt-2 backdrop-blur md:px-5 md:pb-5">
      <div className="mx-auto max-w-3xl">
        {!visionOk && (
          <p className="mb-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] text-amber-200">
            ⚠️ Model ini kemungkinan tidak support gambar. Pakai GPT-4o / Gemini Flash untuk vision.
          </p>
        )}

        {/* Preview gambar sebelum dikirim */}
        {images.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {images.map((img) => (
              <div key={img.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="h-16 w-16 rounded-lg border border-white/15 object-cover"
                />
                <button
                  onClick={() => setImages(images.filter((i) => i.id !== img.id))}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow hover:bg-red-400"
                  title="Hapus gambar"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {warn && <p className="mb-1.5 text-[11px] text-red-300">{warn}</p>}

        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-zinc-900/90 p-2 shadow-xl focus-within:border-fuchsia-500/60">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              pick(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-xl px-2.5 py-2 text-lg text-zinc-300 transition hover:bg-white/10 hover:text-white"
            title="Tambah gambar (max 4, @5MB)"
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
            placeholder="Ketik pesan… (Enter kirim, Shift+Enter baris baru)"
            className="max-h-36 min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
          {streaming ? (
            <button
              onClick={onStop}
              className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
              title="Hentikan jawaban"
            >
              ⏹ Stop
            </button>
          ) : (
            <button
              onClick={send}
              disabled={!text.trim() && images.length === 0}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-600/25 transition hover:brightness-110 active:scale-95 disabled:opacity-40"
            >
              Kirim ➤
            </button>
          )}
        </div>
        <p className="mt-1.5 text-center text-[11px] text-zinc-500">
          Gambar + ketikan terkirim jadi satu bubble • Key milikmu, tersimpan lokal
        </p>
      </div>
    </div>
  );
}
