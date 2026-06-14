import type { Metadata } from "next";
import { Quicksand, Nunito, Dancing_Script } from "next/font/google";
import "./globals.css";
import AmbientBackground from "@/components/shared/AmbientBackground";

// ── Fonts ──────────────────────────────────────────────────
const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
});

// ── Metadata ───────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Sana Özel Bir Sürpriz 💌",
  description: "Seninle geçirdiğimiz her anı kutlamak için hazırladığım özel bir site.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${quicksand.variable} ${nunito.variable} ${dancingScript.variable}`}
    >
      <body
        style={{
          fontFamily: "var(--font-body), Nunito, sans-serif",
        }}
      >
        {/* Ambient floating hearts/sparkles background */}
        <AmbientBackground />

        {/* Page content rendered above the ambient layer */}
        <div className="page-wrapper">{children}</div>
      </body>
    </html>
  );
}
