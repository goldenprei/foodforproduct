import { prisma } from "@/lib/db/prisma";

export async function registerMediaAsset(params: {
  key: string;
  url: string;
  mimeType: string;
  size?: number;
  createdById?: string | null;
}) {
  return prisma.mediaAsset.upsert({
    where: {
      key: params.key
    },
    update: {
      url: params.url,
      mimeType: params.mimeType,
      size: params.size ?? null,
      createdById: params.createdById ?? null
    },
    create: {
      key: params.key,
      url: params.url,
      mimeType: params.mimeType,
      size: params.size ?? null,
      createdById: params.createdById ?? null
    }
  });
}
