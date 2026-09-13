"use client";

/**
 * Util gambar bersama (dipakai ChatInput; pola sama dengan personal-web).
 * Kompres via canvas agar upload ke provider hemat token & cepat.
 */

export const MAX_IMAGE_DIMENSION = 1600;

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function compressImage(dataUrl: string, mime: string): Promise<string> {
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
