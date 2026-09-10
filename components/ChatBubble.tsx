"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/lib/types";

export default function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard diblokir: abaikan */
    }
  };

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow md:max-w-[75%] ${
          isUser
            ? "rounded-br-md bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-fuchsia-900/30"
            : "rounded-bl-md border border-white/10 bg-zinc-900/80 text-zinc-100 backdrop-blur"
        }`}
      >
        {/* Gambar user: tampil di atas ketikan, sesuai request abang */}
        {msg.images && msg.images.length > 0 && (
          <div className="mb-2 grid grid-cols-2 gap-2">
            {msg.images.map((img) => (
              <button
                key={img.id}
                onClick={() => setZoom(img.dataUrl)}
                className="group relative overflow-hidden rounded-xl border border-white/15"
                title="Klik untuk perbesar"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="h-32 w-full object-cover transition group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}

        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content || "(gambar tanpa teks)"}</p>
        ) : (
          <div className="prose-ai">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content || "…"}</ReactMarkdown>
          </div>
        )}

        {!isUser && msg.content && (
          <button
            onClick={copy}
            className="mt-2 rounded-md border border-white/10 px-2 py-0.5 text-[11px] text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            {copied ? "✅ Tersalin" : "📋 Salin"}
          </button>
        )}
      </div>

      {/* Fullscreen gambar */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setZoom(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="zoom" className="max-h-full max-w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}
