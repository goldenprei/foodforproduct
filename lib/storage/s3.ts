import { randomUUID } from "crypto";
import path from "path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/lib/env";

const client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY
  }
});

function normalizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

export function buildObjectKey(filename: string) {
  const ext = path.extname(filename || "").toLowerCase() || ".bin";
  const stem = path.basename(filename || "upload", ext);
  const cleanStem = normalizeFilename(stem) || "upload";
  return `article-images/${new Date().getUTCFullYear()}/${randomUUID()}-${cleanStem}${ext}`;
}

export function buildPublicAssetUrl(key: string) {
  const base = env.S3_PUBLIC_URL.replace(/\/$/, "");
  return `${base}/${key}`;
}

export async function createImageUploadUrl(params: { filename: string; contentType: string }) {
  const key = buildObjectKey(params.filename);

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: params.contentType
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: 60 * 5
  });

  return {
    key,
    uploadUrl,
    publicUrl: buildPublicAssetUrl(key)
  };
}

export async function uploadImageBuffer(params: {
  filename: string;
  contentType: string;
  body: Buffer | Uint8Array;
}) {
  const key = buildObjectKey(params.filename);

  await client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ContentType: params.contentType,
      Body: params.body
    })
  );

  return {
    key,
    publicUrl: buildPublicAssetUrl(key)
  };
}
