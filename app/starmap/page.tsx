"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import StarMap from "@/components/starmap/StarMap";
import { starmapConfig } from "@/config/starmap";

const ZODIAC_SIGNS: Record<string, string> = {
  "Koç": "♈", "Boğa": "♉", "İkizler": "♊", "Yengeç": "♋",
  "Aslan": "♌", "Başak": "♍", "Terazi": "♎", "Akrep": "♏",
  "Yay": "♐", "Oğlak": "♑", "Kova": "♒", "Balık": "♓",
};

export default function StarMapPage() {
  const { introMessage, meetingDate, meetingTime, location, zodiacHighlight, starNotes } = starmapConfig;

  const formattedDate = new Date(
    meetingTime ? `${meetingDate}T${meetingTime}` : meetingDate
  ).toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });

  const zodiacSymbol = ZODIAC_SIGNS[zodiacHighlight.sign] || "✨";

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 16px 80px" }}>
      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Link href="/" style={{ color: "var(--color-pink-deep)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
          ← Ana Sayfa
        </Link>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ textAlign: "center", margin: "28px 0 8px" }}
      >
        <h1 className="section-title">🌌 Yıldız Haritası</h1>
        <p style={{ color: "var(--color-text-soft)", fontSize: "0.95rem", marginTop: 6 }}>
          {formattedDate} — {location.name}
        </p>
      </motion.div>

      {/* Intro message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
        style={{ padding: "24px 28px", margin: "24px 0", textAlign: "center" }}
      >
        <p
          style={{
            fontFamily: "var(--font-script), cursive",
            fontSize: "clamp(1rem, 3vw, 1.4rem)",
            color: "var(--color-text)",
            lineHeight: 1.7,
          }}
        >
          {introMessage}
        </p>
      </motion.div>

      {/* Star map canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}
      >
        <StarMap
          meetingDate={meetingDate}
          meetingTime={meetingTime}
          latitude={location.latitude}
          longitude={location.longitude}
          starNotes={starNotes}
        />
      </motion.div>

      <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--color-text-soft)", marginBottom: 40 }}>
        💡 Bir yıldıza tıkla — kaydırarak büyütebilirsin
      </p>

      {/* Astrology message */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-card"
        style={{ padding: "32px 28px", textAlign: "center" }}
      >
        <div style={{ fontSize: "3rem", marginBottom: 12 }}>{zodiacSymbol}</div>
        <h2
          style={{
            fontFamily: "var(--font-heading), Quicksand, sans-serif",
            fontWeight: 800,
            fontSize: "1.5rem",
            background: "linear-gradient(135deg, var(--color-pink-deep), var(--color-lavender))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 16,
          }}
        >
          {zodiacHighlight.sign} Burcu
        </h2>
        <p
          style={{
            fontFamily: "var(--font-script), cursive",
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: "var(--color-text)",
            lineHeight: 1.8,
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          {zodiacHighlight.message}
        </p>
      </motion.div>
    </main>
  );
}
