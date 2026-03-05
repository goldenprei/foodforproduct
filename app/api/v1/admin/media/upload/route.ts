import { NextResponse } from "next/server";

import { getAdminApiSession } from "@/lib/auth/api-session";
import { jsonError } from "@/lib/http";
import { registerMediaAsset } from "@/lib/services/media-service";
import { uploadImageBuffer } from "@/lib/storage/s3";

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getAdminApiSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("Missing image file", 400);
  }

  if (!file.type.startsWith("image/")) {
    return jsonError("Only image files are allowed", 400);
  }

  if (file.size < 1 || file.size > MAX_IMAGE_SIZE_BYTES) {
    return jsonError("Image exceeds 15MB limit", 400);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  const upload = await uploadImageBuffer({
    filename: file.name || "upload-image",
    contentType: file.type,
    body: bytes
  });

  await registerMediaAsset({
    key: upload.key,
    url: upload.publicUrl,
    mimeType: file.type,
    size: file.size,
    createdById: session.user.id
  });

  return NextResponse.json({
    key: upload.key,
    url: upload.publicUrl
  });
}
