"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import GiftBox from "./GiftBox";
import confetti from "canvas-confetti";

interface GiftBoxCardProps {
  title: string;
  emoji: string;
  description: string;
  route: string;
  giftBoxColor: string;
  previewContent: React.ReactNode;
  index: number;
}

type CardState = "closed" | "animating" | "open";

export default function GiftBoxCard({
  title,
  emoji,
  description,
  route,
  giftBoxColor,
  previewContent,
  index,
}: GiftBoxCardProps) {
  const router = useRouter();
  const [state, setState] = useState<CardState>("closed");

  function handleClick() {
    if (state === "closed") {
      // First tap: unwrap
      setState("animating");

      // Fire confetti burst
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF8FAB", "#C8A2C8", "#FFD580", "#B5EAD7", "#FF6B81"],
        scalar: 0.8,
      });

      setTimeout(() => setState("open"), 900);
    } else if (state === "open") {
      // Second tap: navigate
      router.push(route);
    }
  }

  const isOpen = state === "open";
  const isAnimating = state === "animating";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        onClick={handleClick}
        className="glass-card"
        style={{
          cursor: "pointer",
          padding: "28px 20px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          position: "relative",
          overflow: "hidden",
          minHeight: 220,
          textAlign: "center",
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Colored top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${giftBoxColor}, ${giftBoxColor}88)`,
            borderRadius: "24px 24px 0 0",
          }}
        />

        {/* Gift box overlay (shown when closed/animating) */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              key="giftbox-overlay"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                zIndex: 2,
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(4px)",
                borderRadius: "var(--radius-card)",
              }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
              >
                <GiftBox
                  color={giftBoxColor}
                  isOpen={isOpen || isAnimating}
                  isAnimating={isAnimating}
                />
              </motion.div>
              <motion.p
                animate={{ opacity: [0.6, 1, 0.6], scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: giftBoxColor,
                  letterSpacing: "0.05em",
                }}
              >
                Aç beni! 🎁
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview content (shown when open) */}
        <div
          style={{
            filter: isOpen ? "none" : "blur(6px)",
            transition: "filter 0.4s ease",
            width: "100%",
          }}
        >
          {/* Emoji icon */}
          <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{emoji}</div>

          {/* Card title */}
          <h3
            style={{
              fontFamily: "var(--font-heading), Quicksand, sans-serif",
              fontWeight: 800,
              fontSize: "1.1rem",
              color: "var(--color-text)",
              marginBottom: 6,
            }}
          >
            {title}
          </h3>

          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--color-text-soft)",
              marginBottom: 12,
            }}
          >
            {description}
          </p>

          {/* Mini preview animation */}
          <div style={{ marginBottom: 4 }}>{previewContent}</div>

          {/* "Gitmek için tıkla" hint when open */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 12,
                fontSize: "0.78rem",
                color: giftBoxColor,
                fontWeight: 700,
              }}
            >
              Keşfet →
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
