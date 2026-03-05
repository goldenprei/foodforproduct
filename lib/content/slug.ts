import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

function normalizeBaseSlug(input: string): string {
  const normalized = slugify(input, {
    lower: true,
    strict: true,
    trim: true
  });

  return normalized || "article";
}

export async function ensureUniqueSlug(
  prisma: PrismaClient,
  candidate: string,
  excludedArticleId?: string
): Promise<string> {
  const base = normalizeBaseSlug(candidate);

  for (let i = 0; i < 500; i += 1) {
    const next = i === 0 ? base : `${base}-${i + 1}`;
    const existing = await prisma.article.findUnique({
      where: { slug: next },
      select: { id: true }
    });

    if (!existing || existing.id === excludedArticleId) {
      return next;
    }
  }

  throw new Error("Unable to generate a unique slug");
}

export function toSlug(input: string): string {
  return normalizeBaseSlug(input);
}
