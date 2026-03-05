import Link from "next/link";

import { ImportPanel } from "@/components/admin/import-panel";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { formatPublishDate } from "@/lib/format";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { listAdminArticles } from "@/lib/services/article-service";

export default async function AdminHomePage() {
  const session = await requireAdminSession();
  const articles = await listAdminArticles();

  return (
    <div className="admin-wrap">
      <section className="panel" style={{ padding: "1rem" }}>
        <div className="meta-row" style={{ justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: "var(--font-heading)" }}>Admin dashboard</h1>
            <p style={{ marginBottom: 0 }}>Logged in as {session.user.email}</p>
          </div>
          <div className="meta-row">
            <Link className="button" href="/admin/articles/new">
              New article
            </Link>
            <SignOutButton />
          </div>
        </div>
      </section>

      <ImportPanel />

      <section className="article-grid">
        {articles.map((article) => (
          <article className="article-card panel" key={article.id}>
            <div className="meta-row">
              <span className="chip">{article.status}</span>
              <span className="chip">{article.category.name}</span>
              <span className="chip">{formatPublishDate(article.publishAt)}</span>
            </div>
            <h2>{article.title}</h2>
            <div className="meta-row">
              {article.tags.map((tag) => (
                <span className="chip" key={tag.slug}>
                  #{tag.name}
                </span>
              ))}
            </div>
            <div className="meta-row">
              <Link className="button secondary" href={`/admin/articles/${article.id}/edit`}>
                Edit
              </Link>
              {article.status === "PUBLISHED" ? (
                <Link className="button secondary" href={`/articles/${article.slug}`}>
                  View
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
