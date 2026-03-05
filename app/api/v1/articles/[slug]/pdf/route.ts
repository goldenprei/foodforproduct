import { NextResponse } from "next/server";

import { buildArticlePdfBuffer } from "@/lib/content/pdf";
import { getPublicArticleBySlug } from "@/lib/services/article-service";

export async function GET(_: Request, context: { params: { slug: string } }) {
  const article = await getPublicArticleBySlug(context.params.slug);

  if (!article) {
    return NextResponse.json(
      {
        error: {
          message: "Article not found"
        }
      },
      { status: 404 }
    );
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
