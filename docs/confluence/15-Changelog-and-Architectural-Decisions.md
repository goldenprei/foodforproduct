# 15 - Changelog and Architectural Decisions

- Purpose: Track significant delivery milestones and architecture decisions with rationale.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: Any architectural change or production-impacting behavior change.
- Related pages: [02 - Architecture Overview](./02-System-Architecture-Overview.md), [14 - Testing and Quality Gates](./14-Testing-and-Quality-Gates.md), [16 - Future Improvements Backlog](./16-Future-Improvements-Backlog.md)

## Changelog

### 2026-03-05 - Platform Baseline
- Implemented fullstack blog platform with Next.js, Prisma, NextAuth, editor, import pipeline, taxonomy, and API-first routes.
- Added public and admin publishing interfaces.
- Added deployment support for Railway workflow.

### 2026-03-05 - Reliability Fixes (Local latest)
- Added server-side direct media upload endpoint (`/api/v1/admin/media/upload`).
- Replaced PDF generation runtime strategy with `pdfkit`.
- Updated editor UX with upload status feedback.
- Updated category UX to dropdown + `New category` toggle input.

## Architectural Decision Records (ADR)

### ADR-001: Canonical Content Stored as Structured JSON
- Decision: Keep editor JSON (`contentJson`) as canonical body representation.
- Rationale: Preserves rich editor semantics and extensibility.
- Consequence: Rendering pipeline required for HTML/text/PDF outputs.

### ADR-002: API-First Route Contracts in Same Repo
- Decision: Frontend consumes explicit `/api/v1` contracts instead of direct DB calls.
- Rationale: Allows frontend redesign without backend/content refactor.
- Consequence: Added validation and service boundaries.

### ADR-003: PDF Generation via `pdfkit` for Railway Compatibility
- Decision: Use server-side `pdfkit` generation, not browser-based engines.
- Rationale: Avoid runtime binary dependency issues.
- Consequence: PDF visual output is simplified vs web rendering.

### ADR-004: Primary Media Upload via Server Endpoint
- Decision: Route image uploads through app server to S3-compatible storage.
- Rationale: More robust under provider CORS variability.
- Consequence: App server handles file transfer and validation.
