# Desain: Rebrand RuangTanya — Sistem Ink Premium (2026-09-17)

## Status
Disetujui user (visual) + terimplementasi. Build + lint hijau.

## 1. Tujuan
Rebrand total `chat-bot-web` ("ChatBot Web / AI Dashboard") menjadi
**RuangTanya — BYOK Chat**: kesan premium dashboard, simple (anti AI-slop),
ada logo, tanpa emoji. Sukses = deploy-ready ke Vercel.

## 2. Batasan (disepakati)
- Fitur tetap semua: aliran ChatInput → `/api/chat` (SSE) → ChatBubble,
  `refreshModels` → `/api/models`, sessions, reasoning Fast/Medium/High,
  upload gambar (kompres canvas), API Appearance (preset/mode/accent/
  fontSize/radius/density) tidak berubah bentuk.
- Tanpa font/teks baru selain Poppins + JetBrains Mono yang sudah ada.
- Tanpa library ikon. Tanpa dekorasi: tanpa gradient mesh, tanpa
  glow/neon, tanpa glassmorphism di mana-mana.

## 3. Keputusan visual (sesuai mockup v3 + ikon yang disetujui user)
- **Logo**: kotak tinta (ink-box) + glyph bubble-chat + titik, komponen
  `LogoIcon` di `components/icons.tsx`. Wordmark "RuangTanya" + sub
  "BYOK CHAT". Dipakai di Sidebar, EmptyState, avatar AI (ChatBubble).
- **Sistem warna Ink** (satu aksen daun, peran tunggal = aksi/brand):
  - Malam Ink (dark): bg `#0E0F11`, tinta `#EDEBE6`, aksen mint `#3DDC84`.
  - Kertas Ink (light): bg `#FAFAF7`, tinta `#131518`, aksen pine `#0B6E4F`.
- **Pemetaan ke API lama** (tanpa migrasi localStorage `cbw.theme.v1`):
  preset `komando` = Malam Ink, `kertas` = Kertas Ink; `senja` tetap
  sebagai alternatif ekspresif. Default: Malam Ink dark.
- **Ikon**: satu keluarga stroke 1.8px, round caps/joins, `currentColor`.
  Aksen hanya untuk tombol kirim.
- **Composer**: panel flat 1px border, fokus = border aksen. Tanpa shadow.

## 4. Perubahan kode
- `components/icons.tsx`: stroke 2.4→1.8px, tambah `LogoIcon`,
  hapus `SparkIcon` (legacy tak terpakai).
- `app/globals.css`: token `:root`/preset → Ink; `.logo-mark`/`.avatar-ai`
  = ink-box; hapus var gradient tak terpakai; `.chat-panel` tanpa shadow.
- `lib/theme.ts`: nama preset (Malam Ink / Kertas Ink / Senja),
  dots, nilai dark/light, urutan SWATCHES (mint/pine dulu),
  `DEFAULT_APPEARANCE.accent #3ddc84`, fallback `themeInitScript`
  disederhanakan (senja vs Ink).
- `components/Sidebar.tsx`, `EmptyState.tsx`, `ChatBubble.tsx`: LogoIcon +
  wordmark RuangTanya.
- `app/layout.tsx`: title "RuangTanya — BYOK Chat", viewport
  `themeColor #0e0f11`, `colorScheme dark light`.
- `app/api/chat/route.ts`, `app/api/models/route.ts`: appTitle RuangTanya BYOK.
- `lib/useDismissible.ts`: tulis ref di dalam efek (aturan react-hooks/refs).
- `components/ApiKeyModal.tsx`: sinkron draft saat dibuka via pola
  derived-state saat render (bukan setState di efek).
- `.gitignore`: abaikan `.superpowers/` (mockup companion).

## 5. Verifikasi (2026-09-17, fresh)
- `npm run lint` → exit 0, 0 problem.
- `npm run build` (Next 16.3.4 Turbopack) → exit 0, 4 route OK
  (`/` + `/_not-found` statis; `/api/chat` + `/api/models` dinamis).
- Grep: tidak ada sisa "ChatBot Web", `#00cfff`/`#7c5cff` di
  komponen/app (kecuali tak ada), tidak ada `SparkIcon`, tidak ada emoji.

## 6. Sisa non-bloker (opsional, tidak menghambat deploy)
- `redesign-preview.html` + `redesign-v2.html` (mockup lama, untracked di
  root `chat-bot-web/`): hapus manual bila ingin repo bersih — tidak ikut
  build/deploy Next.js.
- File di luar `chat-bot-web/` (`E-commerce`, `personal-web`, `.omo/`)
  punya perubahan tak terkait — jangan ikut commit.
- Commit hanya bila user minta (belum diminta).
