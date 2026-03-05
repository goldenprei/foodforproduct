# 01 - Product Scope and Goals

- Purpose: Define product intent, scope boundaries, and success criteria for the current platform.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: Any shift in feature scope, target audience, or success metrics.
- Related pages: [02 - System Architecture Overview](./02-System-Architecture-Overview.md), [05 - Admin Authoring Workflow](./05-Admin-Authoring-Workflow-Editor-Publish-Category-Tags.md), [16 - Future Improvements Backlog](./16-Future-Improvements-Backlog.md)

## Product Intent
FoodforProduct is a content platform for publishing long-form thoughts on product management, AI, metrics, and math-oriented topics. The system is optimized for founder-led writing with in-browser editing and robust publishing controls.

## Primary Audience
- Primary: Site owner/editor (single admin owner account).
- Secondary: Future engineers maintaining and extending the platform.
- Readers: Public audience consuming published articles.

## In Scope (Current)
- Public blog listing and article reading.
- Rich admin editor with formatting controls.
- Category + tag taxonomy.
- Backdating/future-dating publish timestamp.
- Image upload and embedding.
- PDF export (public and admin workflows).
- Importing historical content from files.
- API-first backend architecture.

## Out of Scope (Current)
- Public user accounts.
- Comments.
- Newsletter automation.
- Multi-author RBAC beyond single owner/admin allowlist.
- Advanced analytics dashboards.

## Success Criteria
- Editor can create, edit, publish, unpublish, and backdate content without code changes.
- Readers can browse/filter content and download article PDFs.
- Deployment on Railway is stable with actionable operational runbooks.
- New engineer can onboard and run the system using documentation only.

## Non-Functional Priorities
- Content safety and auditability (revision snapshots).
- Frontend/backend decoupling through stable API contracts.
- Operational clarity over novelty.
