import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatBot Web — AI Dashboard",
  description:
    "Chatbot multi-provider (BYOK): tempel API key sendiri, pilih model, atur reasoning Fast/Medium/High, kirim gambar + teks.",
};

// Script kecil anti-flicker: baca tema tersimpan sebelum render.
const themeInitScript = `(function(){try{var t=localStorage.getItem("cbw.settings");var theme=t?JSON.parse(t).theme:"dark";if(theme==="light"){document.documentElement.classList.remove("dark")}else{document.documentElement.classList.add("dark")}}catch(e){document.documentElement.classList.add("dark")}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="dark h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
