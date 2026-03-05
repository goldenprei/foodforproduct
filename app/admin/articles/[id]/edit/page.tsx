import { notFound } from "next/navigation";

import { ArticleEditorForm } from "@/components/editor/article-editor-form";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { getAdminArticleById, listCategories } from "@/lib/services/article-service";

export default async function AdminEditArticlePage({ params }: { params: { id: string } }) {
  await requireAdminSession();

  const [article, categories] = await Promise.all([getAdminArticleById(params.id), listCategories()]);

  if (!article) {
    notFound();
  }

  return (
    <ArticleEditorForm
      article={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        status: article.status,
        publishAt: article.publishAt ? article.publishAt.toISOString() : null,
        coverImageUrl: article.coverImageUrl,
        contentJson: article.contentJson as Record<string, unknown>,
        category: article.category,
        articleTags: article.articleTags.map((item) => ({
          tag: {
            name: item.tag.name,
            slug: item.tag.slug
          }
        }))
      }}
      categories={categories}
    />
  );
}
