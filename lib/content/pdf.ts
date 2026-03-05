import { contentJsonToHtml } from "@/lib/content/render";
import { formatPublishDate } from "@/lib/format";

type PrintableArticle = {
  title: string;
  excerpt: string | null;
  publishAt: Date | string | null;
  category: { name: string };
  tags: Array<{ name: string }>;
  contentHtml?: string | null;
  contentJson: Record<string, unknown>;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildArticlePdfHtml(article: PrintableArticle): string {
  const body = article.contentHtml || contentJsonToHtml(article.contentJson);
  const tags = article.tags.map((tag) => `<span class="tag">#${escapeHtml(tag.name)}</span>`).join(" ");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(article.title)}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" />
    <style>
      body { font-family: Georgia, "Times New Roman", serif; margin: 0; color: #1f281f; }
      .wrap { max-width: 760px; margin: 0 auto; padding: 28px; }
      h1 { margin: 0 0 8px 0; font-size: 34px; line-height: 1.2; }
      .meta { margin-bottom: 20px; color: #4f5a4d; font-size: 14px; }
      .tag { display: inline-block; border: 1px solid #d8ccb2; border-radius: 999px; padding: 2px 8px; margin-right: 4px; font-size: 12px; }
      .excerpt { font-size: 18px; color: #3c4739; }
      .article-content { font-size: 17px; line-height: 1.75; }
      .article-content h1, .article-content h2, .article-content h3 { line-height: 1.3; }
      .article-content img { max-width: 100%; height: auto; }
      .article-content pre { background: #141814; color: white; padding: 14px; border-radius: 12px; overflow-x: auto; }
      .math-block { margin: 14px 0; overflow-x: auto; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>${escapeHtml(article.title)}</h1>
      <div class="meta">${escapeHtml(article.category.name)} | ${escapeHtml(formatPublishDate(article.publishAt))}</div>
      ${article.excerpt ? `<p class="excerpt">${escapeHtml(article.excerpt)}</p>` : ""}
      ${tags ? `<div class="meta">${tags}</div>` : ""}
      <div class="article-content">${body}</div>
    </div>
  </body>
</html>`;
}
