# 04 - API Reference (Public + Admin)

- Purpose: Define request/response contracts and usage for all supported endpoints.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: Any route addition/removal or schema contract change under `app/api`.
- Related pages: [03 - Data Model](./03-Data-Model-Prisma-Postgres.md), [08 - Authentication](./08-Authentication-and-Access-Control-GitHub-OAuth-Admin-Allowlist.md), [13 - Troubleshooting](./13-Troubleshooting-Catalog-Known-Failure-Modes-Fix-Steps.md)

## Contract Rules
- All admin endpoints require authenticated admin session.
- Validation is enforced via `zod` and returns structured JSON errors.
- Public listing excludes unpublished/future content (`publishAt <= now`).

## Public Endpoints

| Method | Path | Auth | Input schema | Output schema | Error cases | Used by UI |
|---|---|---|---|---|---|---|
| GET | `/api/v1/articles` | None | Query: `query`, `tag`, `category`, `page>=1`, `limit<=50` | `{items,total,page,limit,totalPages}` | `400` invalid query | Home page feed/filter |
| GET | `/api/v1/articles/:slug` | None | Path `slug` | Article with category + tags | `404` article not found | Article page |
| GET | `/api/v1/articles/:slug/pdf` | None | Path `slug` | `application/pdf` bytes | `404` not found | Public “Download PDF” |

## Admin Endpoints

| Method | Path | Auth | Input schema | Output schema | Error cases | Used by UI |
|---|---|---|---|---|---|---|
| GET | `/api/v1/admin/articles` | Admin session | None | `{items:[article summary]}` | `401` unauthorized | Admin dashboard |
| POST | `/api/v1/admin/articles` | Admin session | None | Created draft article | `401` | “New article” flow |
| GET | `/api/v1/admin/articles/:id` | Admin session | Path `id` | Full editable article | `401`,`404` | Edit screen load |
| PATCH | `/api/v1/admin/articles/:id` | Admin session | JSON: `title,slug,excerpt,contentJson,category,tags,coverImageUrl` | Updated article | `400` validation/domain, `401` | Save draft |
| POST | `/api/v1/admin/articles/:id/publish` | Admin session | JSON optional `publishAt` datetime | Published article | `400`,`401` | Publish action |
| POST | `/api/v1/admin/articles/:id/unpublish` | Admin session | None | Draft article | `400`,`401` | Unpublish action |
| GET | `/api/v1/admin/articles/:id/pdf` | Admin session | Path `id` | `application/pdf` bytes | `401`,`404` | Admin PDF export |
| POST | `/api/v1/admin/import` | Admin session | JSON: `directory`, `publish` | Import summary (`scanned/created/updated/skipped/failed/errors`) | `400`,`401` | Import panel |
| POST | `/api/v1/admin/media/upload` | Admin session | `multipart/form-data` with `file` image (<=15MB) | `{key,url}` | `400`,`401` | Primary editor image upload |
| POST | `/api/v1/admin/media/upload-url` | Admin session | JSON: `filename,contentType,size?` | `{key,uploadUrl,publicUrl}` | `400`,`401` | Legacy signed upload flow |

## Auth Endpoint

| Method | Path | Auth | Input schema | Output schema | Error cases | Used by UI |
|---|---|---|---|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | OAuth/session flow | NextAuth provider flow | Session/auth redirects | Provider/session errors | Admin login/session |

## Error Envelope Convention
Typical error shape:
```json
{
  "error": {
    "message": "Human readable message",
    "details": {}
  }
}
```
