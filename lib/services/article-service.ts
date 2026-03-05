import { ArticleStatus, Prisma, type Category, type Tag } from "@prisma/client";

import { EMPTY_DOC } from "@/lib/content/extensions";
import { contentJsonToHtml } from "@/lib/content/render";
import { toSlug, ensureUniqueSlug } from "@/lib/content/slug";
import { extractPlainTextFromDoc } from "@/lib/content/text";
import { prisma } from "@/lib/db/prisma";

const articleInclude = {
  category: true,
  articleTags: {
    include: {
      tag: true
    }
  }
} satisfies Prisma.ArticleInclude;

type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: typeof articleInclude;
}>;

type SaveDraftInput = {
  title: string;
  slug: string;
  excerpt: string | null;
  contentJson: Record<string, unknown>;
  category: string;
  tags: string[];
  coverImageUrl: string | null;
};

type PublicListParams = {
  query?: string;
  tag?: string;
  category?: string;
  page: number;
  limit: number;
};

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function uniqueStrings(values: string[]): string[] {
  const normalized = values
    .map((value) => normalizeName(value))
    .filter(Boolean)
    .map((value) => value.slice(0, 60));

  return Array.from(new Set(normalized));
}

async function ensureUniqueCategorySlug(base: string): Promise<string> {
  for (let i = 0; i < 500; i += 1) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const exists = await prisma.category.findUnique({ where: { slug: candidate } });
    if (!exists) {
      return candidate;
    }
  }
  throw new Error("Unable to create unique category slug");
}

async function ensureUniqueTagSlug(base: string): Promise<string> {
  for (let i = 0; i < 500; i += 1) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const exists = await prisma.tag.findUnique({ where: { slug: candidate } });
    if (!exists) {
      return candidate;
    }
  }
  throw new Error("Unable to create unique tag slug");
}

async function findOrCreateCategory(name: string): Promise<Category> {
  const normalized = normalizeName(name);
  const slug = toSlug(normalized);

  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ slug }, { name: normalized }]
    }
  });

  if (existing) {
    return existing;
  }

  const uniqueSlug = await ensureUniqueCategorySlug(slug);
  return prisma.category.create({
    data: {
      name: normalized,
      slug: uniqueSlug
    }
  });
}

async function findOrCreateTags(names: string[]): Promise<Tag[]> {
  const deduped = uniqueStrings(names);
  if (!deduped.length) {
    return [];
  }

  const tags: Tag[] = [];

  for (const name of deduped) {
    const slug = toSlug(name);
    const existing = await prisma.tag.findFirst({
      where: {
        OR: [{ slug }, { name }]
      }
    });

    if (existing) {
      tags.push(existing);
      continue;
    }

    const uniqueSlug = await ensureUniqueTagSlug(slug);
    const created = await prisma.tag.create({
      data: {
        name,
        slug: uniqueSlug
      }
    });

    tags.push(created);
  }

  return tags;
}

async function setArticleTags(articleId: string, tagNames: string[]) {
  const tags = await findOrCreateTags(tagNames);

  await prisma.articleTag.deleteMany({
    where: { articleId }
  });

  if (!tags.length) {
    return;
  }

  await prisma.articleTag.createMany({
    data: tags.map((tag) => ({
      articleId,
      tagId: tag.id
    })),
    skipDuplicates: true
  });
}

function mapArticleSummary(article: ArticleWithRelations) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    status: article.status,
    publishAt: article.publishAt,
    coverImageUrl: article.coverImageUrl,
    category: {
      name: article.category.name,
      slug: article.category.slug
    },
    tags: article.articleTags.map((articleTag) => ({
      name: articleTag.tag.name,
      slug: articleTag.tag.slug
    })),
    updatedAt: article.updatedAt,
    createdAt: article.createdAt
  };
}

async function createRevision(articleId: string, savedById: string | null) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: articleInclude
  });

  if (!article) {
    return;
  }

  await prisma.articleRevision.create({
    data: {
      articleId,
      savedById,
      snapshot: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        contentJson: article.contentJson,
        contentHtml: article.contentHtml,
        contentText: article.contentText,
        category: {
          id: article.category.id,
          name: article.category.name,
          slug: article.category.slug
        },
        tags: article.articleTags.map((t) => ({
          id: t.tag.id,
          name: t.tag.name,
          slug: t.tag.slug
        })),
        status: article.status,
        publishAt: article.publishAt?.toISOString() ?? null,
        firstPublishedAt: article.firstPublishedAt?.toISOString() ?? null,
        coverImageUrl: article.coverImageUrl
      }
    }
  });
}

export async function ensureGeneralCategory() {
  return findOrCreateCategory("General");
}

export async function listAdminArticles() {
  const articles = await prisma.article.findMany({
    include: articleInclude,
    orderBy: {
      updatedAt: "desc"
    }
  });

  return articles.map(mapArticleSummary);
}

export async function getAdminArticleById(articleId: string) {
  return prisma.article.findUnique({
    where: { id: articleId },
    include: articleInclude
  });
}

export async function createArticleDraft(authorId: string | null) {
  const category = await ensureGeneralCategory();
  const title = "Untitled Draft";
  const slug = await ensureUniqueSlug(prisma, `${title}-${Date.now()}`);

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      excerpt: null,
      contentJson: EMPTY_DOC,
      contentHtml: "<p></p>",
      contentText: "",
      status: ArticleStatus.DRAFT,
      categoryId: category.id
    },
    include: articleInclude
  });

  await createRevision(article.id, authorId);

  return article;
}

export async function saveArticleDraft(articleId: string, input: SaveDraftInput, savedById: string | null) {
  const current = await prisma.article.findUnique({ where: { id: articleId } });
  if (!current) {
    throw new Error("Article not found");
  }

  const category = await findOrCreateCategory(input.category);
  const slug = await ensureUniqueSlug(prisma, input.slug, articleId);

  const contentHtml = contentJsonToHtml(input.contentJson);
  const contentText = extractPlainTextFromDoc(input.contentJson);

  const article = await prisma.article.update({
    where: { id: articleId },
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      contentJson: input.contentJson as Prisma.InputJsonValue,
      contentHtml,
      contentText,
      categoryId: category.id,
      coverImageUrl: input.coverImageUrl
    },
    include: articleInclude
  });

  await setArticleTags(article.id, input.tags);
  await createRevision(article.id, savedById);

  return prisma.article.findUnique({
    where: { id: article.id },
    include: articleInclude
  });
}

export async function publishArticle(articleId: string, publishAt: Date | null, savedById: string | null) {
  const existing = await prisma.article.findUnique({ where: { id: articleId } });
  if (!existing) {
    throw new Error("Article not found");
  }

  const publishDate = publishAt ?? new Date();

  const article = await prisma.article.update({
    where: { id: articleId },
    data: {
      status: ArticleStatus.PUBLISHED,
      publishAt: publishDate,
      firstPublishedAt: existing.firstPublishedAt ?? publishDate
    },
    include: articleInclude
  });

  await createRevision(article.id, savedById);

  return article;
}

export async function unpublishArticle(articleId: string, savedById: string | null) {
  const article = await prisma.article.update({
    where: { id: articleId },
    data: {
      status: ArticleStatus.DRAFT
    },
    include: articleInclude
  });

  await createRevision(article.id, savedById);
  return article;
}

export async function listPublicArticles(params: PublicListParams) {
  const now = new Date();

  const where: Prisma.ArticleWhereInput = {
    status: ArticleStatus.PUBLISHED,
    publishAt: {
      lte: now
    }
  };

  if (params.query) {
    where.OR = [
      { title: { contains: params.query, mode: "insensitive" } },
      { excerpt: { contains: params.query, mode: "insensitive" } },
      { contentText: { contains: params.query, mode: "insensitive" } }
    ];
  }

  if (params.tag) {
    where.articleTags = {
      some: {
        tag: {
          slug: toSlug(params.tag)
        }
      }
    };
  }

  if (params.category) {
    where.category = {
      slug: toSlug(params.category)
    };
  }

  const skip = (params.page - 1) * params.limit;

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: articleInclude,
      orderBy: {
        publishAt: "desc"
      },
      skip,
      take: params.limit
    }),
    prisma.article.count({ where })
  ]);

  return {
    items: items.map(mapArticleSummary),
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.max(1, Math.ceil(total / params.limit))
  };
}

export async function getPublicArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
      publishAt: {
        lte: new Date()
      }
    },
    include: articleInclude
  });
}

export async function getAnyArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: articleInclude
  });
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" }
  });
}

export async function listTags() {
  return prisma.tag.findMany({
    orderBy: { name: "asc" }
  });
}
