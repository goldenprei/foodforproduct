import Link from "next/link";

import { formatPublishDate } from "@/lib/format";

type Props = {
  article: {
    slug: string;
    title: string;
    excerpt: string | null;
    publishAt: Date | string | null;
    category: { name: string; slug: string };
    tags: Array<{ name: string; slug: string }>;
  };
};

export function ArticleCard({ article }: Props) {
  return (
    <article className="article-card panel">
      <div className="meta-row">
        <span className="chip">{article.category.name}</span>
        <span className="chip">{formatPublishDate(article.publishAt)}</span>
      </div>
      <h2>
        <Link href={`/articles/${article.slug}`}>{article.title}</Link>
      </h2>
      {article.excerpt ? <p>{article.excerpt}</p> : null}
      <div className="meta-row">
        {article.tags.slice(0, 4).map((tag) => (
          <Link className="chip" href={`/?tag=${tag.slug}`} key={tag.slug}>
            #{tag.name}
          </Link>
        ))}
      </div>
    </article>
  );
}
