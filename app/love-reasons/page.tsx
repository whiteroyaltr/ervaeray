"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import confetti from "canvas-confetti";
import { loveReasonsConfig } from "@/config/love-reasons";

const PASTEL_COLORS = [
  "linear-gradient(135deg, #FFD6E0, #FFAEC9)",
  "linear-gradient(135deg, #E0D6FF, #C5B4FF)",
  "linear-gradient(135deg, #D6F5FF, #A8E6FF)",
  "linear-gradient(135deg, #D6FFE8, #A8FFD0)",
  "linear-gradient(135deg, #FFF3D6, #FFE5A8)",
  "linear-gradient(135deg, #FFE0F5, #FFC2E8)",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LoveReasonsPage() {
  const { pageTitle, buttonText, reasons } = loveReasonsConfig;
  const [deck, setDeck] = useState<string[]>(() => shuffle(reasons));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [key, setKey] = useState(0);

  const totalShown = shown + 1;

  function handleReveal() {
    // Sparkle effect
    confetti({
      particleCount: 40,
      spread: 55,
      origin: { y: 0.5 },
      colors: ["#FF8FAB", "#FFD6E0", "#C8A2C8", "#FFD580"],
      scalar: 0.75,
      shapes: ["circle"],
    });

    setDirection(1);
    setKey((k) => k + 1);

    const nextIndex = currentIndex + 1;
    if (nextIndex >= deck.length) {
      // Pool exhausted — reshuffle
      setDeck(shuffle(reasons));
      setCurrentIndex(0);
      setShown((s) => s + 1);
    } else {
      setCurrentIndex(nextIndex);
      setShown((s) => s + 1);
    }
    setColorIndex((c) => (c + 1) % PASTEL_COLORS.length);
  }

  const currentReason = deck[currentIndex] ?? reasons[0];

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px 80px" }}>
      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Link href="/" style={{ color: "var(--color-pink-deep)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
          ← Ana Sayfa
        </Link>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", margin: "28px 0 40px" }}
      >
        <h1 className="section-title">💗 {pageTitle}</h1>
        <p className="section-subtitle" style={{ marginTop: 8 }}>
          Her tıklamada yeni bir sebep...
        </p>
      </motion.div>

      {/* Card stack visual */}
      <div className="card-stack" style={{ marginBottom: 40 }}>
        {/* Background cards */}
        {[2, 1].map((offset) => (
          <div
            key={offset}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 24,
              background: PASTEL_COLORS[(colorIndex + offset) % PASTEL_COLORS.length],
              transform: `rotate(${offset * 4}deg) translateY(${offset * 8}px)`,
              boxShadow: "0 8px 40px rgba(255,107,129,0.12)",
              zIndex: 3 - offset,
            }}
          />
        ))}

        {/* Active card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ rotateY: 90, opacity: 0, scale: 0.95 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            exit={{ x: direction * 300, opacity: 0, rotate: direction * 15 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 24,
              background: PASTEL_COLORS[colorIndex],
              boxShadow: "0 16px 60px rgba(255,107,129,0.25)",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 32px",
              textAlign: "center",
            }}
          >
            {/* Heart icon */}
            <motion.div
              animate={{ scale: [1, 1.12, 1], y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: "3rem", marginBottom: 24 }}
            >
              💗
            </motion.div>

            {/* Reason text */}
            <p
              style={{
                fontFamily: "var(--font-script), cursive",
                fontSize: "clamp(1rem, 3vw, 1.4rem)",
                color: "var(--color-text)",
                lineHeight: 1.7,
                fontWeight: 600,
                overflow: "auto",
                maxHeight: 200,
              }}
            >
              {currentReason}
            </p>

            {/* Counter */}
            <p
              style={{
                position: "absolute",
                bottom: 16,
                right: 20,
                fontSize: "0.72rem",
                color: "var(--color-text-soft)",
                fontWeight: 600,
              }}
            >
              {totalShown} / {reasons.length} sebep
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ textAlign: "center" }}
      >
        <motion.button
          className="btn-sweet"
          onClick={handleReveal}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ fontSize: "1.1rem", padding: "16px 40px" }}
        >
          {buttonText}
        </motion.button>
      </motion.div>
    </main>
  );
}
