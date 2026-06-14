/**
 * GET /api/photos
 * R2'deki fotoğrafları listeler ve proxy URL'lerini döner.
 */
import { NextRequest, NextResponse } from "next/server";
import { listR2Files } from "@/lib/r2";

export const dynamic = "force-dynamic";

const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "avif", "gif"];

function getExt(key: string): string {
  return key.split(".").pop()?.toLowerCase() ?? "";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get("prefix") || "photos/";

  try {
    const allFiles = await listR2Files(prefix);

    const photos = allFiles
      .filter((f) => IMAGE_EXTS.includes(getExt(f.key)))
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime()) // Yeniden eskiye
      .map((f) => ({
        key: f.key,
        url: `/api/r2?key=${encodeURIComponent(f.key)}`,
      }));

    return NextResponse.json({ photos });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("Photos API hatası:", message);
    return NextResponse.json({ error: message, photos: [] }, { status: 500 });
  }
}
