import { NextResponse } from "next/server";

import { getAdminApiSession } from "@/lib/auth/api-session";
import { jsonError } from "@/lib/http";
import { registerMediaAsset } from "@/lib/services/media-service";
import { createImageUploadUrl } from "@/lib/storage/s3";
import { mediaUploadSchema } from "@/lib/validation/media";

export async function POST(request: Request) {
  const session = await getAdminApiSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = mediaUploadSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid media payload", 400, parsed.error.flatten());
  }

  const upload = await createImageUploadUrl({
    filename: parsed.data.filename,
    contentType: parsed.data.contentType
  });

  await registerMediaAsset({
    key: upload.key,
    url: upload.publicUrl,
    mimeType: parsed.data.contentType,
    size: parsed.data.size,
    createdById: session.user.id
  });

  return NextResponse.json(upload);
}
