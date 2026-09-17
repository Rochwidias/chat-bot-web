import type { Metadata, Viewport } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "RuangTanya — BYOK Chat",
  description:
    "RuangTanya: chatbot multi-provider (BYOK): tempel API key sendiri, pilih model, atur reasoning Fast/Medium/High, kirim gambar + teks.",
};

export const viewport: Viewport = {
  themeColor: "#0e0f11",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Anti-flicker: pasang class preset/mode + var aksen SEBELUM paint.
            Sumber tunggal di lib/theme.ts (lihat panduan preventing-flash). */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body
        className={`${poppins.variable} ${jetbrainsMono.variable} min-h-full antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
