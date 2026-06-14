"use client";

import { useEffect, useRef } from "react";

// Ambient floating particles: hearts, stars, sparkles
const SYMBOLS = ["💕", "✨", "⭐", "💫", "🌸", "💗", "🌟", "💖", "🌺", "💝"];

interface Particle {
  id: number;
  symbol: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    x: Math.random() * 100, // percent across screen
    size: 0.8 + Math.random() * 1.4, // rem
    duration: 12 + Math.random() * 18, // seconds
    delay: Math.random() * 20, // seconds
    opacity: 0.15 + Math.random() * 0.35,
  }));
}

const PARTICLES = generateParticles(20);

export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            bottom: "-60px",
            left: `${p.x}%`,
            fontSize: `${p.size}rem`,
            opacity: p.opacity,
            animation: `floatUp ${p.duration}s ${p.delay}s linear infinite`,
            userSelect: "none",
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}
