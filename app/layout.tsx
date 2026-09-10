import type { Metadata, Viewport } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
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
  title: "ChatBot Web — AI Dashboard",
  description:
    "Chatbot multi-provider (BYOK): tempel API key sendiri, pilih model, atur reasoning Fast/Medium/High, kirim gambar + teks.",
};

export const viewport: Viewport = {
  themeColor: "#0D0D0D",
  colorScheme: "dark",
};

// Anti-flicker: samakan dengan personal-web — default dark,
// class "light" di <html> berarti mode terang.
const themeInitScript = `(function(){try{var t=localStorage.getItem("cbw.settings");var theme=t?JSON.parse(t).theme:"dark";if(theme==="light"){document.documentElement.classList.add("light")}else{document.documentElement.classList.remove("light")}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${poppins.variable} ${jetbrainsMono.variable} min-h-full antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
