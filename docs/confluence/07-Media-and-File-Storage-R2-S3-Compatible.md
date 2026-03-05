# 07 - Media and File Storage (R2/S3-compatible)

- Purpose: Define media upload architecture, storage requirements, and runtime behavior.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: Upload endpoint changes, storage provider changes, or URL strategy changes.
- Related pages: [04 - API Reference](./04-API-Reference-Public-Admin.md), [10 - Environment Variables](./10-Environment-Variables-and-Configuration-Matrix.md), [13 - Troubleshooting](./13-Troubleshooting-Catalog-Known-Failure-Modes-Fix-Steps.md)

## Storage Model
- Provider: S3-compatible object storage (Cloudflare R2 expected).
- Object key shape: `article-images/<year>/<uuid>-<normalized-filename>.<ext>`.
- Public URL built via `S3_PUBLIC_URL + object key`.

## Upload Paths
### Primary (current UI)
- Endpoint: `POST /api/v1/admin/media/upload`
- Input: `multipart/form-data` image file
- Server uploads bytes directly to S3
- Avoids browser-to-R2 CORS fragility

### Legacy (still present)
- Endpoint: `POST /api/v1/admin/media/upload-url`
- Returns presigned PUT URL + public URL
- Kept for compatibility; current editor uses primary path

## Media Metadata Persistence
Every successful upload records/upserts `MediaAsset` with:
- `key`
- `url`
- `mimeType`
- `size`
- optional `createdById`

## Limits and Validation
- File must be image MIME type.
- Max size: 15MB.
- Admin session required.

## Required Provider Settings
- Valid S3 credentials (access key + secret).
- Bucket exists.
- Public asset URL configured (r2.dev or custom domain).
