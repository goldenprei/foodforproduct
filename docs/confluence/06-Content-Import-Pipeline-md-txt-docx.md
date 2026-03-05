# 06 - Content Import Pipeline (.md/.txt/.docx)

- Purpose: Document historical content ingestion mechanics and operational usage.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: Import format, parsing, or idempotency logic changes.
- Related pages: [03 - Data Model](./03-Data-Model-Prisma-Postgres.md), [12 - Operations Runbook](./12-Operations-Runbook-Migrations-Backups-Rollback-Incident-Response.md), [13 - Troubleshooting](./13-Troubleshooting-Catalog-Known-Failure-Modes-Fix-Steps.md)

## Supported Inputs
- `.md` / `.markdown`
- `.txt`
- `.docx`

## Import Entrypoints
- Script: `npm run import:content -- --dir=content/import [--publish]`
- API: `POST /api/v1/admin/import`

## Parsing Rules
- Markdown/txt may include frontmatter.
- Frontmatter fields supported: `title`, `slug`, `category`, `tags`, `excerpt`, `publishAt|date`, `published`, `coverImageUrl`.
- Docx conversion path: HTML extraction then editor JSON conversion.

## Canonical Transformation
`source file -> parsed text/html -> TipTap JSON (contentJson) -> article draft/save`

## Idempotency and Update Logic
- `ImportSource.filePath` + checksum tracked.
- If checksum unchanged from prior run, file is skipped.
- If changed, associated article is updated.

## Publish Behavior
- Default import creates/updates drafts.
- `--publish` or frontmatter `published: true` publishes imported record.

## Safety Notes
- Import route is admin-protected.
- Failed file parses are collected in summary errors.
