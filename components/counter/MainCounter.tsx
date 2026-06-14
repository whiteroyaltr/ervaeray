"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TimeUnit {
  value: number;
  label: string;
}

function computeElapsed(startDate: Date): TimeUnit[] {
  const now = new Date();
  if (now < startDate) return [];

  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();
  
  let hours = now.getHours() - startDate.getHours();
  let minutes = now.getMinutes() - startDate.getMinutes();
  let seconds = now.getSeconds() - startDate.getSeconds();

  if (seconds < 0) {
    minutes -= 1;
    seconds += 60;
  }
  if (minutes < 0) {
    hours -= 1;
    minutes += 60;
  }
  if (hours < 0) {
    days -= 1;
    hours += 24;
  }
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return [
    { value: years, label: "Yıl" },
    { value: months, label: "Ay" },
    { value: days, label: "Gün" },
    { value: hours, label: "Saat" },
    { value: minutes, label: "Dakika" },
    { value: seconds, label: "Saniye" },
  ];
}

function DigitDisplay({ value, label }: { value: number; label: string }) {
  const prevRef = useRef(value);
  const changed = prevRef.current !== value;
  useEffect(() => { prevRef.current = value; }, [value]);

  const display = String(value).padStart(2, "0");

  return (
    <div style={{ textAlign: "center" }}>
      <motion.div
        key={value}
        initial={changed ? { y: -20, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          fontFamily: "var(--font-heading), Quicksand, sans-serif",
          fontWeight: 900,
          fontSize: "clamp(2rem, 6vw, 4rem)",
          background: "linear-gradient(135deg, #FF6B81, #C8A2C8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1,
          minWidth: "2.5ch",
          display: "block",
        }}
      >
        {display}
      </motion.div>
      <span
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "var(--color-text-soft)",
          textTransform: "uppercase",
          marginTop: 4,
          display: "block",
        }}
      >
        {label}
      </span>
    </div>
  );
}

interface MainCounterProps {
  startDateISO: string;
  label: string;
}

export default function MainCounter({ startDateISO, label }: MainCounterProps) {
  const startDate = new Date(startDateISO);
  const [units, setUnits] = useState<TimeUnit[]>(computeElapsed(startDate));

  useEffect(() => {
    const id = setInterval(() => {
      setUnits(computeElapsed(startDate));
    }, 1000);
    return () => clearInterval(id);
  }, [startDateISO]);

  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      {/* Decorative hearts */}
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontSize: "2rem", marginBottom: 8, display: "inline-block" }}
      >
        💕
      </motion.div>

      <h2
        style={{
          fontFamily: "var(--font-script), cursive",
          fontSize: "clamp(1.2rem, 4vw, 2rem)",
          color: "var(--color-pink-deep)",
          marginBottom: 32,
          fontWeight: 700,
        }}
      >
        {label}
      </h2>

      {/* Counter digits */}
      <div
        className="glass-card"
        style={{
          display: "inline-flex",
          gap: "clamp(16px, 4vw, 32px)",
          padding: "32px clamp(20px, 5vw, 48px)",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-end",
        }}
      >
        {units.map((unit, i) => (
          <div key={unit.label} style={{ display: "flex", alignItems: "flex-end", gap: "clamp(16px, 4vw, 32px)" }}>
            <DigitDisplay value={unit.value} label={unit.label} />
            {i < units.length - 1 && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  color: "var(--color-lavender)",
                  fontWeight: 900,
                  marginBottom: "0.4rem",
                }}
              >
                :
              </motion.span>
            )}
          </div>
        ))}
      </div>

      {/* Decorative bottom hearts */}
      <motion.div
        animate={{ y: [0, -4, 0], rotate: [5, -5, 5] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ fontSize: "1.6rem", marginTop: 16, display: "inline-block" }}
      >
        💝
      </motion.div>
    </div>
  );
}
