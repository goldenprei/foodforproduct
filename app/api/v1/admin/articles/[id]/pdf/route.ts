import { NextResponse } from "next/server";

import { getAdminApiSession } from "@/lib/auth/api-session";
import { buildArticlePdfBuffer } from "@/lib/content/pdf";
import { jsonError } from "@/lib/http";
import { getAdminArticleById } from "@/lib/services/article-service";

export async function GET(_: Request, context: { params: { id: string } }) {
  const session = await getAdminApiSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const article = await getAdminArticleById(context.params.id);

  if (!article) {
    return jsonError("Article not found", 404);
  }

  const pdf = await buildArticlePdfBuffer({
    title: article.title,
    excerpt: article.excerpt,
    publishAt: article.publishAt,
    category: article.category,
    tags: article.articleTags.map((item) => ({ name: item.tag.name })),
    contentJson: article.contentJson as Record<string, unknown>
  });

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${article.slug}.pdf"`
    }
  });
}
