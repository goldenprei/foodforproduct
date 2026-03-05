# foodforproduct

Custom blog platform for publishing thoughts on product management, AI, metrics, and maths.

## Stack

- Next.js (App Router, TypeScript)
- Prisma + PostgreSQL
- NextAuth (GitHub OAuth, admin allowlist)
- TipTap editor (rich in-browser editing)
- S3-compatible storage for images
- PDF export via Playwright

## Features implemented

- Rich in-browser article editor (headings, lists, indentation, bold/italic/underline, links, images, code blocks)
- LaTeX support with `$...$` and `$$...$$`
- One category + many tags per article
- Editable publish date/time (past and future)
- Public blog listing with search and category/tag filters
- Public and admin PDF export
- Import pipeline for `.md`, `.txt`, `.docx` from `content/import/`
- API-first route structure under `/api/v1/...`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure env:

```bash
cp .env.example .env
```

3. Create DB schema:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Start dev server:

```bash
npm run dev
```

## GitHub OAuth setup

- Create a GitHub OAuth app.
- Set callback URL to: `http://localhost:3000/api/auth/callback/github`
- Add your admin email in `ADMIN_EMAILS` (comma-separated if needed).

## Content import

Put files in `content/import/` and run:

```bash
npm run import:content
```

Options:

```bash
npm run import:content -- --dir=content/import --publish
```

### Frontmatter (for markdown/txt imports)

```yaml
---
title: Ancient World Maths
slug: ancient-world-maths
category: Ancient World Maths
tags: [Math, World]
excerpt: A short summary
publishAt: 2023-06-20T10:00:00Z
published: true
coverImageUrl: https://example.com/cover.jpg
---
```

## API overview

- `GET /api/v1/articles`
- `GET /api/v1/articles/:slug`
- `GET /api/v1/articles/:slug/pdf`
- `POST /api/v1/admin/articles`
- `PATCH /api/v1/admin/articles/:id`
- `POST /api/v1/admin/articles/:id/publish`
- `POST /api/v1/admin/articles/:id/unpublish`
- `GET /api/v1/admin/articles/:id/pdf`
- `POST /api/v1/admin/media/upload-url`
- `POST /api/v1/admin/import`

## Tests

```bash
npm run test
```
