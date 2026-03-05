# 16 - Future Improvements Backlog

- Purpose: Track prioritized future enhancements with clear implementation intent.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: New product priorities, incidents, or architecture opportunities.
- Related pages: [01 - Product Scope and Goals](./01-Product-Scope-and-Goals.md), [15 - Changelog and Architectural Decisions](./15-Changelog-and-Architectural-Decisions.md), [14 - Testing and Quality Gates](./14-Testing-and-Quality-Gates.md)

## Priority Backlog

### P1 - Operational Stability
1. Add health endpoint and startup diagnostics page.
2. Add structured logging and request correlation IDs.
3. Add periodic backup/restore drill checklist for DB.

### P1 - Editorial Safety
1. Add restore-from-revision UI in admin.
2. Add explicit unsaved-changes protection on navigation.
3. Add conflict handling if multiple sessions edit same article.

### P2 - Reader Experience
1. Improve PDF formatting fidelity (image embedding/math rendering).
2. Add related-articles module based on tags/category similarity.
3. Add RSS feed endpoint.

### P2 - Search/Taxonomy
1. Add dedicated tag index pages.
2. Add full-text ranking improvements beyond simple contains queries.
3. Add optional multi-category model evaluation (currently single category by design).

### P3 - Product Growth
1. Add newsletter subscription integration.
2. Add optional comments via third-party provider.
3. Add basic analytics dashboard for article performance.

## Backlog Governance
- Every accepted backlog item requires:
  - owner
  - target milestone
  - acceptance criteria
  - documentation impact pages to update
