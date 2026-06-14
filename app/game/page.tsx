import LoveGame from "@/components/game/LoveGame";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Aşk Oyunu",
  description: "Kalpleri topla, sevgimizi büyüt!",
};

export default function GamePage() {
  return (
    <main style={{ minHeight: "100vh", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 800, marginBottom: 20 }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "var(--color-pink-deep)",
            fontWeight: 600,
            textDecoration: "none",
            background: "rgba(255,143,171,0.15)",
            padding: "8px 16px",
            borderRadius: 20,
          }}
        >
          <ArrowLeft size={18} /> Ana Sayfaya Dön
        </Link>
      </div>

      <div style={{ width: "100%", maxWidth: 800 }}>
        <LoveGame />
      </div>
    </main>
  );
}
