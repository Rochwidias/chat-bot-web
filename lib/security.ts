import { lookup } from "node:dns/promises";

/**
 * Pengaman bersama untuk route API chat-bot-web:
 * - CSRF same-origin check (tiruan pola E-commerce)
 * - Rate limiter in-memory berkap dengan LRU-cap + sweep
 * - Validasi Base URL custom anti-SSRF
 */

type Bucket = { count: number; resetAt: number };

const MAX_KEYS = 5000;
const buckets = new Map<string, Bucket>();

function bucketKey(scope: string, id: string): string {
  return `${scope}:${id}`;
}

function sweep(now: number): void {
  for (const [k, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(k);
  }
}

function evictOldest(): void {
  // Map menjaga urutan insert; hapus 10% tertua bila penuh.
  const target = Math.max(1, Math.floor(MAX_KEYS / 10));
  let removed = 0;
  for (const k of buckets.keys()) {
    buckets.delete(k);
    if (++removed >= target) break;
  }
}

export function checkRateLimit(
  scope: string,
  id: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  if (buckets.size >= MAX_KEYS) {
    sweep(now);
    if (buckets.size >= MAX_KEYS) evictOldest();
  }
  const k = bucketKey(scope, id);
  const current = buckets.get(k);
  if (!current || current.resetAt <= now) {
    buckets.set(k, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (current.count >= limit) {
    return { allowed: false, retryAfterMs: Math.max(0, current.resetAt - now) };
  }
  current.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

/** IP client: utamakan header yang di-set platform, bukan x-forwarded-for. */
export function clientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp?.trim()) return vercelIp.split(",")[0].trim();
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp?.trim()) return cfIp.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return "unknown";
}

/**
 * CSRF: metode aman lolos; mutasi wajib Origin/Referer same-origin.
 * Tanpa keduanya = tolak.
 */
export function isSameOrigin(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const o = new URL(origin);
      return o.protocol === requestUrl.protocol && o.host === requestUrl.host;
    } catch {
      return false;
    }
  }
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const r = new URL(referer);
      // Referer hanya dicek host (skema boleh beda saat redirect http->https lokal).
      return r.host === requestUrl.host;
    } catch {
      return false;
    }
  }
  return false;
}

// ---------- Anti-SSRF untuk Base URL custom ----------

const BLOCKED_HOST_RE =
  /^(localhost|.*\.local|.*\.localhost|.*\.internal|.*\.lan|.*\.home|.*\.corp)$/i;

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null;
    const v = Number(p);
    if (v < 0 || v > 255) return null;
    n = (n << 8) + v;
  }
  return n >>> 0;
}

function isPrivateIpLiteral(ip: string): boolean {
  const lower = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (lower === "::1" || lower === "::" || lower === "0.0.0.0") return true;
  if (lower.includes(":")) {
    // IPv6: link-local (fe80::/10), unique-local (fc00::/7), loopback.
    return /^(fe[89ab]|fc|fd|::1|::ffff:(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.))/i.test(
      lower
    );
  }
  const n = ipv4ToInt(lower);
  if (n === null) return false;
  const inRange = (base: string, bits: number) => {
    const b = ipv4ToInt(base)!;
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (n & mask) === (b & mask);
  };
  return (
    inRange("10.0.0.0", 8) ||
    inRange("172.16.0.0", 12) ||
    inRange("192.168.0.0", 16) ||
    inRange("127.0.0.0", 8) ||
    inRange("169.254.0.0", 16) ||
    inRange("0.0.0.0", 8)
  );
}

/**
 * Validasi Base URL custom agar route server tidak bisa dijadikan
 * proxy SSRF ke jaringan internal/metadata cloud.
 * - Wajib http(s), tanpa credential/userinfo di URL.
 * - Hostname diblokir bila jelas privat (localhost, *.local, *.internal, ...).
 * - IP literal privat selalu ditolak (termasuk metadata 169.254.169.254).
 * - Di production, hostname yang resolve ke IP privat juga ditolak
 *   (menangkal DNS rebinding). Di dev, localhost diizinkan untuk Ollama.
 */
export async function validateBaseUrl(
  raw: unknown
): Promise<{ ok: true; baseUrl: string } | { ok: false; error: string }> {
  if (typeof raw !== "string") return { ok: false, error: "Base URL custom tidak valid." };
  if (raw.length > 500) return { ok: false, error: "Base URL terlalu panjang." };
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) return { ok: false, error: "Base URL custom masih kosong." };
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, error: "Base URL custom tidak valid." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "Base URL harus http(s)." };
  }
  if (url.username || url.password) {
    return { ok: false, error: "Base URL tidak boleh mengandung kredensial." };
  }
  const host = url.hostname.toLowerCase();
  if (!host) return { ok: false, error: "Base URL custom tidak valid." };
  if (isPrivateIpLiteral(host)) {
    return { ok: false, error: "Base URL mengarah ke alamat internal, ditolak." };
  }
  const isDev = process.env.NODE_ENV !== "production";
  if (BLOCKED_HOST_RE.test(host)) {
    if (!isDev || (host !== "localhost" && !host.endsWith(".localhost"))) {
      return { ok: false, error: "Base URL mengarah ke host internal, ditolak." };
    }
  }
  if (url.protocol === "http:" && !isDev) {
    // Di production, custom endpoint wajib https — kecuali loopback dev.
    if (!isPrivateIpLiteral(host) && host !== "localhost") {
      return { ok: false, error: "Base URL custom di production wajib https." };
    }
  }
  // Resolve DNS → tolak bila mengarah ke IP privat (DNS rebinding).
  // Localhost di dev dikecualikan agar Ollama tetap jalan.
  if (!(isDev && (host === "localhost" || host.endsWith(".localhost")))) {
    try {
      const addrs = await lookup(host, { all: true });
      if (addrs.some((a) => isPrivateIpLiteral(a.address))) {
        return { ok: false, error: "Base URL mengarah ke alamat internal, ditolak." };
      }
    } catch {
      return { ok: false, error: "Base URL tidak bisa di-resolve." };
    }
  }
  return { ok: true, baseUrl: trimmed };
}

// ---------- Validasi input chat ----------

export const MAX_MODEL_LEN = 200;
const MODEL_RE = /^[a-zA-Z0-9][a-zA-Z0-9/:._-]{0,199}$/;
export const MAX_MSG_LEN = 4000;
export const MAX_DATAURL_LEN = 7_000_000; // ~5MB gambar base64

export function isValidModelId(model: unknown): model is string {
  return typeof model === "string" && MODEL_RE.test(model);
}
