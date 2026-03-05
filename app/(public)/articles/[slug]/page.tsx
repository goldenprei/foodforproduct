import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/ui/article-body";
import { formatPublishDate } from "@/lib/format";
import { getPublicArticleBySlug } from "@/lib/services/article-service";

export default async function PublicArticlePage({ params }: { params: { slug: string } }) {
  const article = await getPublicArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="panel article-shell">
      <div className="meta-row">
        <span className="chip">{article.category.name}</span>
        <span className="chip">{formatPublishDate(article.publishAt)}</span>
      </div>
      <h1>{article.title}</h1>
      {article.excerpt ? <p style={{ color: "var(--ink-soft)", fontSize: "1.1rem" }}>{article.excerpt}</p> : null}

      <div className="meta-row" style={{ marginBottom: "1rem" }}>
        {article.articleTags.map((articleTag) => (
          <Link href={`/?tag=${articleTag.tag.slug}`} className="chip" key={articleTag.tagId}>
            #{articleTag.tag.name}
          </Link>
        ))}
      </div>

      <div className="meta-row" style={{ marginBottom: "1rem" }}>
        <a className="button secondary" href={`/api/v1/articles/${article.slug}/pdf`}>
          Download PDF
        </a>
      </div>

      {article.coverImageUrl ? (
        <Image
          alt={`${article.title} cover`}
          src={article.coverImageUrl}
          width={1600}
          height={900}
          style={{ width: "100%", borderRadius: "16px", marginBottom: "1.2rem" }}
        />
      ) : null}

      <ArticleBody contentHtml={article.contentHtml} contentJson={article.contentJson as Record<string, unknown>} />
    </article>
  );
}
