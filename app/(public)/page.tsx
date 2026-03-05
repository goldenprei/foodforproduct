import Link from "next/link";

import { ArticleCard } from "@/components/ui/article-card";
import { listCategories, listPublicArticles } from "@/lib/services/article-service";

function one(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function HomePage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const query = one(searchParams?.query);
  const tag = one(searchParams?.tag);
  const category = one(searchParams?.category);
  const page = Number(one(searchParams?.page) || "1");

  const [result, categories] = await Promise.all([
    listPublicArticles({
      query,
      tag,
      category,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: 12
    }),
    listCategories()
  ]);

  const previousPage = result.page > 1 ? result.page - 1 : null;
  const nextPage = result.page < result.totalPages ? result.page + 1 : null;

  return (
    <div className="stack">
      <section className="panel" style={{ padding: "1.1rem" }}>
        <h1 style={{ marginTop: 0, fontFamily: "var(--font-heading)", fontSize: "clamp(1.7rem, 3vw, 2.5rem)" }}>
          Notes on product, AI, metrics, and the weird edges of thinking
        </h1>
        <p style={{ marginTop: 0 }}>
          FoodforProduct is where long-form product thinking meets experiments, formulas, and first-principles writing.
        </p>
        <form className="split" method="get">
          <div>
            <label htmlFor="query">Search</label>
            <input id="query" name="query" defaultValue={query ?? ""} placeholder="e.g. retention, LTV, loops" />
          </div>
          <div>
            <label htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue={category ?? ""}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option value={item.slug} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tag">Tag (slug)</label>
            <input id="tag" name="tag" defaultValue={tag ?? ""} placeholder="math" />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
            <button type="submit">Filter</button>
            <Link className="button secondary" href="/">
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="article-grid">
        {result.items.map((article) => (
          <ArticleCard article={article} key={article.id} />
        ))}
      </section>

      <section className="meta-row" style={{ justifyContent: "space-between" }}>
        <div>
          Showing page {result.page} of {result.totalPages} ({result.total} articles)
        </div>
        <div className="meta-row">
          {previousPage ? (
            <Link
              className="button secondary"
              href={`/?page=${previousPage}${query ? `&query=${encodeURIComponent(query)}` : ""}${
                category ? `&category=${encodeURIComponent(category)}` : ""
              }${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
            >
              Previous
            </Link>
          ) : null}
          {nextPage ? (
            <Link
              className="button secondary"
              href={`/?page=${nextPage}${query ? `&query=${encodeURIComponent(query)}` : ""}${
                category ? `&category=${encodeURIComponent(category)}` : ""
              }${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
            >
              Next
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
