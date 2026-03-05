"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";

import { toDateTimeInputValue } from "@/lib/format";

import { TiptapEditor } from "./tiptap-editor";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type EditableArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishAt: string | null;
  coverImageUrl: string | null;
  contentJson: Record<string, unknown>;
  category: {
    name: string;
    slug: string;
  };
  articleTags: Array<{
    tag: {
      name: string;
      slug: string;
    };
  }>;
};

type Props = {
  article: EditableArticle;
  categories: CategoryOption[];
};

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

function parseTags(tagInput: string): string[] {
  return tagInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);
}

export function ArticleEditorForm({ article, categories }: Props) {
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(article.title);
  const [slug, setSlug] = useState(article.slug);
  const [excerpt, setExcerpt] = useState(article.excerpt ?? "");
  const [category, setCategory] = useState(article.category.name);
  const [tags, setTags] = useState(article.articleTags.map((item) => item.tag.name).join(", "));
  const [coverImageUrl, setCoverImageUrl] = useState(article.coverImageUrl ?? "");
  const [publishAt, setPublishAt] = useState(toDateTimeInputValue(article.publishAt));
  const [contentJson, setContentJson] = useState<Record<string, unknown>>(article.contentJson);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(article.status);
  const [info, setInfo] = useState<string>("");
  const [slugTouched, setSlugTouched] = useState(false);

  const categorySuggestions = useMemo(() => categories.map((item) => item.name), [categories]);

  async function uploadImage(file: File): Promise<string> {
    const signed = await fetch("/api/v1/admin/media/upload-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        size: file.size
      })
    });

    const signedPayload = await signed.json();

    if (!signed.ok) {
      throw new Error(signedPayload?.error?.message || "Could not create upload URL");
    }

    const uploadResponse = await fetch(signedPayload.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type
      },
      body: file
    });

    if (!uploadResponse.ok) {
      throw new Error("Image upload failed");
    }

    return signedPayload.publicUrl;
  }

  async function saveDraft() {
    const response = await fetch(`/api/v1/admin/articles/${article.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        contentJson,
        category,
        tags: parseTags(tags),
        coverImageUrl
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error?.message || "Failed to save draft");
    }

    setInfo(`Draft saved at ${new Date().toLocaleTimeString()}`);
    setStatus(payload.status);
  }

  function publish() {
    startTransition(async () => {
      setInfo("Saving and publishing...");

      try {
        await saveDraft();

        const publishPayload = publishAt
          ? {
              publishAt: new Date(publishAt).toISOString()
            }
          : {};

        const response = await fetch(`/api/v1/admin/articles/${article.id}/publish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(publishPayload)
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error?.message || "Failed to publish");
        }

        setStatus("PUBLISHED");
        setInfo(`Published (${payload.publishAt ? new Date(payload.publishAt).toLocaleString() : "now"})`);
      } catch (error) {
        setInfo(error instanceof Error ? error.message : "Publish failed");
      }
    });
  }

  function unpublish() {
    startTransition(async () => {
      setInfo("Unpublishing...");

      try {
        const response = await fetch(`/api/v1/admin/articles/${article.id}/unpublish`, {
          method: "POST"
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error?.message || "Failed to unpublish");
        }

        setStatus("DRAFT");
        setInfo("Moved back to draft");
      } catch (error) {
        setInfo(error instanceof Error ? error.message : "Unpublish failed");
      }
    });
  }

  function saveOnly() {
    startTransition(async () => {
      setInfo("Saving draft...");

      try {
        await saveDraft();
      } catch (error) {
        setInfo(error instanceof Error ? error.message : "Save failed");
      }
    });
  }

  return (
    <div className="admin-wrap">
      <section className="panel" style={{ padding: "1rem" }}>
        <div className="meta-row" style={{ justifyContent: "space-between" }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-heading)" }}>Edit article</h1>
          <div className="meta-row">
            <span className="chip">{status}</span>
            <button onClick={saveOnly} type="button" disabled={isPending}>
              Save draft
            </button>
            <button onClick={publish} type="button" disabled={isPending}>
              Publish
            </button>
            {status === "PUBLISHED" ? (
              <button className="secondary" onClick={unpublish} type="button" disabled={isPending}>
                Unpublish
              </button>
            ) : null}
            <a
              className="button secondary"
              href={status === "PUBLISHED" ? `/api/v1/articles/${slug}/pdf` : `/api/v1/admin/articles/${article.id}/pdf`}
              target="_blank"
            >
              Export PDF
            </a>
          </div>
        </div>

        <p style={{ marginBottom: 0, color: "var(--ink-soft)" }}>{info || ""}</p>
      </section>

      <section className="panel" style={{ padding: "1rem" }}>
        <div className="split">
          <div className="stack">
            <div>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                onChange={(event) => {
                  const next = event.target.value;
                  setTitle(next);
                  if (!slugTouched) {
                    setSlug(toSlug(next));
                  }
                }}
                value={title}
              />
            </div>
            <div>
              <label htmlFor="slug">Slug</label>
              <input
                id="slug"
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(toSlug(event.target.value));
                }}
                value={slug}
              />
            </div>
            <div>
              <label htmlFor="excerpt">Excerpt</label>
              <textarea
                id="excerpt"
                onChange={(event) => setExcerpt(event.target.value)}
                rows={3}
                value={excerpt}
              />
            </div>
          </div>

          <div className="stack">
            <div>
              <label htmlFor="category">Category</label>
              <input
                id="category"
                list="categories-list"
                onChange={(event) => setCategory(event.target.value)}
                value={category}
              />
              <datalist id="categories-list">
                {categorySuggestions.map((name) => (
                  <option value={name} key={name} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input id="tags" onChange={(event) => setTags(event.target.value)} value={tags} />
            </div>
            <div>
              <label htmlFor="cover">Cover image URL</label>
              <input
                id="cover"
                onChange={(event) => setCoverImageUrl(event.target.value)}
                placeholder="https://..."
                value={coverImageUrl}
              />
            </div>
            <div>
              <label htmlFor="publishAt">Publish date/time (editable)</label>
              <input
                id="publishAt"
                onChange={(event) => setPublishAt(event.target.value)}
                type="datetime-local"
                value={publishAt}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="panel" style={{ padding: "1rem" }}>
        <TiptapEditor
          initialContent={article.contentJson}
          onChange={(nextJson) => setContentJson(nextJson)}
          onUploadImage={uploadImage}
        />
      </section>

      <section>
        <Link className="button secondary" href="/admin">
          Back to admin
        </Link>
      </section>
    </div>
  );
}
