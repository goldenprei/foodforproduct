import { NextResponse } from "next/server";
import { chromium } from "playwright";

import { getAdminApiSession } from "@/lib/auth/api-session";
import { buildArticlePdfHtml } from "@/lib/content/pdf";
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

  const html = buildArticlePdfHtml({
    title: article.title,
    excerpt: article.excerpt,
    publishAt: article.publishAt,
    category: article.category,
    tags: article.articleTags.map((item) => ({ name: item.tag.name })),
    contentHtml: article.contentHtml,
    contentJson: article.contentJson as Record<string, unknown>
  });

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm"
      }
    });

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${article.slug}.pdf"`
      }
    });
  } finally {
    await browser.close();
  }
}
