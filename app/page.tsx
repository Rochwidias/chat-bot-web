"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import ApiKeyModal from "@/components/ApiKeyModal";
import EmptyState from "@/components/EmptyState";
import { getProvider, supportsVision } from "@/lib/providers";
import {
  loadKeys,
  loadSessions,
  loadSettings,
  saveKeys,
  saveSessions,
  saveSettings,
} from "@/lib/storage";
import {
  uid,
  type AppSettings,
  type ChatImage,
  type ChatMessage,
  type ChatSession,
  type ProviderId,
  type ProviderKeys,
  type ReasoningLevel,
} from "@/lib/types";

export default function ChatPage() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [keys, setKeys] = useState<ProviderKeys>(() => loadKeys());
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [keyOpen, setKeyOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Persist otomatis
  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveSessions(sessions), [sessions]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme !== "light");
  }, [settings.theme]);

  // ID aktif efektif: pilihan user, atau sesi terbaru bila belum memilih.
  const effectiveId = activeId ?? sessions[0]?.id ?? null;

  const active = useMemo(
    () => sessions.find((s) => s.id === effectiveId) ?? null,
    [sessions, effectiveId]
  );
  const activeKey = keys[settings.provider] ?? "";
  const visionOk = supportsVision(settings.model);

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() =>
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    );
  }, []);

  useEffect(() => {
    scrollDown();
  }, [active?.messages.length, streaming, scrollDown]);

  // ---------- session ops ----------
  const newChat = useCallback(() => {
    const s: ChatSession = {
      id: uid("chat"),
      title: "Chat baru",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
    setError("");
  }, []);

  // ID aktif efektif: pilihan user, atau sesi terbaru bila belum memilih. (dideklarasi di atas)

  const patchMessages = useCallback(
    (sessionId: string, fn: (msgs: ChatMessage[]) => ChatMessage[]) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, messages: fn(s.messages), updatedAt: Date.now() }
            : s
        )
      );
    },
    []
  );

  // ---------- kirim + streaming ----------
  const send = useCallback(
    async (text: string, images: ChatImage[]) => {
      let sid = effectiveId;
      if (!sid) {
        sid = uid("chat");
        const s: ChatSession = {
          id: sid,
          title: (text || "Chat gambar").slice(0, 40) || "Chat baru",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setSessions((prev) => [s, ...prev]);
        setActiveId(sid);
      }
      const sessionId = sid;
      setError("");

      if (!activeKey) {
        setError("API key untuk provider ini masih kosong.");
        setKeyOpen(true);
        return;
      }

      const userMsg: ChatMessage = {
        id: uid("m"),
        role: "user",
        content: text,
        images: images.length ? images : undefined,
        createdAt: Date.now(),
      };
      const aiMsg: ChatMessage = {
        id: uid("m"),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      // Judul otomatis dari pesan pertama
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const title =
            s.messages.length === 0
              ? (text || "Chat gambar").slice(0, 40)
              : s.title;
          return {
            ...s,
            title,
            messages: [...s.messages, userMsg, aiMsg],
            updatedAt: Date.now(),
          };
        })
      );

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setStreaming(true);

      try {
        // Ambil snapshot pesan terbaru (termasuk yang barusan) untuk dikirim
        const current = await new Promise<ChatSession | undefined>((res) => {
          setSessions((prev) => {
            res(prev.find((s) => s.id === sessionId));
            return prev;
          });
        });
        const history = (current?.messages ?? []).map((m) => ({
          role: m.role,
          content: m.content,
          images: m.images?.map((i) => ({ dataUrl: i.dataUrl })),
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          signal: ctrl.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: settings.provider,
            model: settings.model,
            apiKey: activeKey,
            customBaseUrl: settings.customBaseUrl,
            reasoning: settings.reasoning,
            messages: history,
          }),
        });

        const ct = res.headers.get("content-type") ?? "";
        if (!res.ok || !res.body || !ct.includes("text/event-stream")) {
          const j = await res.json().catch(() => null);
          throw new Error(j?.error ?? `Request gagal (${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let acc = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const parts = buf.split("\n\n");
          buf = parts.pop() ?? "";
          for (const part of parts) {
            for (const line of part.split("\n")) {
              const t = line.trim();
              if (!t.startsWith("data:")) continue;
              const data = t.slice(5).trim();
              if (data === "[DONE]") continue;
              try {
                const token = (JSON.parse(data) as { token: string }).token;
                if (token) {
                  acc += token;
                  const snap = acc;
                  patchMessages(sessionId, (msgs) =>
                    msgs.map((m) => (m.id === aiMsg.id ? { ...m, content: snap } : m))
                  );
                }
              } catch {
                /* abaikan */
              }
            }
          }
        }
        if (!acc) {
          patchMessages(sessionId, (msgs) =>
            msgs.map((m) =>
              m.id === aiMsg.id ? { ...m, content: "(Tidak ada balasan dari model.)" } : m
            )
          );
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          patchMessages(sessionId, (msgs) =>
            msgs.map((m) =>
              m.id === aiMsg.id
                ? { ...m, content: m.content + "\n\n⏹ *Dihentikan oleh user.*" }
                : m
            )
          );
        } else {
          const msg = e instanceof Error ? e.message : String(e);
          setError(msg);
          patchMessages(sessionId, (msgs) =>
            msgs.map((m) =>
              m.id === aiMsg.id ? { ...m, content: `⚠️ ${msg}` } : m
            )
          );
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
        scrollDown();
      }
    },
    [effectiveId, activeKey, patchMessages, scrollDown, settings]
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  // ---------- settings handlers ----------
  const setProvider = (p: ProviderId) => {
    const meta = getProvider(p);
    setSettings((s) => ({
      ...s,
      provider: p,
      model: meta.defaultModel,
      customBaseUrl: p === "custom" ? s.customBaseUrl : "",
    }));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <Sidebar
        sessions={sessions}
        activeId={effectiveId}
        onSelect={setActiveId}
        onNew={newChat}
        onDelete={(id) => {
          setSessions((prev) => prev.filter((s) => s.id !== id));
          if (effectiveId === id) setActiveId(null);
        }}
        open={sideOpen}
        onClose={() => setSideOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          provider={settings.provider}
          model={settings.model}
          reasoning={settings.reasoning}
          customModel={settings.provider === "custom"}
          customModelText={settings.model}
          hasKey={!!activeKey}
          theme={settings.theme}
          streaming={streaming}
          onProvider={setProvider}
          onModel={(m) => setSettings((s) => ({ ...s, model: m }))}
          onCustomModelText={(v) => setSettings((s) => ({ ...s, model: v }))}
          onReasoning={(r: ReasoningLevel) => setSettings((s) => ({ ...s, reasoning: r }))}
          onOpenKeys={() => setKeyOpen(true)}
          onToggleTheme={() =>
            setSettings((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }))
          }
          onToggleSidebar={() => setSideOpen((v) => !v)}
        />

        {error && (
          <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-200">
            ⚠️ {error}
          </div>
        )}

        <main className="nice-scroll flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-4 px-3 py-5 md:px-5">
            {!active || active.messages.length === 0 ? (
              <EmptyState
                onPick={(t) => {
                  if (!effectiveId) newChat();
                  // Isi ke input? paling simpel: langsung kirim sebagai pesan pertama
                  send(t, []);
                }}
              />
            ) : (
              active.messages.map((m) => <ChatBubble key={m.id} msg={m} />)
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        <ChatInput
          streaming={streaming}
          visionOk={visionOk}
          onSend={send}
          onStop={stop}
        />
      </div>

      <ApiKeyModal
        open={keyOpen}
        provider={settings.provider}
        keys={keys}
        customBaseUrl={settings.customBaseUrl}
        onClose={() => setKeyOpen(false)}
        onSave={(k, url) => {
          setKeys(k);
          saveKeys(k);
          setSettings((s) => ({ ...s, customBaseUrl: url }));
        }}
      />
    </div>
  );
}
