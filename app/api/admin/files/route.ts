/**
 * GET  /api/admin/files?prefix=music
 * R2 bucket'taki dosyaları listeler.
 *
 * DELETE /api/admin/files
 * Body: { password, key }
 * Belirtilen dosyayı siler.
 */
import { NextRequest, NextResponse } from "next/server";
import { listR2Files, deleteFromR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

function checkPassword(password: string | null): boolean {
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminPass || !password) return false;
  return password === adminPass;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password");
  const prefix = searchParams.get("prefix") ?? undefined;

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const files = await listR2Files(prefix);
    return NextResponse.json({ files });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, key } = body as { password: string; key: string };

    if (!checkPassword(password)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    if (!key) {
      return NextResponse.json({ error: "key gerekli" }, { status: 400 });
    }

    await deleteFromR2(key);
    return NextResponse.json({ success: true, deleted: key });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
