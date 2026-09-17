"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import ApiKeyModal from "@/components/ApiKeyModal";
import AppearanceModal from "@/components/AppearanceModal";
import EmptyState from "@/components/EmptyState";
import { AlertIcon } from "@/components/icons";
import { getProvider, loadRemoteModels, supportsVision } from "@/lib/providers";
import {
  applyAppearance,
  withMode,
  withPreset,
  type AppearanceSettings,
} from "@/lib/theme";
import {
  loadAppearance,
  loadKeys,
  loadModelsCache,
  loadSessions,
  loadSettings,
  saveAppearance,
  saveKeys,
  saveModelsCache,
  saveSessions,
  saveSettings,
  type ModelsCache,
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
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [appearance, setAppearance] = useState<AppearanceSettings>(() =>
    loadAppearance(loadSettings().theme)
  );
  const [sideOpen, setSideOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelCache, setModelCache] = useState<ModelsCache>(() => loadModelsCache());
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Cermin sinkron sessions untuk dibaca di dalam send() tanpa trik
  // setState-dalam-Promise (rapuh terhadap batching React).
  const sessionsRef = useRef<ChatSession[]>(sessions);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  // Persist otomatis
  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveSessions(sessions), [sessions]);
  useEffect(() => saveModelsCache(modelCache), [modelCache]);
  // Appearance redesign-v2: terapkan ke <html> + simpan (cbw.theme.v1).
  // Sinkronisasi settings.theme lama dilakukan di handler (bukan di sini)
  // agar tak ada setState-dalam-effect.
  useEffect(() => {
    applyAppearance(appearance);
    saveAppearance(appearance);
  }, [appearance]);

  /** Ganti appearance + cerminkan mode ke settings.theme lama (fallback anti-flicker). */
  const updateAppearance = useCallback(
    (fn: (a: AppearanceSettings) => AppearanceSettings) => {
      const next = fn(appearance);
      setAppearance(next);
      if (next.mode !== appearance.mode) {
        const mode = next.mode;
        setSettings((s) => (s.theme === mode ? s : { ...s, theme: mode }));
      }
    },
    [appearance]
  );

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
  // Kembalikan id sesi baru agar pemanggil sinkron (mis. EmptyState onPick)
  // bisa langsung memakai id-nya tanpa menunggu setState commit.
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
    return s.id;
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
    // sessionId opsional: bila diisi, pakai langsung (menghindari balapan
    // setState seperti kasus EmptyState onPick yang memanggil newChat+send).
    async (text: string, images: ChatImage[], sessionId?: string) => {
      if (!activeKey) {
        setError("API key untuk provider ini masih kosong.");
        setKeyOpen(true);
        return;
      }

      // Tentukan sesi target. Bila tak ada (atau id titipan tak dikenal),
      // siapkan sesi baru — pembuatannya dilakukan sekali jalan dengan
      // append pesan di updater di bawah, agar tak ada sesi ganda.
      const targetId = sessionId ?? effectiveId ?? uid("chat");
      const now = Date.now();
      const createdSession: ChatSession = {
        id: targetId,
        title: (text || "Chat gambar").slice(0, 40) || "Chat baru",
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      if (!sessionId && !effectiveId) setActiveId(targetId);
      setError("");

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

      // Snapshot sinkron via ref (selalu cermin sessions terbaru), tanpa
      // trik setState-dalam-Promise (rapuh terhadap batching React).
      // Sesi baru (bila id target belum ada) dibuat DI updater bawah, sekali
      // jalan dengan append — mencakup kasus id titipan dari EmptyState
      // onPick maupun jalur tanpa sesi.
      const foundAtCall = sessionsRef.current.find((s) => s.id === targetId);
      const baseMsgs: ChatMessage[] = foundAtCall?.messages ?? [];
      setSessions((prev) => {
        const found = prev.find((s) => s.id === targetId);
        const nextMsgs = [...baseMsgs, userMsg, aiMsg];
        if (!found) {
          return [
            { ...createdSession, messages: nextMsgs, updatedAt: Date.now() },
            ...prev,
          ];
        }
        // Judul otomatis dari pesan pertama
        return prev.map((s) => {
          if (s.id !== targetId) return s;
          const title =
            s.messages.length === 0
              ? (text || "Chat gambar").slice(0, 40)
              : s.title;
          return {
            ...s,
            title,
            messages: nextMsgs,
            updatedAt: Date.now(),
          };
        });
      });
      const nextMsgs = [...baseMsgs, userMsg, aiMsg];

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setStreaming(true);

      try {
        const history = nextMsgs.map((m) => ({
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
                  patchMessages(targetId, (msgs) =>
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
          patchMessages(targetId, (msgs) =>
            msgs.map((m) =>
              m.id === aiMsg.id ? { ...m, content: "(Tidak ada balasan dari model.)" } : m
            )
          );
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          patchMessages(targetId, (msgs) =>
            msgs.map((m) =>
              m.id === aiMsg.id
                ? { ...m, content: m.content + "\n\n*Dihentikan oleh user.*" }
                : m
            )
          );
        } else {
          const msg = e instanceof Error ? e.message : String(e);
          setError(msg);
          patchMessages(targetId, (msgs) =>
            msgs.map((m) =>
              m.id === aiMsg.id ? { ...m, content: `Error: ${msg}` } : m
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

  // ---------- daftar model live dari provider ----------
  const CACHE_TTL = 24 * 3600 * 1000; // 24 jam

  const refreshModels = useCallback(
    async (manual = false) => {
      const provider = settings.provider;
      if (provider === "custom") return;
      // OpenRouter publik (bisa tanpa key), provider lain butuh key.
      if (!activeKey && provider !== "openrouter") {
        if (manual) {
          setError("Isi API key provider ini dulu untuk memuat daftar model.");
          setKeyOpen(true);
        }
        return;
      }
      setModelsLoading(true);
      try {
        const list = await loadRemoteModels(provider, activeKey, settings.customBaseUrl);
        setModelCache((prev) => ({ ...prev, [provider]: { at: Date.now(), models: list } }));
        setSettings((s) => {
          if (s.provider !== provider) return s;
          if (list.some((m) => m.id === s.model)) return s;
          const first = list[0];
          if (!first) return s;
          return { ...s, model: first.id };
        });
        if (manual) setError("");
      } catch (e) {
        if (manual) setError(e instanceof Error ? e.message : String(e));
      } finally {
        setModelsLoading(false);
      }
    },
    [settings.provider, settings.customBaseUrl, activeKey]
  );

  // Auto-load saat ganti provider / key tersedia, kecuali cache masih segar.
  useEffect(() => {
    if (settings.provider === "custom") return;
    const hit = modelCache[settings.provider];
    if (hit && Date.now() - hit.at < CACHE_TTL) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sinkronisasi eksternal: muat daftar model live saat provider/key berubah
    void refreshModels(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.provider, activeKey]);

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

  const providerMeta = getProvider(settings.provider);

  // Daftar model: hasil load live (cache) > bawaan. Custom: ketik manual.
  const availableModels = useMemo(() => {
    if (settings.provider === "custom") {
      return [
        {
          id: settings.model,
          label: `${settings.model || "model-custom"} (custom)`,
          vision: false,
          reasoning: false,
        },
      ];
    }
    return modelCache[settings.provider]?.models ?? providerMeta.models;
  }, [settings.provider, settings.model, modelCache, providerMeta]);

  return (
    <div className="relative flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--ink)]">
      <Sidebar
        sessions={sessions}
        activeId={effectiveId}
        provider={providerMeta.label}
        model={settings.model}
        modelCount={availableModels.length}
        hasKey={!!activeKey}
        onSelect={setActiveId}
        onNew={newChat}
        onDelete={(id) => {
          setSessions((prev) => prev.filter((s) => s.id !== id));
          if (effectiveId === id) setActiveId(null);
        }}
        open={sideOpen}
        onClose={() => setSideOpen(false)}
      />

      <div className="relative z-[1] flex min-w-0 flex-1 flex-col">
        <Topbar
          provider={settings.provider}
          hasKey={!!activeKey}
          theme={appearance.mode}
          streaming={streaming}
          chatTitle={active && active.messages.length > 0 ? active.title : null}
          onProvider={setProvider}
          onOpenKeys={() => setKeyOpen(true)}
          onOpenSettings={() => setAppearanceOpen(true)}
          onToggleTheme={() =>
            updateAppearance((a) => withMode(a, a.mode === "dark" ? "light" : "dark"))
          }
          onToggleSidebar={() => setSideOpen((v) => !v)}
        />

        {error && (
          <div className="flex items-center gap-1.5 border-b border-red-400/30 bg-red-500/10 px-4 py-2 text-xs text-red-300">
            <AlertIcon size={13} />
            {error}
          </div>
        )}

        <main className="flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto flex min-h-full w-full max-w-[760px] flex-col px-3.5 py-[18px]">
            {!active || active.messages.length === 0 ? (
              <EmptyState
                onPick={(t) => {
                  // Satu jalur pembuatan sesi: serahkan ke send(). Bila belum
                  // ada sesi, buat dulu lalu teruskan id-nya agar send() tidak
                  // membuat sesi kedua (dulu: newChat(); send() balapan).
                  if (!effectiveId) void send(t, [], newChat());
                  else void send(t, []);
                }}
              />
            ) : (
              <>
                <div className="mb-4 flex items-center gap-2.5 font-mono text-[11px] text-[var(--muted)]">
                  <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
                  <span>Hari ini · {sessions.length} sesi</span>
                  <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
                </div>
                {active.messages.map((m) => (
                  <ChatBubble key={m.id} msg={m} modelLabel={settings.model} />
                ))}
              </>
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        <ChatInput
          streaming={streaming}
          visionOk={visionOk}
          models={availableModels}
          model={settings.model}
          modelsLoading={modelsLoading}
          reasoning={settings.reasoning}
          onModel={(m) => setSettings((s) => ({ ...s, model: m }))}
          onReasoning={(r: ReasoningLevel) => setSettings((s) => ({ ...s, reasoning: r }))}
          onRefreshModels={() => void refreshModels(true)}
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

      <AppearanceModal
        open={appearanceOpen}
        value={appearance}
        onChange={(a) => updateAppearance(() => a)}
        onPreset={(p) => updateAppearance((prev) => withPreset(prev, p))}
        onMode={(m) => updateAppearance((prev) => withMode(prev, m))}
        onClose={() => setAppearanceOpen(false)}
      />
    </div>
  );
}
