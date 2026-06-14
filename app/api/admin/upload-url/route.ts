import { NextRequest, NextResponse } from "next/server";
import { getSignedUploadUrl, getPublicUrl } from "@/lib/r2";
import path from "path";

export const dynamic = "force-dynamic";

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
    const { filename, contentType, folder, password } = await request.json();

    // Şifre kontrolü
    const adminPass = process.env.ADMIN_PASSWORD;
    if (adminPass && password !== adminPass) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
    }

    const safeFolder = folder || "uploads";
    
    // Güvenli dosya adı oluştur
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);
    let safeFilename = sanitizeFilename(baseName);
    if (!safeFilename) safeFilename = "file";
    safeFilename += ext.toLowerCase();

    // Benzersizlik için timestamp ekle (isteğe bağlı ama faydalı)
    const uniqueFilename = `${Date.now()}-${safeFilename}`;
    const key = `${safeFolder.replace(/^\/|\/$/g, "")}/${uniqueFilename}`;

    const uploadUrl = await getSignedUploadUrl(key, contentType);
    const publicUrl = getPublicUrl(key);

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("Presigned URL hatası:", err);
    return NextResponse.json(
      { error: `URL alınamadı: ${message}` },
      { status: 500 }
    );
  }
}
