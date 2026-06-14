"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Heart {
  id: number;
  x: number;
  y: number;
  speed: number;
}

export default function LoveGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0); // For accurate reading inside intervals
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hasLost, setHasLost] = useState(false);

  // Position state (we don't use React state for animation to avoid re-renders)
  const charPos = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight - 100 : 0 });
  const targetPos = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight - 100 : 0 });
  
  const charRef = useRef<HTMLDivElement>(null);
  const heartsRef = useRef<Heart[]>([]);
  const [, setTick] = useState(0); // Sadece kalpleri çizmek için manuel render tetikleyici

  const animationFrameId = useRef<number>(0);
  const heartSpawnIntervalId = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setHasLost(false);
    setIsPlaying(true);
    heartsRef.current = [];
    charPos.current = { x: window.innerWidth / 2, y: window.innerHeight - 100 };
    targetPos.current = { x: window.innerWidth / 2, y: window.innerHeight - 100 };
    
    // Start game loop
    lastTime.current = performance.now();
    animationFrameId.current = requestAnimationFrame(gameLoop);
    
    // Spawn hearts
    heartSpawnIntervalId.current = setInterval(spawnHeart, 700);
  };

  const spawnHeart = () => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    // Hızlanma ivmesi lineer ve çok çok düşük: skor 40'a kadar çok rahat oynanabilmesi için 0.03'e çekildi
    const baseSpeed = 1.5 + scoreRef.current * 0.03;
    const newHeart: Heart = {
      id: Math.random(),
      x: Math.random() * (width - 40) + 20,
      y: -50,
      speed: Math.random() * 0.5 + baseSpeed, // Random fark da düşürüldü ki aniden fırlamasın
    };
    heartsRef.current.push(newHeart);
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    cancelAnimationFrame(animationFrameId.current);
    if (heartSpawnIntervalId.current) {
      clearInterval(heartSpawnIntervalId.current);
    }
  };

  const handleLoss = () => {
    setHasLost(true);
    endGame();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    targetPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const lastTime = useRef(0);

  const gameLoop = (time: number) => {
    const deltaTime = time - lastTime.current;
    lastTime.current = time;

    // 1. Move character towards target smoothly (Lerp)
    charPos.current.x += (targetPos.current.x - charPos.current.x) * 0.1;
    charPos.current.y += (targetPos.current.y - charPos.current.y) * 0.1;

    // Update char DOM element directly for performance
    if (charRef.current) {
      // Başlangıçta 0.4 (minicik), her kalpte 0.08 büyür, maks skor 20
      const cappedScore = Math.min(scoreRef.current, 20);
      const currentScale = 0.4 + cappedScore * 0.08;
      charRef.current.style.transform = `translate(${charPos.current.x - 25}px, ${charPos.current.y - 25}px) scale(${currentScale})`;
    }

    // 2. Move hearts and check collisions
    const cappedScore = Math.min(scoreRef.current, 20);
    const currentScale = 0.4 + cappedScore * 0.08;
    const charRadius = 25 * currentScale * 0.8; // Approximate hit radius

    heartsRef.current = heartsRef.current.filter((heart) => {
      heart.y += heart.speed;

      // Collision detection (circle approximation)
      const dx = heart.x - charPos.current.x;
      const dy = heart.y - charPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < charRadius + 15) {
        // Collected!
        scoreRef.current += 1;
        setScore(scoreRef.current);
        return false; // Remove heart
      }

      // Remove if out of bounds (missed)
      if (containerRef.current && heart.y > containerRef.current.clientHeight + 50) {
        handleLoss();
        return false;
      }

      return true;
    });

    // Force re-render just for hearts if game is playing
    setTick((t) => t + 1);

    animationFrameId.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      if (heartSpawnIntervalId.current) {
        clearInterval(heartSpawnIntervalId.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerMove={isPlaying ? handlePointerMove : undefined}
      style={{
        position: "relative",
        width: "100%",
        height: "70vh",
        background: "linear-gradient(180deg, #0d1b2a, #1b263b)",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)",
        touchAction: "none", // Prevent scrolling on mobile while playing
      }}
    >
      {!isPlaying && !gameOver && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
          <h2 style={{ color: "var(--color-pink)", fontSize: "2rem", marginBottom: 20, fontFamily: "var(--font-heading)" }}>Aşk Oyunu</h2>
          <p style={{ color: "var(--color-text-soft)", marginBottom: 30, textAlign: "center", maxWidth: 300 }}>
            Ekrandaki kalpleri toplayıp karakteri büyüt. Farenle veya parmağınla yönlendir!
          </p>
          <button onClick={startGame} className="btn-sweet">
            Oyuna Başla
          </button>
        </div>
      )}

      {gameOver && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ textAlign: "center" }}>
            <h2 style={{ color: "var(--color-pink-deep)", fontSize: "3rem", marginBottom: 10 }}>
              {hasLost ? "Kaybettin! 😢" : "Oyun Bitti!"}
            </h2>
            <p style={{ color: "white", fontSize: "1.5rem", marginBottom: 20 }}>Skorun: {score} 💗</p>
            <p style={{ color: "var(--color-lavender)", marginBottom: 30, fontSize: "1.1rem" }}>
              {hasLost 
                ? "Bir kalbi kaçırdın! Ama aşkımız asla kaçmaz..."
                : (score >= 20 ? "Kocaman bir aşk! Seni çok seviyorum!" : "Biraz daha sevgi toplayabiliriz!")}
            </p>
            <button onClick={startGame} className="btn-sweet" style={{ background: "white", color: "var(--color-pink-deep)" }}>
              Tekrar Oyna
            </button>
          </motion.div>
        </div>
      )}

      {isPlaying && (
        <>
          <div style={{ position: "absolute", top: 20, left: 20, color: "white", fontSize: "1.5rem", fontWeight: "bold", zIndex: 5 }}>
            Skor: {score}
          </div>
          <button 
            onClick={endGame}
            style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.2)", color: "white", border: "none", padding: "8px 16px", borderRadius: 20, cursor: "pointer", zIndex: 5 }}
          >
            Bitir
          </button>
        </>
      )}

      {/* Character */}
      <div
        ref={charRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 50,
          height: 50,
          fontSize: "40px",
          display: isPlaying ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none", // so it doesn't block pointerMove
          willChange: "transform",
        }}
      >
        😺
      </div>

      {/* Hearts */}
      {isPlaying && heartsRef.current.map((heart) => (
        <div
          key={heart.id}
          style={{
            position: "absolute",
            top: heart.y,
            left: heart.x - 15, // center horizontally (30px width)
            width: 30,
            height: 30,
            fontSize: "24px",
            pointerEvents: "none",
            willChange: "transform",
          }}
        >
          💗
        </div>
      ))}
    </div>
  );
}
