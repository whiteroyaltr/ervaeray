"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import GiftBoxCard from "@/components/landing/GiftBoxCard";
import BucketListSection from "@/components/landing/BucketListSection";
import LandingAlbum from "@/components/landing/LandingAlbum";
import { siteConfig } from "@/config/site";

// ── Mini preview components for each card ──────────────────
function CounterPreview() {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
      {["YIL", "AY", "GÜN", "SAAT"].map((label, i) => (
        <motion.div
          key={label}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          style={{
            background: "linear-gradient(135deg, #FF8FAB22, #C8A2C822)",
            borderRadius: 10,
            padding: "4px 8px",
            fontSize: "0.65rem",
            fontWeight: 800,
            color: "var(--color-pink-deep)",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </motion.div>
      ))}
    </div>
  );
}

function StarMapPreview() {
  return (
    <div
      style={{
        width: 60,
        height: 60,
        margin: "0 auto",
        borderRadius: "50%",
        background: "radial-gradient(ellipse at center, #0d1b2a, #020810)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: i * 0.2 }}
          style={{
            position: "absolute",
            width: 2,
            height: 2,
            borderRadius: "50%",
            background: "white",
            top: `${10 + Math.random() * 80}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
        />
      ))}
    </div>
  );
}

function MusicPreview() {
  return (
    <div
      style={{
        display: "flex",
        gap: 3,
        justifyContent: "center",
        alignItems: "flex-end",
        height: 28,
      }}
    >
      {[0.4, 0.9, 0.6, 1, 0.7, 0.8, 0.5].map((h, i) => (
        <motion.div
          key={i}
          animate={{ scaleY: [h, 1, h * 0.5, 1, h] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
          style={{
            width: 4,
            height: `${h * 24}px`,
            background: `linear-gradient(180deg, #FF8FAB, #C8A2C8)`,
            borderRadius: 2,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  );
}

function LoveReasonsPreview() {
  return (
    <motion.div
      animate={{ rotate: [-2, 2, -2], y: [0, -3, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{
        width: 50,
        height: 60,
        margin: "0 auto",
        background: "linear-gradient(135deg, #FFD6E0, #FFB5C8)",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.6rem",
        boxShadow: "0 4px 16px rgba(255,107,129,0.3)",
      }}
    >
      💗
    </motion.div>
  );
}

function QuizPreview() {
  return (
    <motion.div
      animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      style={{ fontSize: "2rem", display: "flex", justifyContent: "center" }}
    >
      ❓
    </motion.div>
  );
}

function GamePreview() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
      style={{
        width: 60,
        height: 60,
        margin: "0 auto",
        background: "linear-gradient(135deg, #1b263b, #0d1b2a)",
        borderRadius: "20%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.8rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        border: "2px solid #27ae60",
      }}
    >
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        😺
      </motion.span>
    </motion.div>
  );
}

// ── Card data ───────────────────────────────────────────────
const CARDS = [
  {
    title: "Sayaç",
    emoji: "⏱️",
    description: "Birlikte geçirdiğimiz zamanı keşfet",
    route: "/counter",
    giftBoxColor: "#FF8FAB",
    previewContent: <CounterPreview />,
  },
  {
    title: "Yıldız Haritası",
    emoji: "🌌",
    description: "İlk buluştuğumuz geceye bak",
    route: "/starmap",
    giftBoxColor: "#7B9EC8",
    previewContent: <StarMapPreview />,
  },
  {
    title: "Müzik Çalar",
    emoji: "🎵",
    description: "Bizim şarkılarımız",
    route: "/music",
    giftBoxColor: "#C8A2C8",
    previewContent: <MusicPreview />,
  },
  {
    title: "Neden Seni Seviyorum",
    emoji: "💗",
    description: "Seni sevmemin bin bir sebebi",
    route: "/love-reasons",
    giftBoxColor: "#FF6B81",
    previewContent: <LoveReasonsPreview />,
  },
  {
    title: "Quiz",
    emoji: "🧡",
    description: "Bizi ne kadar iyi tanıyorsun?",
    route: "/quiz",
    giftBoxColor: "#FFD580",
    previewContent: <QuizPreview />,
  },
  {
    title: "Aşk Oyunu",
    emoji: "🎮",
    description: "Kalpleri topla, sevgimizi büyüt!",
    route: "/game",
    giftBoxColor: "#27ae60",
    previewContent: <GamePreview />,
  },
];

export default function LandingPage() {
  return (
    <main>
      {/* ── HERO ── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px 40px",
          textAlign: "center",
        }}
      >
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 16 }}
        >
          <span
            style={{
              fontFamily: "var(--font-script), cursive",
              fontSize: "clamp(1rem, 3vw, 1.4rem)",
              color: "var(--color-pink-deep)",
              fontWeight: 600,
            }}
          >
            {siteConfig.partnerName}...
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-heading), Quicksand, sans-serif",
            fontSize: "clamp(2rem, 6vw, 3.8rem)",
            fontWeight: 900,
            background: "linear-gradient(135deg, var(--color-pink-deep), var(--color-lavender), var(--color-gold))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.15,
            maxWidth: 700,
            marginBottom: 16,
          }}
        >
          {siteConfig.heroTitle}
        </motion.h1>

        {siteConfig.heroSubtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              color: "var(--color-text-soft)",
              maxWidth: 480,
              marginBottom: 60,
              lineHeight: 1.6,
            }}
          >
            {siteConfig.heroSubtitle}
          </motion.p>
        )}

        {/* Dinamik Fotoğraf Albümü */}
        <LandingAlbum />

        {/* Gift box cards grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
            width: "100%",
            maxWidth: 660,
          }}
        >
          {CARDS.map((card, i) => (
            <GiftBoxCard key={card.route} {...card} index={i} />
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          style={{ marginTop: 60, textAlign: "center" }}
        >
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-soft)", marginBottom: 8 }}>
            Daha fazlası için aşağı kaydır
          </p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: "1.5rem" }}
          >
            ↓
          </motion.div>
        </motion.div>
      </section>

      {/* ── BUCKET LIST (below fold) ── */}
      <BucketListSection />
    </main>
  );
}
