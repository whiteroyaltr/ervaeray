"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { bucketListConfig, type BucketListItem } from "@/config/bucket-list";

const STORAGE_KEY = "bucket-list-completed";

function loadCompleted(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCompleted(state: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function BucketItem({
  item,
  completed,
  onToggle,
}: {
  item: BucketListItem;
  completed: boolean;
  onToggle: () => void;
}) {
  function handleClick() {
    if (!completed) {
      // Celebration confetti burst
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#B5EAD7", "#7FD8BE", "#FF8FAB", "#FFD580"],
        scalar: 0.9,
      });
    }
    onToggle();
  }

  return (
    <motion.div
      layout
      onClick={handleClick}
      className={`glass-card bucket-item${completed ? " completed" : ""}`}
      style={{
        padding: "16px 20px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 16,
        userSelect: "none",
        position: "relative",
        overflow: "hidden",
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Emoji icon */}
      <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>{item.icon}</span>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontWeight: 700,
            fontSize: "0.95rem",
            color: completed ? "var(--color-mint-deep)" : "var(--color-text)",
            textDecoration: completed ? "line-through" : "none",
            textDecorationColor: "var(--color-mint-deep)",
            transition: "all 0.3s ease",
          }}
        >
          {item.title}
        </p>
        {item.description && (
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-soft)", marginTop: 2 }}>
            {item.description}
          </p>
        )}
      </div>

      {/* Checkbox / checkmark */}
      <motion.div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: `2px solid ${completed ? "var(--color-mint-deep)" : "var(--color-lavender)"}`,
          background: completed ? "var(--color-mint-deep)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.3s ease",
        }}
        animate={completed ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      >
        <AnimatePresence>
          {completed && (
            <motion.span
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{ color: "white", fontSize: "0.85rem", lineHeight: 1 }}
            >
              ✓
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tamamlandı badge */}
      <AnimatePresence>
        {completed && (
          <motion.div
            key="badge"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              background: "var(--color-mint-deep)",
              color: "white",
              fontSize: "0.65rem",
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: 20,
              letterSpacing: "0.05em",
            }}
          >
            ✓ Tamamlandı!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function BucketListSection() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const { sectionTitle, sectionSubtitle, items } = bucketListConfig;

  // Load from localStorage on mount
  useEffect(() => {
    setCompleted(loadCompleted());
  }, []);

  function toggle(id: string) {
    setCompleted((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveCompleted(next);
      return next;
    });
  }

  const completedCount = items.filter((item) => completed[item.id]).length;

  return (
    <section
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "80px 16px 120px",
      }}
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: 40 }}
      >
        <h2 className="section-title">{sectionTitle}</h2>
        {sectionSubtitle && (
          <p className="section-subtitle" style={{ marginTop: 10 }}>
            {sectionSubtitle}
          </p>
        )}

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: "inline-block",
            marginTop: 20,
            padding: "8px 24px",
            borderRadius: 50,
            background: "var(--color-white-glass)",
            backdropFilter: "blur(10px)",
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "var(--color-text-soft)",
          }}
        >
          🌟 {completedCount} / {items.length} tamamlandı
        </motion.div>
      </motion.div>

      {/* Bucket list grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 12,
        }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
          >
            <BucketItem
              item={item}
              completed={!!completed[item.id]}
              onToggle={() => toggle(item.id)}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
