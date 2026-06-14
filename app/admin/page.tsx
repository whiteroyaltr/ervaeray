"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Folder, Music, Image, Video, Film, Trash2, Copy,
  CheckCircle, XCircle, Lock, Eye, EyeOff, RefreshCw,
  FolderOpen, ExternalLink, AlertCircle, X, ChevronDown
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────
interface UploadFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  publicUrl?: string;
  error?: string;
}

interface R2File {
  key: string;
  size: number;
  lastModified: string;
  publicUrl: string;
}

// ── Folder config ─────────────────────────────────────────────
const FOLDERS = [
  { value: "music", label: "🎵 Müzik", icon: Music, accept: "audio/*", color: "#C8A2C8" },
  { value: "music/covers", label: "🖼️ Müzik Kapakları", icon: Image, accept: "image/*", color: "#FF8FAB" },
  { value: "photos/landing", label: "📸 Fotoğraflar (Ana)", icon: Image, accept: "image/*,video/*", color: "#FFD580" },
  { value: "videos", label: "🎬 Videolar", icon: Video, accept: "video/*", color: "#7B9EC8" },
  { value: "gifs/quiz", label: "🎭 Quiz GIF'leri", icon: Film, accept: "image/gif,image/*", color: "#B5EAD7" },
  { value: "photos", label: "🗂️ Diğer Fotoğraflar", icon: Image, accept: "image/*", color: "#FFB347" },
] as const;

type FolderValue = (typeof FOLDERS)[number]["value"];

// ── Helpers ───────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) return "🎵";
  if (["mp4", "mov", "avi", "webm", "mkv"].includes(ext)) return "🎬";
  if (["jpg", "jpeg", "png", "webp", "avif"].includes(ext)) return "🖼️";
  if (ext === "gif") return "🎭";
  return "📄";
}

function uid(): string {
  return Math.random().toString(36).slice(2);
}

// ── Login screen ──────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Quick check: try to list files with this password
    const res = await fetch(`/api/admin/files?password=${encodeURIComponent(pw)}&prefix=`);
    if (res.ok) {
      onLogin(pw);
    } else {
      setError("Yanlış şifre. Tekrar deneyin.");
      setPw("");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-card"
        style={{ width: "100%", maxWidth: 380, padding: "40px 32px", textAlign: "center" }}
      >
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔐</div>
        <h1
          style={{
            fontFamily: "var(--font-heading), Quicksand, sans-serif",
            fontWeight: 900,
            fontSize: "1.6rem",
            background: "linear-gradient(135deg, var(--color-pink-deep), var(--color-lavender))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 6,
          }}
        >
          Admin Paneli
        </h1>
        <p style={{ color: "var(--color-text-soft)", fontSize: "0.85rem", marginBottom: 28 }}>
          Medya yönetimi için şifrenizi girin
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Şifre"
              style={{
                width: "100%",
                padding: "14px 44px 14px 16px",
                borderRadius: 14,
                border: "2px solid rgba(255,143,171,0.3)",
                background: "rgba(255,255,255,0.7)",
                fontSize: "1rem",
                color: "var(--color-text)",
                outline: "none",
                boxSizing: "border-box",
              }}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-soft)",
                padding: 4,
              }}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#e74c3c",
                fontSize: "0.83rem",
                fontWeight: 600,
              }}
            >
              <AlertCircle size={14} /> {error}
            </motion.p>
          )}

          <button type="submit" className="btn-sweet" style={{ width: "100%", justifyContent: "center" }}>
            <Lock size={16} /> Giriş Yap
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Drop zone ─────────────────────────────────────────────────
function DropZone({
  onFiles,
  accept,
  uploading,
}: {
  onFiles: (files: File[]) => void;
  accept: string;
  uploading: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onFiles(files);
    },
    [onFiles]
  );

  return (
    <motion.div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      animate={{ scale: dragging ? 1.02 : 1 }}
      style={{
        border: `2px dashed ${dragging ? "var(--color-pink-deep)" : "rgba(200,162,200,0.5)"}`,
        borderRadius: 20,
        padding: "40px 24px",
        textAlign: "center",
        cursor: uploading ? "not-allowed" : "pointer",
        background: dragging ? "rgba(255,143,171,0.06)" : "rgba(255,255,255,0.4)",
        transition: "all 0.2s ease",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
        style={{ display: "none" }}
      />
      <Upload size={32} color="var(--color-lavender)" style={{ margin: "0 auto 12px" }} />
      <p style={{ fontWeight: 700, color: "var(--color-text)", fontSize: "1rem", marginBottom: 4 }}>
        {uploading ? "Yükleniyor..." : "Dosyaları buraya sürükle veya tıkla"}
      </p>
      <p style={{ fontSize: "0.78rem", color: "var(--color-text-soft)" }}>
        Birden fazla dosya seçebilirsiniz
      </p>
    </motion.div>
  );
}

// ── Upload queue item ─────────────────────────────────────────
function UploadItem({ item, onRemove }: { item: UploadFile; onRemove: () => void }) {
  const [copied, setCopied] = useState(false);

  function copyUrl() {
    if (item.publicUrl) {
      navigator.clipboard.writeText(item.publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const icon = getFileIcon(item.file.name);
  const statusColor =
    item.status === "done" ? "#27ae60" :
    item.status === "error" ? "#e74c3c" :
    item.status === "uploading" ? "var(--color-lavender)" :
    "var(--color-text-soft)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.6)",
        border: "1px solid rgba(200,162,200,0.2)",
      }}
    >
      <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{icon}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.file.name}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: "0.7rem", color: statusColor, fontWeight: 700 }}>
            {item.status === "pending" && "Bekliyor..."}
            {item.status === "uploading" && `${item.progress}%`}
            {item.status === "done" && "✓ Yüklendi!"}
            {item.status === "error" && `✗ ${item.error}`}
          </span>
          <span style={{ fontSize: "0.7rem", color: "var(--color-text-soft)" }}>
            {formatBytes(item.file.size)}
          </span>
        </div>

        {/* Progress bar */}
        {item.status === "uploading" && (
          <div style={{ height: 3, background: "rgba(200,162,200,0.2)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
            <motion.div
              style={{ height: "100%", background: "linear-gradient(90deg, var(--color-pink), var(--color-lavender))", borderRadius: 2 }}
              animate={{ width: `${item.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {item.status === "done" && item.publicUrl && (
          <button
            onClick={copyUrl}
            title="URL'yi kopyala"
            style={{
              background: copied ? "#27ae60" : "rgba(200,162,200,0.2)",
              border: "none",
              borderRadius: 8,
              padding: "6px 8px",
              cursor: "pointer",
              color: copied ? "white" : "var(--color-text-soft)",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.7rem",
              fontWeight: 700,
            }}
          >
            {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
            {copied ? "Kopyalandı!" : "URL"}
          </button>
        )}
        {item.status === "done" && item.publicUrl && (
          <a
            href={item.publicUrl}
            target="_blank"
            rel="noreferrer"
            title="Yeni sekmede aç"
            style={{
              background: "rgba(200,162,200,0.2)",
              border: "none",
              borderRadius: 8,
              padding: "6px 8px",
              cursor: "pointer",
              color: "var(--color-text-soft)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ExternalLink size={13} />
          </a>
        )}
        {(item.status === "pending" || item.status === "error") && (
          <button
            onClick={onRemove}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-soft)", padding: "4px" }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── File browser ──────────────────────────────────────────────
function FileBrowser({ password, folder }: { password: string; folder: string }) {
  const [files, setFiles] = useState<R2File[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/files?password=${encodeURIComponent(password)}&prefix=${encodeURIComponent(folder)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFiles(data.files);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(key: string) {
    if (!confirm(`"${key}" dosyasını silmek istediğinizden emin misiniz?`)) return;
    setDeletingKey(key);
    try {
      const res = await fetch("/api/admin/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFiles((prev) => prev?.filter((f) => f.key !== key) ?? null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Silme hatası");
    } finally {
      setDeletingKey(null);
    }
  }

  function copyUrl(key: string, url: string) {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  if (!files && !loading) {
    return (
      <button
        onClick={load}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--color-lavender)",
          fontWeight: 700,
          fontSize: "0.85rem",
          background: "none",
          border: "2px solid rgba(200,162,200,0.3)",
          borderRadius: 12,
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        <FolderOpen size={16} /> Bu klasördeki dosyaları göster
      </button>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <button
          onClick={load}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-soft)", padding: 4 }}
          title="Yenile"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
        <span style={{ fontSize: "0.78rem", color: "var(--color-text-soft)" }}>
          {loading ? "Yükleniyor..." : `${files?.length ?? 0} dosya`}
        </span>
        {error && <span style={{ color: "#e74c3c", fontSize: "0.75rem" }}>{error}</span>}
      </div>

      {files && files.length === 0 && (
        <p style={{ color: "var(--color-text-soft)", fontSize: "0.82rem", textAlign: "center", padding: "20px 0" }}>
          Bu klasörde henüz dosya yok
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <AnimatePresence>
          {files?.map((f) => {
            const filename = f.key.split("/").pop() ?? f.key;
            const icon = getFileIcon(filename);
            const isDeleting = deletingKey === f.key;
            const isCopied = copiedKey === f.key;

            return (
              <motion.div
                key={f.key}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(200,162,200,0.15)",
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.83rem", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {filename}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "var(--color-text-soft)" }}>
                    {formatBytes(f.size)} · {new Date(f.lastModified).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                  <button
                    onClick={() => copyUrl(f.key, f.publicUrl)}
                    title="URL kopyala"
                    style={{
                      background: isCopied ? "#27ae60" : "rgba(200,162,200,0.2)",
                      border: "none", borderRadius: 8, padding: "5px 8px",
                      cursor: "pointer", color: isCopied ? "white" : "var(--color-text-soft)",
                      fontSize: "0.7rem", fontWeight: 700,
                      display: "flex", alignItems: "center", gap: 4,
                      transition: "all 0.2s",
                    }}
                  >
                    {isCopied ? <CheckCircle size={12} /> : <Copy size={12} />}
                    {isCopied ? "Kopyalandı" : "URL"}
                  </button>
                  <a
                    href={f.publicUrl} target="_blank" rel="noreferrer"
                    style={{
                      background: "rgba(200,162,200,0.2)", border: "none",
                      borderRadius: 8, padding: "5px 7px", cursor: "pointer",
                      color: "var(--color-text-soft)", display: "flex", alignItems: "center",
                    }}
                  >
                    <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={() => handleDelete(f.key)}
                    disabled={isDeleting}
                    style={{
                      background: "rgba(231,76,60,0.1)", border: "none",
                      borderRadius: 8, padding: "5px 7px", cursor: "pointer",
                      color: "#e74c3c", display: "flex", alignItems: "center",
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main admin panel ──────────────────────────────────────────
export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<FolderValue>("music");
  const [queue, setQueue] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "browse">("upload");

  if (!password) {
    return <LoginScreen onLogin={setPassword} />;
  }

  const currentFolder = FOLDERS.find((f) => f.value === selectedFolder)!;

  function addFiles(files: File[]) {
    const newItems: UploadFile[] = files.map((f) => ({
      id: uid(),
      file: f,
      status: "pending",
      progress: 0,
    }));
    setQueue((prev) => [...prev, ...newItems]);
  }

  function removeFromQueue(id: string) {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }

  async function uploadAll() {
    const pending = queue.filter((item) => item.status === "pending");
    if (!pending.length) return;

    setUploading(true);

    for (const item of pending) {
      // Update status to uploading
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "uploading" as const, progress: 10 } : q))
      );

      try {
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("folder", selectedFolder);
        formData.append("password", password as string);

        // Simulate progress while fetching
        const progressInterval = setInterval(() => {
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id && q.status === "uploading"
                ? { ...q, progress: Math.min(q.progress + 15, 90) }
                : q
            )
          );
        }, 300);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "done" as const, progress: 100, publicUrl: data.publicUrl }
              : q
          )
        );
      } catch (e: unknown) {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "error" as const, error: e instanceof Error ? e.message : "Hata" }
              : q
          )
        );
      }
    }

    setUploading(false);
  }

  function clearDone() {
    setQueue((prev) => prev.filter((item) => item.status !== "done"));
  }

  const pendingCount = queue.filter((q) => q.status === "pending").length;
  const doneCount = queue.filter((q) => q.status === "done").length;

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px 80px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-heading), Quicksand, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              background: "linear-gradient(135deg, var(--color-pink-deep), var(--color-lavender))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            🗂️ Medya Yönetimi
          </h1>
          <p style={{ color: "var(--color-text-soft)", fontSize: "0.85rem", marginTop: 4 }}>
            R2 bucket'ına doğrudan yükleme yapın
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: 50,
              background: "rgba(39,174,96,0.1)",
              color: "#27ae60",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            ✓ Bağlı
          </span>
          <button
            onClick={() => setPassword(null)}
            style={{
              background: "none", border: "2px solid rgba(200,162,200,0.3)",
              borderRadius: 12, padding: "6px 14px",
              color: "var(--color-text-soft)", cursor: "pointer",
              fontSize: "0.8rem", fontWeight: 700,
            }}
          >
            Çıkış
          </button>
        </div>
      </motion.div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,255,255,0.5)", borderRadius: 14, padding: 4 }}>
        {(["upload", "browse"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 11,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.88rem",
              background: activeTab === tab ? "white" : "transparent",
              color: activeTab === tab ? "var(--color-pink-deep)" : "var(--color-text-soft)",
              boxShadow: activeTab === tab ? "0 2px 12px rgba(255,107,129,0.12)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            {tab === "upload" ? "⬆️ Yükle" : "📁 Dosyalarım"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "upload" ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Folder selector */}
            <div className="glass-card" style={{ padding: "24px", marginBottom: 20 }}>
              <p style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--color-text)", marginBottom: 14 }}>
                📂 Hedef Klasör
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 8 }}>
                {FOLDERS.map((folder) => (
                  <button
                    key={folder.value}
                    onClick={() => setSelectedFolder(folder.value as FolderValue)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: `2px solid ${selectedFolder === folder.value ? folder.color : "transparent"}`,
                      background: selectedFolder === folder.value ? `${folder.color}22` : "rgba(255,255,255,0.5)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      color: selectedFolder === folder.value ? "var(--color-text)" : "var(--color-text-soft)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {folder.label}
                    <span style={{ display: "block", fontSize: "0.68rem", fontWeight: 400, marginTop: 3, color: "var(--color-text-soft)" }}>
                      /{folder.value}/
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Drop zone */}
            <div className="glass-card" style={{ padding: "24px", marginBottom: 20 }}>
              <DropZone
                onFiles={addFiles}
                accept={currentFolder.accept}
                uploading={uploading}
              />
            </div>

            {/* Queue */}
            {queue.length > 0 && (
              <div className="glass-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <p style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--color-text)" }}>
                    📋 Yükleme Kuyruğu ({queue.length} dosya)
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {doneCount > 0 && (
                      <button
                        onClick={clearDone}
                        style={{
                          background: "rgba(200,162,200,0.2)", border: "none",
                          borderRadius: 10, padding: "6px 14px",
                          color: "var(--color-text-soft)", cursor: "pointer",
                          fontSize: "0.78rem", fontWeight: 700,
                        }}
                      >
                        Tamamlananları Temizle
                      </button>
                    )}
                    {pendingCount > 0 && (
                      <motion.button
                        className="btn-sweet"
                        onClick={uploadAll}
                        disabled={uploading}
                        whileTap={{ scale: 0.97 }}
                        style={{ padding: "8px 20px", fontSize: "0.88rem" }}
                      >
                        <Upload size={15} />
                        {uploading ? "Yükleniyor..." : `Hepsini Yükle (${pendingCount})`}
                      </motion.button>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <AnimatePresence>
                    {queue.map((item) => (
                      <UploadItem
                        key={item.id}
                        item={item}
                        onRemove={() => removeFromQueue(item.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="browse"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* File browser per folder */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {FOLDERS.map((folder) => (
                <div key={folder.value} className="glass-card" style={{ padding: "24px" }}>
                  <p style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--color-text)", marginBottom: 16 }}>
                    {folder.label}
                    <span style={{ fontSize: "0.72rem", color: "var(--color-text-soft)", fontWeight: 400, marginLeft: 8 }}>
                      /{folder.value}/
                    </span>
                  </p>
                  <FileBrowser password={password} folder={folder.value} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
