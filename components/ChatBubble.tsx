"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/lib/types";
import { CopyIcon, LogoIcon } from "./icons";

interface Props {
  msg: ChatMessage;
  /** Nama model yang menjawab (ditampilkan di kepala bubble AI). */
  modelLabel?: string;
}

export default function ChatBubble({ msg, modelLabel }: Props) {
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

  const time = new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`msg-row mb-[18px] flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="avatar-ai" aria-hidden>
          <LogoIcon size={16} />
        </div>
      )}
      <div className={`min-w-0 ${isUser ? "max-w-[78%]" : "max-w-[82%]"}`}>
        {/* Kepala pesan AI: nama + model mono + tombol salin */}
        {!isUser && (
          <div className="mhead">
            <b>Asisten</b>
            <span className="mono">{modelLabel ?? ""}{modelLabel ? ` · ${time}` : time}</span>
            <button className="cp inline-flex items-center gap-1" onClick={copy}>
              <CopyIcon size={12} />
              {copied ? "Tersalin" : "Salin"}
            </button>
          </div>
        )}
        <div
          className={`px-[15px] py-3 text-[var(--fs)] leading-[1.7] ${
            isUser
              ? "bub-user rounded-[var(--r)] rounded-br-md bg-[var(--accent)] font-medium text-[var(--accent-ink)]"
              : "bub-ai rounded-[var(--r)] rounded-bl-md border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)]"
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
            <p className="whitespace-pre-wrap">
              {msg.content || "(gambar tanpa teks)"}
            </p>
          ) : (
            <div className="prose-ai">
              {/* react-markdown aman dari XSS by default (tak ada dangerouslySetInnerHTML);
                  batasi skema URL + buka link eksternal di tab baru dengan rel aman. */}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
                    const safe = /^(https?:|mailto:|#)/i.test(href ?? "");
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
                  pre: ({ children }: { children?: React.ReactNode }) => (
                    <div className="codeblock">
                      <header>
                        <span className="fname">code</span>
                        <button
                          className="inline-flex items-center gap-1"
                          onClick={copy}
                        >
                          <CopyIcon size={12} />
                          {copied ? "Tersalin" : "Salin"}
                        </button>
                      </header>
                      <pre>{children}</pre>
                    </div>
                  ),
                }}
              >
                {msg.content || "…"}
              </ReactMarkdown>
            </div>
          )}
        </div>
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
