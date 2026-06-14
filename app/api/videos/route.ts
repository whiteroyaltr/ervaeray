/**
 * GET /api/videos
 * R2'deki videoları listeler ve proxy URL'lerini döner.
 */
import { NextRequest, NextResponse } from "next/server";
import { listR2Files } from "@/lib/r2";

export const dynamic = "force-dynamic";

const VIDEO_EXTS = ["mp4", "webm", "ogg", "mov", "mkv"];

function getExt(key: string): string {
  return key.split(".").pop()?.toLowerCase() ?? "";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get("prefix") || "videos/";

  try {
    const allFiles = await listR2Files(prefix);

    const videos = allFiles
      .filter((f) => VIDEO_EXTS.includes(getExt(f.key)))
      .map((f) => ({
        key: f.key,
        url: `/api/r2?key=${encodeURIComponent(f.key)}`,
      }));

    return NextResponse.json({ videos });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("Videos API hatası:", message);
    return NextResponse.json({ error: message, videos: [] }, { status: 500 });
  }
}
