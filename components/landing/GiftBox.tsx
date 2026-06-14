"use client";

import { motion } from "framer-motion";

interface GiftBoxProps {
  color?: string;
  isOpen?: boolean;
  isAnimating?: boolean;
}

export default function GiftBox({
  color = "#FF8FAB",
  isOpen = false,
  isAnimating = false,
}: GiftBoxProps) {
  // Lid and body colors derived from the main color
  const lidColor = color;
  const bodyColor = `${color}CC`; // slightly transparent

  return (
    <motion.div
      className="relative select-none"
      style={{ width: 80, height: 80 }}
      animate={isAnimating ? { scale: [1, 1.15, 0.95, 1.05, 1], rotate: [0, -5, 5, -3, 0] } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Box body */}
      <motion.div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 48,
          background: `linear-gradient(135deg, ${bodyColor}, ${color})`,
          borderRadius: "0 0 12px 12px",
          boxShadow: `0 6px 20px ${color}55`,
        }}
        animate={isOpen ? { scaleY: 0, opacity: 0, originY: 1 } : { scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {/* Vertical ribbon */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 10,
            transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.5)",
            borderRadius: 5,
          }}
        />
      </motion.div>

      {/* Box lid */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: -4,
          right: -4,
          height: 36,
          background: `linear-gradient(135deg, ${color}, ${lidColor}EE)`,
          borderRadius: "12px 12px 0 0",
          boxShadow: `0 4px 12px ${color}44`,
          transformOrigin: "top center",
        }}
        animate={
          isOpen
            ? { rotateX: -120, y: -30, opacity: 0 }
            : { rotateX: 0, y: 0, opacity: 1 }
        }
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Horizontal ribbon on lid */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 10,
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.5)",
            borderRadius: 5,
          }}
        />
        {/* Bow left */}
        <motion.div
          style={{
            position: "absolute",
            top: -16,
            left: "35%",
            width: 14,
            height: 14,
            background: "white",
            borderRadius: "50% 50% 0 50%",
            opacity: 0.9,
            transformOrigin: "bottom right",
          }}
          animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 0.9 }}
          transition={{ duration: 0.25 }}
        />
        {/* Bow right */}
        <motion.div
          style={{
            position: "absolute",
            top: -16,
            right: "35%",
            width: 14,
            height: 14,
            background: "white",
            borderRadius: "50% 50% 50% 0",
            opacity: 0.9,
            transformOrigin: "bottom left",
          }}
          animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 0.9 }}
          transition={{ duration: 0.25 }}
        />
        {/* Bow center */}
        <div
          style={{
            position: "absolute",
            top: -8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 12,
            height: 12,
            background: "white",
            borderRadius: "50%",
            opacity: 0.95,
          }}
        />
      </motion.div>
    </motion.div>
  );
}
