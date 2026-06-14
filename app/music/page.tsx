"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music,
  Loader2, RefreshCw
} from "lucide-react";
import { musicConfig } from "@/config/music";

// ── Song type (API'den dönen) ─────────────────────────────────
interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string | null;
  memoryNote: string;
}

// ── Vinyl record ──────────────────────────────────────────────
function VinylRecord({ isPlaying, coverUrl }: { isPlaying: boolean; coverUrl?: string | null }) {
  return (
    <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
      <motion.div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "radial-gradient(circle at 30% 30%, #3a3a3a, #111)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={
          isPlaying
            ? { duration: 3, repeat: Infinity, ease: "linear" }
            : { duration: 0.5 }
        }
      >
        {[32, 42, 52, 62].map((r) => (
          <div
            key={r}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: r * 2,
              height: r * 2,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 48,
            height: 48,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: coverUrl
              ? `url(${coverUrl}) center/cover`
              : "linear-gradient(135deg, var(--color-pink), var(--color-lavender))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!coverUrl && <Music size={16} color="white" />}
        </div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 8,
            height: 8,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: "#111",
          }}
        />
      </motion.div>
    </div>
  );
}

// ── Equalizer ─────────────────────────────────────────────────
function Equalizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 24 }}>
      {[0.6, 0.9, 0.5, 1, 0.7, 0.8].map((h, i) => (
        <motion.div
          key={i}
          animate={isPlaying ? { scaleY: [h, 1, h * 0.4, 0.9, h] } : { scaleY: 0.2 }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
          style={{
            width: 3,
            height: `${h * 20}px`,
            background: "linear-gradient(180deg, var(--color-pink), var(--color-lavender))",
            borderRadius: 2,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="glass-card" style={{ padding: "32px 24px", marginBottom: 24 }}>
      <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 24 }}>
        <div style={{
          width: 120, height: 120, borderRadius: "50%",
          background: "rgba(200,162,200,0.15)",
          animation: "pulse 1.5s ease-in-out infinite",
          flexShrink: 0,
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 18, width: "60%", borderRadius: 8, background: "rgba(200,162,200,0.15)", marginBottom: 10 }} />
          <div style={{ height: 14, width: "40%", borderRadius: 8, background: "rgba(200,162,200,0.1)" }} />
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "rgba(200,162,200,0.15)", marginBottom: 20 }} />
      <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
        {[40, 56, 40].map((size, i) => (
          <div key={i} style={{ width: size, height: size, borderRadius: "50%", background: "rgba(200,162,200,0.15)" }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}

// ── Main music player page ─────────────────────────────────────
export default function MusicPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [videos, setVideos] = useState<{ url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [source, setSource] = useState<"r2" | "config" | "">("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentSong = songs[currentIndex];

  // ── Şarkıları API'den yükle ──────────────────────────────────
  async function fetchSongs() {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/music", { cache: "no-store" });
      const data = await res.json();
      if (data.songs && data.songs.length > 0) {
        setSongs(data.songs);
        setSource(data.source ?? "r2");
      } else {
        setLoadError("Henüz şarkı yüklenmedi.");
      }
    } catch {
      setLoadError("Şarkılar yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchVideos() {
    try {
      const res = await fetch("/api/videos", { cache: "no-store" });
      const data = await res.json();
      if (data.videos && data.videos.length > 0) {
        setVideos(data.videos);
        setCurrentVideoIndex(Math.floor(Math.random() * data.videos.length));
      }
    } catch (err) {
      console.error("Videolar yüklenemedi:", err);
    }
  }

  useEffect(() => {
    fetchSongs();
    fetchVideos();
    // Scroll dinleme işlemi artık div üzerindeki onScroll prop'u ile yapılacak.
  }, []);

  // ── Şarkı değişince audio src'yi güncelle ───────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || songs.length === 0) return;

    const wasPlaying = isPlaying;
    audio.pause();
    audio.load(); // src değişti, yeniden yükle

    if (wasPlaying) {
      audio.play().catch(() => {});
    }
  }, [currentIndex, songs]);

  // ── Audio olayları ───────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const onTimeUpdate = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => handleNext();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    // İlk yüklemede süre hazırsa hemen ayarla
    if (audio.readyState >= 1) {
      setDuration(audio.duration || 0);
    }

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [currentSong]);

  // ── Müzik oynatıldığında videoyu da oynat/durdur ───────────────
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentVideoIndex]);

  // ── Ses seviyesi ─────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // ── Kontroller ───────────────────────────────────────────────
  function handlePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }

  function handlePrev() {
    setIsPlaying(true);
    setProgress(0);
    setDuration(0);
    setCurrentIndex((i) => (i - 1 + songs.length) % songs.length);
  }

  function handleNext() {
    setIsPlaying(true);
    setProgress(0);
    setDuration(0);
    setCurrentIndex((i) => (i + 1) % songs.length);
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
    setProgress(pct);
  }

  function selectSong(index: number) {
    setIsPlaying(true);
    setProgress(0);
    setDuration(0);
    setCurrentIndex(index);
  }

  function formatTime(secs: number) {
    if (!isFinite(secs) || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  const { pageTitle } = musicConfig;

  return (
    <div
      onScroll={(e) => {
        setIsScrolled(e.currentTarget.scrollTop > 350);
      }}
      style={{
        height: "100vh",
        margin: "0 -1rem", // page-wrapper'ın 1rem padding'ini sıfırlamak için
        overflowY: "auto",
        overflowX: "hidden",
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
      }}
    >
      {/* ── Dinamik Ada (Dynamic Island) ── */}
      <AnimatePresence>
        {isScrolled && currentSong && (
          <motion.div
            initial={{ y: -100, x: "-50%", opacity: 0, scale: 0.8 }}
            animate={{ y: 16, x: "-50%", opacity: 1, scale: 1 }}
            exit={{ y: -100, x: "-50%", opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: "fixed",
              top: 0,
              left: "50%",
              // transform: translateX is handled by framer-motion x: "-50%"
              zIndex: 100,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(12px)",
              borderRadius: 40,
              padding: "10px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              color: "white",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Kapak Fotoğrafı */}
            <div style={{
              width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
              animation: isPlaying ? "spin 4s linear infinite" : "none"
            }}>
              <img src={currentSong.coverUrl || "/placeholder.jpg"} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            {/* Şarkı Bilgisi */}
            <div style={{ display: "flex", flexDirection: "column", maxWidth: 120 }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentSong.title}</span>
              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentSong.artist}</span>
            </div>

            {/* Kontroller */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 8 }}>
              <button onClick={handlePrev} style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 0 }}>
                <SkipBack size={18} />
              </button>
              <button onClick={handlePlay} style={{
                background: "white", border: "none", color: "black", borderRadius: "50%",
                width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
              }}>
                {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" style={{ marginLeft: 3 }} />}
              </button>
              <button onClick={handleNext} style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 0 }}>
                <SkipForward size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Müzik Çalar Bölümü */}
      <main style={{
        position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "32px 16px 40px",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        minHeight: "100vh"
      }}>
        {/* Gizli audio element */}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.audioUrl}
          preload="metadata"
          crossOrigin="anonymous"
        />
      )}

      {/* Geri butonu */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Link href="/" style={{
          color: "var(--color-pink-deep)", fontWeight: 700,
          textDecoration: "none", fontSize: "0.9rem",
        }}>
          ← Ana Sayfa
        </Link>
      </motion.div>

      {/* Başlık */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", margin: "28px 0 32px" }}
      >
        <h1 className="section-title">🎵 {pageTitle}</h1>
        {source === "r2" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}>
            <span style={{
              padding: "4px 12px", borderRadius: 50,
              background: "rgba(39,174,96,0.1)", color: "#27ae60",
              fontSize: "0.72rem", fontWeight: 700,
            }}>
              ✓ R2'den {songs.length} şarkı yüklendi
            </span>
            <button
              onClick={fetchSongs}
              title="Yenile"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--color-text-soft)", padding: 4,
              }}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        )}
      </motion.div>

      {/* Yükleniyor */}
      {loading && <LoadingSkeleton />}

      {/* Hata */}
      {!loading && loadError && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card"
          style={{ padding: "32px", textAlign: "center", marginBottom: 24 }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎵</div>
          <p style={{ fontWeight: 700, color: "var(--color-text)", marginBottom: 8 }}>
            {loadError}
          </p>
          <p style={{ color: "var(--color-text-soft)", fontSize: "0.85rem", marginBottom: 20 }}>
            Admin panelinden müzik dosyası yükleyin.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button
              className="btn-sweet"
              onClick={fetchSongs}
              whileTap={{ scale: 0.97 }}
            >
              <RefreshCw size={15} /> Tekrar Dene
            </motion.button>
            <Link href="/admin" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "12px 24px", borderRadius: 50,
              border: "2px solid rgba(200,162,200,0.4)",
              color: "var(--color-text)", fontWeight: 700,
              textDecoration: "none", fontSize: "0.9rem",
            }}>
              🗂️ Admin Paneli
            </Link>
          </div>
        </motion.div>
      )}

      {/* Player */}
      {!loading && currentSong && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card"
            style={{ padding: "32px 24px", marginBottom: 24 }}
          >
            {/* Üst satır: vinil + şarkı bilgisi */}
            <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
              <VinylRecord isPlaying={isPlaying} coverUrl={currentSong.coverUrl} />
              <div style={{ flex: 1, minWidth: 160 }}>
                <Equalizer isPlaying={isPlaying} />
                <h2 style={{
                  fontFamily: "var(--font-heading), Quicksand, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  color: "var(--color-text)",
                  marginTop: 8,
                  lineHeight: 1.3,
                }}>
                  {currentSong.title}
                </h2>
                {currentSong.artist && (
                  <p style={{ color: "var(--color-text-soft)", fontSize: "0.9rem", marginTop: 4 }}>
                    {currentSong.artist}
                  </p>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div
              onClick={handleSeek}
              style={{
                height: 6, borderRadius: 3,
                background: "rgba(200,162,200,0.25)",
                overflow: "hidden", cursor: "pointer", marginBottom: 6,
              }}
            >
              <div style={{
                height: "100%",
                borderRadius: 3,
                width: `${progress * 100}%`,
                background: "linear-gradient(90deg, var(--color-pink), var(--color-lavender))",
                transition: "width 0.1s linear",
              }} />
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: "0.75rem", color: "var(--color-text-soft)", marginBottom: 20,
            }}>
              <span>{formatTime(progress * duration)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Kontrol butonları */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
              <button
                onClick={handlePrev}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--color-lavender)", padding: 8,
                }}
              >
                <SkipBack size={24} />
              </button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handlePlay}
                className="btn-sweet"
                style={{
                  width: 56, height: 56, borderRadius: "50%",
                  padding: 0, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} />}
              </motion.button>

              <button
                onClick={handleNext}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--color-lavender)", padding: 8,
                }}
              >
                <SkipForward size={24} />
              </button>
            </div>

            {/* Ses seviyesi */}
            <div style={{
              marginTop: 20, maxWidth: 200, margin: "20px auto 0",
            }}>
              <button
                onClick={() => setMuted(!muted)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--color-text-soft)",
                }}
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range" min={0} max={1} step={0.02}
                value={muted ? 0 : volume}
                onChange={(e) => { setVolume(+e.target.value); setMuted(false); }}
                style={{ flex: 1, accentColor: "var(--color-pink-deep)" }}
              />
            </div>

            <AnimatePresence mode="wait">
              {currentSong.memoryNote && (
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    marginTop: 24,
                    padding: "16px 20px",
                    background: "rgba(255,143,171,0.08)",
                    borderRadius: 16,
                    borderLeft: "3px solid var(--color-pink)",
                  }}
                >
                  <p style={{
                    fontFamily: "var(--font-script), cursive",
                    fontSize: "1rem",
                    color: "var(--color-text)",
                    lineHeight: 1.7,
                  }}>
                    💕 {currentSong.memoryNote}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Çalma listesi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
            style={{ padding: "20px 16px" }}
          >
            <h3 style={{
              fontWeight: 800, fontSize: "1rem",
              color: "var(--color-text)", marginBottom: 14, paddingLeft: 8,
            }}>
              🎶 Çalma Listesi
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {songs.map((song, i) => (
                <motion.div
                  key={song.id}
                  onClick={() => selectSong(i)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "10px 14px", borderRadius: 14, cursor: "pointer",
                    background: i === currentIndex
                      ? "linear-gradient(135deg, rgba(255,143,171,0.15), rgba(200,162,200,0.15))"
                      : "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  <span style={{
                    fontSize: "1.2rem", flexShrink: 0,
                    opacity: i === currentIndex ? 1 : 0.5,
                  }}>
                    {i === currentIndex && isPlaying ? "▶️" : "🎵"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontWeight: i === currentIndex ? 700 : 500,
                      fontSize: "0.9rem", color: "var(--color-text)",
                    }}>
                      {song.title}
                    </p>
                    {song.artist && (
                      <p style={{ fontSize: "0.78rem", color: "var(--color-text-soft)" }}>
                        {song.artist}
                      </p>
                    )}
                  </div>
                  {i === currentIndex && (
                    <div style={{ flexShrink: 0 }}>
                      <Equalizer isPlaying={isPlaying} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* Aşağı Kaydır Butonu (En Altta, Zıplayan) */}
      {videos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { delay: 0.5, duration: 0.8 },
            y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
          }}
          style={{
            position: "absolute",
            bottom: 32,
            left: 0,
            width: "100%",
            textAlign: "center",
            pointerEvents: "none", // Tıklama sadece butonda çalışsın
          }}
        >
          <button
            onClick={() => {
              document.getElementById("video-section-0")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              pointerEvents: "auto",
              background: "rgba(255,143,171,0.15)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,143,171,0.4)",
              color: "var(--color-pink-deep)",
              padding: "12px 28px",
              borderRadius: 30,
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(255,143,171,0.2)",
              transition: "all 0.2s ease",
            }}
          >
            Görsel Anılara Git ↓
          </button>
        </motion.div>
      )}
      </main>

      {/* ── Sinematik Video Alanı (Reels Kaydırmalı) ── */}
      {videos.length > 0 && videos.map((vid, idx) => (
        <motion.section
          key={vid.url + idx}
          id={`video-section-${idx}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            position: "relative",
            width: "100%",
            height: "100vh",
            background: "#000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            boxShadow: idx === 0 ? "0 -20px 40px rgba(0,0,0,0.5)" : "none",
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
          }}
        >
          <video
            src={vid.url}
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* Karartma filtresi / Vignette efekti */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.7) 100%)",
            pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute",
            bottom: 40,
            color: "rgba(255,255,255,0.7)",
            fontSize: "0.9rem",
            letterSpacing: 2,
            fontFamily: "var(--font-heading)",
            textAlign: "center"
          }}>
            SINEMATIK ANILAR
          </div>
        </motion.section>
      ))}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
