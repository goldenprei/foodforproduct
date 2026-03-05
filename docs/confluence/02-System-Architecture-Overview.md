# 02 - System Architecture Overview

- Purpose: Provide end-to-end system architecture, runtime boundaries, and data flow.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: Changes in hosting/runtime, service boundaries, or major library replacement.
- Related pages: [03 - Data Model](./03-Data-Model-Prisma-Postgres.md), [04 - API Reference](./04-API-Reference-Public-Admin.md), [11 - Deployment Runbook](./11-Deployment-and-Domain-Runbook-Railway-Hostinger-Cloudflare.md)

## High-Level Components
- Frontend/UI: Next.js App Router pages (`app/(public)` and `app/admin`).
- API Layer: Next.js Route Handlers under `/api/v1` and `/api/auth`.
- Domain Services: `lib/services/*` for article/media business logic.
- Content Pipeline: TipTap JSON rendering, import transforms, math rendering.
- Persistence: PostgreSQL via Prisma ORM.
- Auth: NextAuth with GitHub provider and email allowlist gate.
- Media Storage: S3-compatible storage (Cloudflare R2 expected).
- PDF: Server-side generation using `pdfkit`.

## Request/Data Flow
1. Browser requests page/API on Railway-hosted Next.js app.
2. Route handler validates input (`zod`) and auth session (admin routes).
3. Domain service reads/writes via Prisma.
4. For media upload, app uploads to S3-compatible storage from server.
5. Response returned as JSON/HTML/PDF stream.

## Key Architectural Decisions
- API-first monorepo: frontend consumes explicit `/api/v1` contracts.
- Canonical article body in structured JSON (`contentJson`) for editor continuity.
- Derived fields (`contentHtml`, `contentText`) for rendering and search.
- Single-owner admin model with strict allowlist.
- Deployment runtime chosen for server-side capabilities (non-static app).

## Runtime Constraints
- Environment variables are required at startup/build and validated strictly.
- Missing env vars fail early by design.
- PDF route no longer depends on Playwright/Chromium runtime binaries.

## Source of Truth in Code
- Routing/UI: `app/`
- Services: `lib/services/`
- Schema: `prisma/schema.prisma`
- Validation: `lib/validation/`
- Auth: `lib/auth/options.ts`
