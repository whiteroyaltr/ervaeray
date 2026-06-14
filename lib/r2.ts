/**
 * lib/r2.ts
 * Cloudflare R2 (S3-compatible) client ve yardımcı fonksiyonlar.
 * Sunucu tarafında (API route'larında) kullanılır.
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ── R2 Client ────────────────────────────────────────────────
function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 kimlik bilgileri eksik. .env.local dosyasına R2_ACCOUNT_ID, R2_ACCESS_KEY_ID ve R2_SECRET_ACCESS_KEY ekleyin."
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function getBucketName(): string {
  const name = process.env.R2_BUCKET_NAME;
  if (!name) throw new Error("R2_BUCKET_NAME eksik.");
  return name;
}

export function getPublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL ?? "";
  return `${base.replace(/\/$/, "")}/${key}`;
}

// ── Upload ───────────────────────────────────────────────────
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  const bucket = getBucketName();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return getPublicUrl(key);
}

// ── Delete ───────────────────────────────────────────────────
export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  const bucket = getBucketName();

  await client.send(
    new DeleteObjectCommand({ Bucket: bucket, Key: key })
  );
}

// ── List ─────────────────────────────────────────────────────
export interface R2File {
  key: string;
  size: number;
  lastModified: Date;
  publicUrl: string;
  contentType?: string;
}

export async function listR2Files(prefix?: string): Promise<R2File[]> {
  const client = getR2Client();
  const bucket = getBucketName();

  const result: ListObjectsV2CommandOutput = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: 500,
    })
  );

  return (result.Contents ?? []).map((obj) => ({
    key: obj.Key ?? "",
    size: obj.Size ?? 0,
    lastModified: obj.LastModified ?? new Date(),
    publicUrl: getPublicUrl(obj.Key ?? ""),
  }));
}

// ── Signed URL (özel bucket için) ───────────────────────────
export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 3600
): Promise<string> {
  const client = getR2Client();
  const bucket = getBucketName();

  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: expiresInSeconds }
  );
}
