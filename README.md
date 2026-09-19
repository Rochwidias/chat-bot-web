# 💬 RuangTanya — BYOK Chat

Chatbot web multi-provider dengan skema **BYOK (Bring Your Own Key)**: tempel API key sendiri, pilih model, atur reasoning **Fast / Medium / High**, kirim gambar + teks. Key tersimpan hanya di browser — tidak pernah disimpan di server.

🌐 **Live demo:** [chat-bot-web-flax.vercel.app](https://chat-bot-web-flax.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel&logoColor=white)

---

## ✨ Fitur

- 🔑 **BYOK** — pakai API key milik sendiri, tanpa backend billing. Key disimpan di `localStorage` browser saja.
- 🔌 **5 provider**: OpenAI, OpenRouter, Google Gemini, DeepSeek, dan Custom (endpoint OpenAI-compatible, mis. Ollama lokal).
- 🧠 **Reasoning Fast / Medium / High** — atur gaya jawab: cepat-ringkas, seimbang, atau mikir mendalam langkah demi langkah (untuk model yang mendukung).
- 🖼️ **Vision** — kirim hingga 4 gambar per pesan berdampingan dengan teks.
- 📡 **Streaming** — token jawaban mengalir real-time via SSE.
- 📋 **Daftar model live** — ambil katalog model langsung dari provider lewat proxy server (`/api/models`), API key dikirim via header (bukan query string).
- 🎨 **Tema terang / gelap** + kustomisasi aksen, anti-flicker saat load.
- 💬 **Multi-sesi** — riwayat chat per sesi tersimpan lokal di browser, plus mode tampil kosong yang ramah.
- 🛡️ **Keamanan**: cek CSRF same-origin, rate-limit per IP, validasi input ketat, dan proteksi anti-SSRF + DNS-rebinding untuk Base URL custom.

## 🤖 Provider & Model Default

| Provider | Base URL | Model default |
| --- | --- | --- |
| OpenAI | `api.openai.com/v1` | `gpt-4o-mini` |
| OpenRouter | `openrouter.ai/api/v1` | `openai/gpt-4o-mini` |
| Google Gemini | `generativelanguage.googleapis.com/v1beta/openai` | `gemini-2.0-flash` |
| DeepSeek | `api.deepseek.com/v1` | `deepseek-chat` |
| Custom | isi manual (mis. `http://localhost:11434/v1` untuk Ollama) | `llama3.1` |

Daftar lengkap + label tiap model ada di [`lib/providers.ts`](lib/providers.ts).

## 🛠️ Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** — styling
- **react-markdown + remark-gfm** — render jawaban AI (aman, tanpa `dangerouslySetInnerHTML`)
- Font **Poppins** + **JetBrains Mono**, UI berbahasa Indonesia

## 🚀 Cara Jalanin

```bash
git clone https://github.com/Rochwidias/chat-bot-web.git
cd chat-bot-web
npm install
cp .env.example .env   # opsional, hanya untuk identitas OpenRouter
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000), klik tombol **Isi API Key** di topbar, tempel key provider pilihanmu, langsung chat.

### Environment variables (semua opsional)

| Variabel | Default | Kegunaan |
| --- | --- | --- |
| `OPENROUTER_REFERER` | `http://localhost:3000` | Header `HTTP-Referer` yang dikirim ke OpenRouter |
| `OPENROUTER_TITLE` | `ChatBot Web BYOK` | Header `X-Title` yang dikirim ke OpenRouter |

Isi keduanya di production agar sesuai domain asli (lihat [`.env.example`](.env.example)).

## 📂 Struktur Project

```
app/
├── api/
│   ├── chat/     # POST proxy chat → provider (streaming SSE)
│   └── models/   # GET daftar model live dari provider
├── layout.tsx    # metadata + font + theme init
└── page.tsx      # halaman chat utama
components/       # Sidebar, Topbar, ChatInput, ChatBubble, ApiKeyModal, AppearanceModal, EmptyState
lib/
├── providers.ts  # katalog provider & model + helper vision/reasoning
├── security.ts   # CSRF, rate-limit, validasi input, anti-SSRF
├── storage.ts    # sesi, key, settings di localStorage
├── theme.ts      # preset tema + anti-flicker script
└── images.ts     # helper upload/kompres gambar
```

## 🔒 Catatan Keamanan

- API key **tidak pernah** disimpan di server — diteruskan dari browser ke provider lewat route proxy dan langsung dibuang.
- Route `/api/models` hanya menerima key via header `x-provider-key`.
- Base URL custom divalidasi: wajib `http(s)`, tanpa kredensial, tolak host/IP internal & hasil DNS rebinding (di dev, `localhost` diizinkan untuk Ollama).

## 👨‍💻 Pembuat

Dikembangkan oleh [@Rochwidias](https://github.com/Rochwidias).
