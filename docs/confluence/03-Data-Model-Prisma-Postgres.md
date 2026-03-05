# 03 - Data Model (Prisma/Postgres)

- Purpose: Document core entities, relationships, constraints, and lifecycle behaviors.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: Any Prisma schema or migration change.
- Related pages: [04 - API Reference](./04-API-Reference-Public-Admin.md), [12 - Operations Runbook](./12-Operations-Runbook-Migrations-Backups-Rollback-Incident-Response.md), [15 - Changelog and Architectural Decisions](./15-Changelog-and-Architectural-Decisions.md)

## Schema Overview
Database provider is PostgreSQL. ORM is Prisma. Current migration baseline: `prisma/migrations/0001_init/migration.sql`.

## Entity: User
### Entity intent
Authenticated admin identity used by NextAuth and ownership metadata.

### Key fields
- `id` (cuid, PK)
- `email` (unique)
- `role` (`OWNER` enum default)
- timestamps

### Indexes
- unique index on `email`

### Relations
- `accounts`, `sessions` (auth tables)
- `revisions` (`ArticleRevision.savedById`)
- `mediaAssets` (`MediaAsset.createdById`)

### Lifecycle events
- Created on first valid OAuth sign-in.

## Entity: Category
### Entity intent
Single category per article.

### Key fields
- `id`, `name` (unique), `slug` (unique)

### Indexes
- unique on `name`
- unique on `slug`

### Relations
- one-to-many `articles`

### Lifecycle events
- Auto-created when draft save uses unseen category string.

## Entity: Tag + ArticleTag
### Entity intent
Many tags per article via join table.

### Key fields
- Tag: `id`, `name` (unique), `slug` (unique)
- ArticleTag: composite PK (`articleId`, `tagId`)

### Indexes
- uniques on Tag `name` and `slug`
- composite PK on join table

### Relations
- many-to-many Article <-> Tag

### Lifecycle events
- Tags are upserted/created during draft saves.
- Existing article tag mappings are replaced during save.

## Entity: Article
### Entity intent
Primary content record and publication state.

### Key fields
- `slug` (unique)
- `title`, `excerpt`
- `contentJson` (canonical)
- `contentHtml` (derived)
- `contentText` (derived)
- `status` (`DRAFT`|`PUBLISHED`)
- `publishAt` (editable publish timestamp)
- `firstPublishedAt` (immutable first publish marker)
- `coverImageUrl`
- `categoryId`

### Indexes
- `@@index([status, publishAt])`
- `@@index([categoryId])`

### Relations
- belongs to `Category`
- has many `ArticleTag`, `ArticleRevision`, `ImportSource`

### Lifecycle events
- Created as draft with default empty doc.
- On save: canonical JSON persisted, HTML/text re-derived.
- On publish: `status` set to published and `publishAt` assigned/overridden.

## Entity: ArticleRevision
### Entity intent
Snapshot history for recoverability/audit trail.

### Key fields
- `snapshot` JSON of article state at save/publish transitions.
- `savedById` optional.

### Indexes
- `@@index([articleId, createdAt])`

### Relations
- belongs to `Article`, optional relation to `User`.

### Lifecycle events
- created on draft create/save/publish/unpublish operations.

## Entity: MediaAsset
### Entity intent
Track uploaded media object metadata.

### Key fields
- `key` unique object path
- `url`, `mimeType`, `size`
- `createdById` optional

### Indexes
- unique on `key`

### Relations
- optional relation to `User` creator

### Lifecycle events
- inserted/updated when media upload is registered.

## Entity: ImportSource
### Entity intent
Idempotency and provenance for content imports.

### Key fields
- `filePath` unique
- `checksum`
- `sourceType`
- `articleId`

### Indexes
- unique on `filePath`
- index on `articleId`

### Lifecycle events
- upserted during import runs.
- unchanged checksum => import skipped.
