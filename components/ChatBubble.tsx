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
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 lg:max-w-[70%] ${
          isUser
            ? "rounded-br-md bg-[var(--blue)] text-white"
            : "rounded-bl-md border border-[var(--surface-border)] bg-[var(--surface)] text-[var(--ice)]"
        }`}
      >
        {/* Gambar user: tampil di atas ketikan */}
        {msg.images && msg.images.length > 0 && (
          <div className="mb-2 grid grid-cols-2 gap-2">
            {msg.images.map((img) => (
              <button
                key={img.id}
                onClick={() => setZoom(img.dataUrl)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-black/10"
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
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {msg.content || "(gambar tanpa teks)"}
          </p>
        ) : (
          <div className="prose-ai">
            {/* react-markdown aman dari XSS by default (tak ada dangerouslySetInnerHTML);
                batasi skema URL + buka link eksternal di tab baru dengan rel aman. */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => {
                  const safe = /^https?:|^mailto:|^#/.test(href ?? "");
                  return (
                    <a
                      href={safe ? href : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {msg.content || "…"}
            </ReactMarkdown>
          </div>
        )}

        {!isUser && msg.content && (
          <button
            onClick={copy}
            className="mt-2 cursor-pointer rounded-md border border-[var(--surface-border)] px-2 py-0.5 text-[11px] text-[var(--muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--ice)]"
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
