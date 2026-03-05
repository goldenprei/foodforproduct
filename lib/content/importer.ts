import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import { ArticleStatus } from "@prisma/client";
import matter from "gray-matter";
import mammoth from "mammoth";
import { marked } from "marked";

import { htmlToContentJson } from "@/lib/content/render";
import { toSlug } from "@/lib/content/slug";
import { prisma } from "@/lib/db/prisma";
import { createArticleDraft, publishArticle, saveArticleDraft } from "@/lib/services/article-service";

type ImportOptions = {
  publish: boolean;
};

type PreparedArticle = {
  title: string;
  slug: string;
  excerpt: string | null;
  contentJson: Record<string, unknown>;
  category: string;
  tags: string[];
  coverImageUrl: string | null;
  publishAt: Date | null;
  shouldPublish: boolean;
};

export type ImportSummary = {
  scanned: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{ file: string; message: string }>;
};

async function listFilesRecursively(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(absolute)));
      continue;
    }

    files.push(absolute);
  }

  return files;
}

function checksumFromBuffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" && !(value instanceof Date)) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeTags(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof input === "string") {
    return input
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function extractTitleFromMarkdown(markdown: string): string | null {
  const headingLine = markdown
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("# "));

  if (!headingLine) {
    return null;
  }

  return headingLine.replace(/^#\s+/, "").trim() || null;
}

function markdownToHtml(content: string): string {
  const rendered = marked.parse(content, {
    breaks: true,
    gfm: true
  });

  return typeof rendered === "string" ? rendered : "";
}

function plainTextToHtml(content: string): string {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

async function prepareFromMarkdown(filePath: string, raw: string, options: ImportOptions): Promise<PreparedArticle> {
  const parsed = matter(raw);
  const data = parsed.data as Record<string, unknown>;

  const title =
    (typeof data.title === "string" ? data.title.trim() : "") ||
    extractTitleFromMarkdown(parsed.content) ||
    path.basename(filePath, path.extname(filePath));

  const html = markdownToHtml(parsed.content);

  return {
    title,
    slug: typeof data.slug === "string" && data.slug.trim() ? toSlug(data.slug) : toSlug(title),
    excerpt: typeof data.excerpt === "string" ? data.excerpt.trim() : null,
    contentJson: htmlToContentJson(html),
    category: typeof data.category === "string" && data.category.trim() ? data.category.trim() : "General",
    tags: normalizeTags(data.tags),
    coverImageUrl:
      typeof data.coverImageUrl === "string" && /^https?:\/\//.test(data.coverImageUrl)
        ? data.coverImageUrl
        : null,
    publishAt: parseDate(data.publishAt ?? data.date),
    shouldPublish: options.publish || data.published === true
  };
}

async function prepareFromText(filePath: string, raw: string, options: ImportOptions): Promise<PreparedArticle> {
  const parsed = matter(raw);
  const data = parsed.data as Record<string, unknown>;

  const title =
    (typeof data.title === "string" ? data.title.trim() : "") ||
    path.basename(filePath, path.extname(filePath));

  const html = plainTextToHtml(parsed.content);

  return {
    title,
    slug: typeof data.slug === "string" && data.slug.trim() ? toSlug(data.slug) : toSlug(title),
    excerpt: typeof data.excerpt === "string" ? data.excerpt.trim() : null,
    contentJson: htmlToContentJson(html),
    category: typeof data.category === "string" && data.category.trim() ? data.category.trim() : "General",
    tags: normalizeTags(data.tags),
    coverImageUrl:
      typeof data.coverImageUrl === "string" && /^https?:\/\//.test(data.coverImageUrl)
        ? data.coverImageUrl
        : null,
    publishAt: parseDate(data.publishAt ?? data.date),
    shouldPublish: options.publish || data.published === true
  };
}

async function prepareFromDocx(filePath: string, buffer: Buffer, options: ImportOptions): Promise<PreparedArticle> {
  const result = await mammoth.convertToHtml({ buffer });

  const title = path.basename(filePath, path.extname(filePath));

  return {
    title,
    slug: toSlug(title),
    excerpt: null,
    contentJson: htmlToContentJson(result.value),
    category: "General",
    tags: [],
    coverImageUrl: null,
    publishAt: null,
    shouldPublish: options.publish
  };
}

async function prepareArticle(filePath: string, buffer: Buffer, options: ImportOptions): Promise<PreparedArticle> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".md" || ext === ".markdown") {
    return prepareFromMarkdown(filePath, buffer.toString("utf-8"), options);
  }

  if (ext === ".txt") {
    return prepareFromText(filePath, buffer.toString("utf-8"), options);
  }

  if (ext === ".docx") {
    return prepareFromDocx(filePath, buffer, options);
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

export async function importContentDirectory(directory: string, options: ImportOptions): Promise<ImportSummary> {
  const absoluteDir = path.resolve(directory);
  const files = await listFilesRecursively(absoluteDir);

  const supportedFiles = files.filter((filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    return [".md", ".markdown", ".txt", ".docx"].includes(ext);
  });

  const summary: ImportSummary = {
    scanned: supportedFiles.length,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };

  for (const absolutePath of supportedFiles) {
    const relativePath = path.relative(absoluteDir, absolutePath);

    try {
      const buffer = await fs.readFile(absolutePath);
      const checksum = checksumFromBuffer(buffer);

      const existingImport = await prisma.importSource.findUnique({
        where: {
          filePath: relativePath
        }
      });

      if (existingImport?.checksum === checksum) {
        summary.skipped += 1;
        continue;
      }

      const prepared = await prepareArticle(relativePath, buffer, options);

      let articleId = existingImport?.articleId;
      const isNewArticle = !articleId;

      if (!articleId) {
        const draft = await createArticleDraft(null);
        articleId = draft.id;
      }

      await saveArticleDraft(
        articleId,
        {
          title: prepared.title,
          slug: prepared.slug,
          excerpt: prepared.excerpt,
          contentJson: prepared.contentJson,
          category: prepared.category,
          tags: prepared.tags,
          coverImageUrl: prepared.coverImageUrl
        },
        null
      );

      if (prepared.shouldPublish) {
        await publishArticle(articleId, prepared.publishAt, null);
      } else {
        await prisma.article.update({
          where: { id: articleId },
          data: {
            status: ArticleStatus.DRAFT,
            publishAt: null
          }
        });
      }

      await prisma.importSource.upsert({
        where: {
          filePath: relativePath
        },
        update: {
          checksum,
          sourceType: path.extname(relativePath).toLowerCase(),
          articleId
        },
        create: {
          filePath: relativePath,
          checksum,
          sourceType: path.extname(relativePath).toLowerCase(),
          articleId
        }
      });

      if (isNewArticle) {
        summary.created += 1;
      } else {
        summary.updated += 1;
      }
    } catch (error) {
      summary.failed += 1;
      summary.errors.push({
        file: relativePath,
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  return summary;
}
