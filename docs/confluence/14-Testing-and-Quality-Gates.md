# 14 - Testing and Quality Gates

- Purpose: Define mandatory verification gates before deployment and during maintenance.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: New test suites, quality gates, or release criteria changes.
- Related pages: [12 - Operations Runbook](./12-Operations-Runbook-Migrations-Backups-Rollback-Incident-Response.md), [13 - Troubleshooting](./13-Troubleshooting-Catalog-Known-Failure-Modes-Fix-Steps.md), [15 - Changelog and Architectural Decisions](./15-Changelog-and-Architectural-Decisions.md)

## Automated Checks
Run before any production deploy:
```bash
npm run lint
npm run test
npm run build
```

## Current Coverage
- Unit-level utilities:
  - slug normalization
  - JSON text extraction
- Build-time type and route integrity checks via Next.js build.

## Manual Smoke Suite (Required)
1. Homepage loads.
2. Admin login works for allowlisted email.
3. Create/edit draft works.
4. Image upload embeds successfully.
5. Publish action works and article appears on public feed.
6. Public PDF and admin PDF export both work.
7. Category dropdown/new category toggle works.

## Documentation Quality Tests
1. New engineer can onboard using docs only.
2. Incident drill can be executed from runbooks.
3. API contract readable without source lookup.
4. Every model/endpoint change maps to known docs update targets.

## Quality Gate Policy
- No production deploy without successful automated checks and manual smoke.
- Incidents require postmortem note in changelog/ADR page.
