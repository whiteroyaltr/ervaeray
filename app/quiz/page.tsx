"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import confetti from "canvas-confetti";
import { quizConfig, type QuizQuestion } from "@/config/quiz";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type AnswerState = "idle" | "correct" | "incorrect";

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  total: number;
  onAnswer: (isCorrect: boolean) => void;
}

function QuestionCard({ question, index, total, onAnswer }: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [state, setState] = useState<AnswerState>("idle");

  function handleSelect(optionIndex: number) {
    if (state !== "idle") return;
    setSelected(optionIndex);
    const isCorrect = optionIndex === question.correctIndex;
    setState(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 },
        colors: ["#FF8FAB", "#FFD580", "#B5EAD7", "#C8A2C8"],
        scalar: 0.8,
      });
    }

    setTimeout(() => onAnswer(isCorrect), 1600);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-soft)", marginBottom: 8, fontWeight: 600 }}>
          <span>Soru {index + 1} / {total}</span>
          <span>🧡 {Math.round(((index) / total) * 100)}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "rgba(200,162,200,0.25)", overflow: "hidden" }}>
          <motion.div
            style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg, var(--color-pink), var(--color-lavender))" }}
            initial={{ width: `${(index / total) * 100}%` }}
            animate={{ width: `${((index + 1) / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="glass-card" style={{ padding: "32px 24px", marginBottom: 20, textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-heading), Quicksand, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
            color: "var(--color-text)",
            lineHeight: 1.5,
          }}
        >
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === question.correctIndex;
          let bg = "var(--color-white-glass)";
          let borderColor = "rgba(255,255,255,0.6)";
          let color = "var(--color-text)";

          if (state !== "idle") {
            if (isCorrect) {
              bg = "linear-gradient(135deg, #D6FFE8, #B5EAD7)";
              borderColor = "var(--color-mint-deep)";
              color = "#2d8a6a";
            } else if (isSelected && !isCorrect) {
              bg = "linear-gradient(135deg, #FFD6D6, #FFAAAA)";
              borderColor = "#FF6B81";
              color = "#c0392b";
            }
          }

          return (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={state !== "idle"}
              whileHover={state === "idle" ? { scale: 1.03, y: -2 } : {}}
              whileTap={state === "idle" ? { scale: 0.97 } : {}}
              animate={
                isSelected && state === "incorrect"
                  ? { x: [-8, 8, -6, 6, -4, 4, 0] }
                  : isCorrect && state !== "idle"
                  ? { scale: [1, 1.06, 1] }
                  : {}
              }
              transition={{ duration: 0.4 }}
              style={{
                background: bg,
                border: `2px solid ${borderColor}`,
                borderRadius: 16,
                padding: "16px 12px",
                fontSize: "0.9rem",
                fontWeight: 700,
                color,
                cursor: state === "idle" ? "pointer" : "default",
                backdropFilter: "blur(12px)",
                transition: "background 0.3s, border-color 0.3s, color 0.3s",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              {isCorrect && state !== "idle" ? "✓ " : isSelected && state === "incorrect" ? "✗ " : ""}
              {opt}
            </motion.button>
          );
        })}
      </div>

      {/* Reward / incorrect message */}
      <AnimatePresence>
        {state !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card"
            style={{
              marginTop: 20,
              padding: "16px 20px",
              textAlign: "center",
              borderLeft: `4px solid ${state === "correct" ? "var(--color-mint-deep)" : "var(--color-pink-deep)"}`,
            }}
          >
            <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text)" }}>
              {state === "correct"
                ? (question.rewardMessage ?? "Doğru! Harikasın! 🎉")
                : (question.incorrectMessage ?? "Yanlış, üzülme! 😊")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ResultsScreen({ score, total, onReplay }: { score: number; total: number; onReplay: () => void }) {
  const pct = score / total;
  const message =
    pct === 1
      ? quizConfig.finalMessages.perfectScore
      : pct >= 0.5
      ? quizConfig.finalMessages.goodScore
      : quizConfig.finalMessages.needsPractice;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={{ textAlign: "center" }}
    >
      <div style={{ fontSize: "4rem", marginBottom: 16 }}>
        {pct === 1 ? "🥰" : pct >= 0.5 ? "😊" : "😄"}
      </div>
      <h2 className="section-title" style={{ marginBottom: 12 }}>
        {score} / {total} Doğru!
      </h2>

      <div className="glass-card" style={{ padding: "28px 24px", margin: "24px 0" }}>
        <p style={{ fontFamily: "var(--font-script), cursive", fontSize: "1.2rem", lineHeight: 1.7, color: "var(--color-text)" }}>
          {message}
        </p>
      </div>

      {/* Score bar */}
      <div style={{ height: 10, borderRadius: 5, background: "rgba(200,162,200,0.2)", margin: "0 auto 28px", maxWidth: 300, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ height: "100%", borderRadius: 5, background: "linear-gradient(90deg, var(--color-pink), var(--color-lavender))" }}
        />
      </div>

      <motion.button
        className="btn-sweet"
        onClick={onReplay}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🔄 Tekrar Oyna
      </motion.button>
    </motion.div>
  );
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    quizConfig.shuffleQuestions ? shuffle(quizConfig.questions) : quizConfig.questions
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [quizKey, setQuizKey] = useState(0);

  function handleAnswer(isCorrect: boolean) {
    if (isCorrect) setScore((s) => s + 1);
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentQ((q) => q + 1);
    }
  }

  function handleReplay() {
    setQuestions(quizConfig.shuffleQuestions ? shuffle(quizConfig.questions) : quizConfig.questions);
    setCurrentQ(0);
    setScore(0);
    setFinished(false);
    setQuizKey((k) => k + 1);
  }

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "32px 16px 80px" }}>
      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Link href="/" style={{ color: "var(--color-pink-deep)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
          ← Ana Sayfa
        </Link>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", margin: "28px 0 32px" }}
      >
        <h1 className="section-title">🧡 {quizConfig.pageTitle}</h1>
        {quizConfig.introText && !finished && currentQ === 0 && (
          <p className="section-subtitle" style={{ marginTop: 8 }}>{quizConfig.introText}</p>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {!finished ? (
          <QuestionCard
            key={`${quizKey}-${currentQ}`}
            question={questions[currentQ]}
            index={currentQ}
            total={questions.length}
            onAnswer={handleAnswer}
          />
        ) : (
          <ResultsScreen
            key="results"
            score={score}
            total={questions.length}
            onReplay={handleReplay}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
