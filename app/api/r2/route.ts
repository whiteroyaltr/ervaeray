/**
 * GET /api/r2?key=music/song.mp3
 *
 * R2'deki herhangi bir dosyayı proxy üzerinden sunar.
 * Range request desteği var (audio seeking için gerekli).
 * Kimlik doğrulaması gerekmez — key bilinmeden erişilemez.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID!;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "key gerekli" }, { status: 400 });
  }

  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME!;
  const rangeHeader = request.headers.get("range");

  try {
    // HEAD isteği ile dosya boyutunu ve content-type'ı al
    const head = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key })
    );

    const contentType = head.ContentType ?? "application/octet-stream";
    const totalSize = head.ContentLength ?? 0;

    // Range request (audio seeking) desteği
    let getParams: { Bucket: string; Key: string; Range?: string } = {
      Bucket: bucket,
      Key: key,
    };

    let status = 200;
    const responseHeaders: Record<string, string> = {
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
    };

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
      if (match) {
        const start = match[1] ? parseInt(match[1], 10) : 0;
        const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;
        const chunkSize = end - start + 1;

        getParams.Range = `bytes=${start}-${end}`;
        status = 206;

        responseHeaders["Content-Range"] = `bytes ${start}-${end}/${totalSize}`;
        responseHeaders["Content-Length"] = String(chunkSize);
      }
    } else {
      responseHeaders["Content-Length"] = String(totalSize);
    }

    // R2'den veri al
    const obj = await client.send(new GetObjectCommand(getParams));

    if (!obj.Body) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 });
    }

    // ReadableStream'e çevir
    const stream = obj.Body.transformToWebStream();

    return new Response(stream, {
      status,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    if ((err as { name?: string }).name === "NoSuchKey") {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 });
    }
    console.error("R2 proxy hatası:", err);
    const message = err instanceof Error ? err.message : "Hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
