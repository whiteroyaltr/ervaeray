"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { type MilestoneCounter } from "@/config/counters";

function computeElapsedSimple(
  startISO: string,
  format: "full" | "days-only" | "days-hours" | "future-hours" | "future-full"
): string {
  const start = new Date(startISO);
  const now = new Date();

  if (format === "future-hours") {
    if (now >= start) return "Zamanı Geldi!";
    const diffMs = start.getTime() - now.getTime();
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    return `${totalHours} Saat`;
  }

  if (format === "future-full") {
    if (now >= start) return "Zamanı Geldi!";
    let years = start.getFullYear() - now.getFullYear();
    let months = start.getMonth() - now.getMonth();
    let days = start.getDate() - now.getDate();
    let hours = start.getHours() - now.getHours();

    if (hours < 0) {
      days -= 1;
      hours += 24;
    }
    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(start.getFullYear(), start.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} yıl`);
    if (months > 0) parts.push(`${months} ay`);
    if (days > 0) parts.push(`${days} gün`);
    if (hours > 0) parts.push(`${hours} saat`);
    
    return parts.length > 0 ? parts.join(" ") : "Çok az kaldı!";
  }

  if (now < start) return "Henüz olmadı";

  const diff = now.getTime() - start.getTime();
  const totalSeconds = Math.floor(diff / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  if (format === "days-only") {
    return `${totalDays} gün`;
  }
  if (format === "days-hours") {
    const hours = totalHours % 24;
    return `${totalDays} gün ${hours} saat`;
  }

  // format === "full"
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

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

  return `${years} yıl ${months} ay ${days} gün`;
}

interface MilestoneCounterCardProps {
  milestone: MilestoneCounter;
  index: number;
}

export default function MilestoneCounterCard({ milestone, index }: MilestoneCounterCardProps) {
  const [elapsed, setElapsed] = useState(() =>
    computeElapsedSimple(milestone.date, milestone.displayFormat)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(computeElapsedSimple(milestone.date, milestone.displayFormat));
    }, 1000);
    return () => clearInterval(id);
  }, [milestone.date, milestone.displayFormat]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card"
      style={{ padding: "24px 20px", textAlign: "center" }}
    >
      <div style={{ fontSize: "2rem", marginBottom: 8 }}>{milestone.icon}</div>
      <p
        style={{
          fontSize: "0.8rem",
          fontWeight: 700,
          color: "var(--color-text-soft)",
          letterSpacing: "0.05em",
          marginBottom: 8,
          lineHeight: 1.4,
        }}
      >
        {milestone.label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-heading), Quicksand, sans-serif",
          fontWeight: 900,
          fontSize: "1.3rem",
          background: "linear-gradient(135deg, #FF6B81, #C8A2C8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {elapsed}
      </p>
    </motion.div>
  );
}
