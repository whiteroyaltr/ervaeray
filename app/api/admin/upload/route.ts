/**
 * POST /api/admin/upload
 * Dosyaları R2'ye yükler.
 * Body: multipart/form-data
 *   - file: File
 *   - folder: string (örn. "music", "music/covers", "photos/landing", "videos", "gifs/quiz")
 *   - password: string
 */
import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";
import path from "path";

export const dynamic = "force-dynamic";
// Büyük dosyalar için body limit artırımı
export const maxDuration = 60;

function checkPassword(password: string): boolean {
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminPass) return false;
  return password === adminPass;
}

// Dosya adını güvenli hale getir (Türkçe karakterler vb.)
function sanitizeFilename(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // aksanları kaldır
    .replace(/[^a-zA-Z0-9._-]/g, "-") // özel karakterleri tire yap
    .replace(/-+/g, "-") // çoklu tireleri birleştir
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Şifre kontrolü
    const password = formData.get("password") as string;
    if (!checkPassword(password)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // Dosyayı Buffer'a çevir
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // R2 key: folder/sanitized-filename
    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext);
    const safeFilename = sanitizeFilename(baseName) + ext.toLowerCase();
    const key = `${folder.replace(/^\/|\/$/g, "")}/${safeFilename}`;

    // R2'ye yükle
    const publicUrl = await uploadToR2(key, buffer, file.type);

    return NextResponse.json({
      success: true,
      key,
      publicUrl,
      filename: safeFilename,
      size: file.size,
      contentType: file.type,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("R2 upload hatası:", err);
    return NextResponse.json(
      { error: `Yükleme hatası: ${message}` },
      { status: 500 }
    );
  }
}
