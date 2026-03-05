import { NextResponse } from "next/server";

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

  return NextResponse.json(article);
}
