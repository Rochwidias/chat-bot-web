"use client";

import { useEffect, useRef } from "react";

/**
 * Hook bersama untuk pola dropdown/drawer yang bisa ditutup:
 * klik di luar elemen + tekan Escape. Menggantikan efek yang
 * terduplikasi di Topbar / ChatInput / Sidebar.
 *
 * @param open   apakah panel sedang terbuka (listener hanya aktif saat true)
 * @param onClose  dipanggil saat klik-di-luar atau Escape
 * @param options.reset  dijalankan tiap panel ditutup (mis. reset query search)
 */
export function useDismissible(
  open: boolean,
  onClose: () => void,
  options?: { reset?: () => void }
) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const resetRef = useRef(options?.reset);
  closeRef.current = onClose;
  resetRef.current = options?.reset;

  useEffect(() => {
    if (!open) return;
    const close = () => {
      resetRef.current?.();
      closeRef.current();
    };
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  return ref;
}
