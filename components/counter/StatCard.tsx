"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import CountUp from "react-countup";
import { type Statistic } from "@/config/counters";

interface StatCardProps {
  stat: Statistic;
  index: number;
}

export default function StatCard({ stat, index }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, type: "spring", stiffness: 200 }}
      className="glass-card"
      style={{ padding: "24px 16px", textAlign: "center" }}
    >
      <div style={{ fontSize: "2rem", marginBottom: 8 }}>{stat.icon}</div>

      <div
        style={{
          fontFamily: "var(--font-heading), Quicksand, sans-serif",
          fontWeight: 900,
          fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
          background: "linear-gradient(135deg, #FF8FAB, #FFD580)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {stat.prefix && <span>{stat.prefix}</span>}
        {inView ? (
          <CountUp
            end={stat.value}
            duration={2}
            separator="."
            useEasing
          />
        ) : (
          <span>0</span>
        )}
      </div>

      <p
        style={{
          fontSize: "0.82rem",
          color: "var(--color-text-soft)",
          fontWeight: 600,
          lineHeight: 1.4,
        }}
      >
        {stat.suffix}
      </p>
    </motion.div>
  );
}
