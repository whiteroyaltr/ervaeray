/**
 * GET /api/music
 * R2'deki music/ klasörünü listeler ve şarkı bilgilerini döner.
 * - Ses dosyaları /api/r2?key=... proxy üzerinden sunulur (Range destekli)
 * - config/music.ts ile merge edilir (title, artist, memoryNote için)
 * - Kimlik doğrulaması gerektirmez
 */
import { NextRequest, NextResponse } from "next/server";
import { listR2Files } from "@/lib/r2";
import { musicConfig } from "@/config/music";

export const dynamic = "force-dynamic";

const AUDIO_EXTS = ["mp3", "wav", "ogg", "m4a", "flac", "aac", "webm"];
const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "avif"];

function getExt(key: string): string {
  return key.split(".").pop()?.toLowerCase() ?? "";
}

function getBasename(key: string): string {
  const filename = key.split("/").pop() ?? key;
  const lastDot = filename.lastIndexOf(".");
  return lastDot >= 0 ? filename.slice(0, lastDot) : filename;
}

/** Dosya adından okunabilir başlık üret (Türkçe karakter destekli) */
function filenameToTitle(filename: string): string {
  try {
    filename = decodeURIComponent(filename);
  } catch (e) {
    // Eğer decode edilemezse orijinalini kullan
  }

  return filename
    .replace(/[-_]/g, " ")
    .replace(/\.[^.]+$/, "") // Uzantıyı kaldır
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (word.length === 0) return "";
      return (
        word.charAt(0).toLocaleUpperCase("tr-TR") +
        word.slice(1).toLocaleLowerCase("tr-TR")
      );
    })
    .join(" ");
}

export async function GET(_request: NextRequest) {
  try {
    // R2'deki tüm music/ dosyalarını listele
    const allFiles = await listR2Files("music/");

    const audioFiles = allFiles.filter((f) =>
      AUDIO_EXTS.includes(getExt(f.key)) && f.key.startsWith("music/")
    );
    const coverFiles = allFiles.filter((f) =>
      IMAGE_EXTS.includes(getExt(f.key)) && f.key.startsWith("music/covers/")
    );

    // Cover map: basename → key
    const coverMap: Record<string, string> = {};
    coverFiles.forEach((f) => {
      coverMap[getBasename(f.key)] = f.key;
    });

    // config/music.ts'ten metadata al
    const configSongs = musicConfig.songs;

    // R2 dosyalarından şarkı listesi oluştur
    const songs = audioFiles.map((f) => {
      const base = getBasename(f.key);
      const filename = f.key.split("/").pop() ?? f.key;

      // config'den eşleşen şarkıyı bul
      const configMatch = configSongs.find((s) => {
        const configBase = getBasename(
          s.audioUrl.split("/").pop() ?? s.audioUrl
        );
        return configBase === base || s.id === base;
      });

      const coverKey = coverMap[base] ?? null;

      return {
        id: base,
        title: configMatch?.title ?? filenameToTitle(filename),
        artist: configMatch?.artist ?? "",
        // Ses ve kapak /api/r2 proxy üzerinden sunulur
        audioUrl: `/api/r2?key=${encodeURIComponent(f.key)}`,
        coverUrl: coverKey
          ? `/api/r2?key=${encodeURIComponent(coverKey)}`
          : null,
        memoryNote: configMatch?.memoryNote ?? "",
      };
    });

    // R2'de hiç dosya yoksa config'deki şarkıları döndür (placeholder dahil)
    if (songs.length === 0) {
      const fallback = configSongs.map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        audioUrl: s.audioUrl,
        coverUrl: s.coverUrl || null,
        memoryNote: s.memoryNote,
      }));
      return NextResponse.json({ songs: fallback, source: "config" });
    }

    return NextResponse.json({ songs, source: "r2" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("Music API hatası:", err);

    // Hata durumunda config'e fallback yap
    const fallback = musicConfig.songs.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      audioUrl: s.audioUrl,
      coverUrl: s.coverUrl || null,
      memoryNote: s.memoryNote,
    }));
    return NextResponse.json(
      { songs: fallback, source: "config", error: message },
      { status: 200 } // 200 döndür — fallback var
    );
  }
}
