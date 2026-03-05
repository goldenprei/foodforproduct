import { ArticleStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/ui/article-body";
import { getAdminSessionOrNull } from "@/lib/auth/require-admin";
import { formatPublishDate } from "@/lib/format";
import { getAnyArticleBySlug } from "@/lib/services/article-service";

export default async function PrintArticlePage({ params }: { params: { slug: string } }) {
  const [article, adminSession] = await Promise.all([getAnyArticleBySlug(params.slug), getAdminSessionOrNull()]);

  if (!article) {
    notFound();
  }

  if (article.status !== ArticleStatus.PUBLISHED && !adminSession) {
    notFound();
  }

  return (
    <article className="article-shell">
      <h1>{article.title}</h1>
      <p>
        {article.category.name} | {formatPublishDate(article.publishAt)}
      </p>
      {article.excerpt ? <p>{article.excerpt}</p> : null}
      <ArticleBody contentHtml={article.contentHtml} contentJson={article.contentJson as Record<string, unknown>} />
    </article>
  );
}
