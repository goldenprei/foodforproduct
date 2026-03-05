# FoodforProduct Engineering Home

- Purpose: Central entry point for all engineering and operations documentation for the FoodforProduct platform.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: Any architecture/API/data model/deployment or incident process change.
- Related pages: [01 - Product Scope and Goals](./01-Product-Scope-and-Goals.md), [02 - System Architecture Overview](./02-System-Architecture-Overview.md), [11 - Deployment and Domain Runbook (Railway + Hostinger + Cloudflare)](./11-Deployment-and-Domain-Runbook-Railway-Hostinger-Cloudflare.md)

## How To Use This Wiki
1. Start with product scope and architecture pages.
2. Use API/Data Model pages for implementation details.
3. Use Deployment/Operations/Troubleshooting pages for runtime changes and incidents.
4. Keep this wiki as the single source of truth. If code changes, update docs in the same change set.

## Current System Snapshot
- Stack: Next.js App Router, TypeScript, Prisma, PostgreSQL, NextAuth, TipTap, S3-compatible storage.
- Hosting target: Railway runtime with Hostinger domain DNS and Cloudflare R2 media storage.
- Canonical content format: Structured editor JSON (`contentJson`) with derived HTML/text.
- Auth model: GitHub OAuth + explicit admin email allowlist.
- Editorial model: Single category + many tags per article.
- Media model: Server-side direct upload endpoint (primary) plus legacy signed URL route.
- PDF model: Server-side PDF generation via `pdfkit` (no headless browser dependency).

## Page Tree
1. [01 - Product Scope and Goals](./01-Product-Scope-and-Goals.md)
2. [02 - System Architecture Overview](./02-System-Architecture-Overview.md)
3. [03 - Data Model (Prisma/Postgres)](./03-Data-Model-Prisma-Postgres.md)
4. [04 - API Reference (Public + Admin)](./04-API-Reference-Public-Admin.md)
5. [05 - Admin Authoring Workflow (Editor, Publish, Category/Tags)](./05-Admin-Authoring-Workflow-Editor-Publish-Category-Tags.md)
6. [06 - Content Import Pipeline (.md/.txt/.docx)](./06-Content-Import-Pipeline-md-txt-docx.md)
7. [07 - Media and File Storage (R2/S3-compatible)](./07-Media-and-File-Storage-R2-S3-Compatible.md)
8. [08 - Authentication and Access Control (GitHub OAuth + Admin Allowlist)](./08-Authentication-and-Access-Control-GitHub-OAuth-Admin-Allowlist.md)
9. [09 - PDF Export Architecture and Limits](./09-PDF-Export-Architecture-and-Limits.md)
10. [10 - Environment Variables and Configuration Matrix](./10-Environment-Variables-and-Configuration-Matrix.md)
11. [11 - Deployment and Domain Runbook (Railway + Hostinger + Cloudflare)](./11-Deployment-and-Domain-Runbook-Railway-Hostinger-Cloudflare.md)
12. [12 - Operations Runbook (Migrations, Backups, Rollback, Incident Response)](./12-Operations-Runbook-Migrations-Backups-Rollback-Incident-Response.md)
13. [13 - Troubleshooting Catalog (Known Failure Modes + Fix Steps)](./13-Troubleshooting-Catalog-Known-Failure-Modes-Fix-Steps.md)
14. [14 - Testing and Quality Gates](./14-Testing-and-Quality-Gates.md)
15. [15 - Changelog and Architectural Decisions](./15-Changelog-and-Architectural-Decisions.md)
16. [16 - Future Improvements Backlog](./16-Future-Improvements-Backlog.md)

## Confluence Publishing Notes
- Create one Confluence page per Markdown file above.
- Keep titles exactly aligned with file names.
- Keep numbering prefix (`01`, `02`, ...) for stable navigation.
- Use page labels:
  - Global: `foodforproduct`, `engineering`
  - Per page: `api`, `runbook`, `auth`, `db`, `media`, `troubleshooting`, etc.
