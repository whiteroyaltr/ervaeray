"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import MainCounter from "@/components/counter/MainCounter";
import MilestoneCounterCard from "@/components/counter/MilestoneCounter";
import StatCard from "@/components/counter/StatCard";
import { countersConfig } from "@/config/counters";

export default function CounterPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 80px" }}>
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 32 }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--color-pink-deep)",
            fontWeight: 700,
            fontSize: "0.9rem",
            textDecoration: "none",
          }}
        >
          ← Ana Sayfa
        </Link>
      </motion.div>

      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: 12 }}
      >
        <h1 className="section-title">⏱️ Sayaç</h1>
        <p className="section-subtitle">Birlikte geçirdiğimiz muhteşem zaman</p>
      </motion.div>

      {/* Main big counter */}
      <MainCounter
        startDateISO={countersConfig.relationshipStartDate}
        label={countersConfig.mainCounterLabel}
      />

      {/* Milestone counters */}
      <section style={{ marginTop: 60 }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-title"
          style={{ marginBottom: 8, fontSize: "1.8rem" }}
        >
          💝 Kilometre Taşlarımız
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-subtitle"
          style={{ marginBottom: 28 }}
        >
          Her anın üzerinden ne kadar zaman geçti
        </motion.p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {countersConfig.milestones.map((m, i) => (
            <MilestoneCounterCard key={m.id} milestone={m} index={i} />
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section style={{ marginTop: 60 }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-title"
          style={{ marginBottom: 8, fontSize: "1.8rem" }}
        >
          🌟 Bu Süre İçinde...
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-subtitle"
          style={{ marginBottom: 28 }}
        >
          Birlikte yaşadığımız sayısız an
        </motion.p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 14,
          }}
        >
          {countersConfig.statistics.map((stat, i) => (
            <StatCard key={stat.id} stat={stat} index={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
