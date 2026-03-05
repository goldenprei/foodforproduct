# 13 - Troubleshooting Catalog (Known Failure Modes + Fix Steps)

- Purpose: Provide fast diagnosis and recovery procedures for common failures.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: New incidents or remediation pattern changes.
- Related pages: [11 - Deployment Runbook](./11-Deployment-and-Domain-Runbook-Railway-Hostinger-Cloudflare.md), [12 - Operations Runbook](./12-Operations-Runbook-Migrations-Backups-Rollback-Incident-Response.md), [10 - Environment Variables](./10-Environment-Variables-and-Configuration-Matrix.md)

## Issue: Homepage returns 502 on Railway
- Symptom: HTTP logs show `upstreamErrors: connection dial timeout`.
- Likely cause: App not listening on expected host/port.
- How to confirm: Check deploy logs; no `ready` server line, or wrong bind address.
- Fix:
  1. Set start command to `npm run start -- --hostname 0.0.0.0 --port $PORT` (or migration wrapper).
  2. Redeploy.
- Prevention: Keep start command documented and immutable in deployment config.

## Issue: Build fails with `Invalid environment configuration`
- Symptom: Build aborts listing missing env vars.
- Likely cause: Required variables absent/invalid.
- How to confirm: Compare Railway variables against page `10` matrix.
- Fix: Populate all required env vars and redeploy.
- Prevention: Maintain environment checklist and enforce pre-deploy review.

## Issue: Image upload fails in admin editor
- Symptom: Upload status fails; no object appears in bucket.
- Likely cause: Bad S3 credentials, missing bucket, invalid public URL, or MIME/size rejection.
- How to confirm:
  1. Check server logs for `/api/v1/admin/media/upload` errors.
  2. Validate env vars `S3_*`.
- Fix:
  1. Correct credentials/bucket/public URL.
  2. Re-test with image <15MB.
- Prevention: Rotate/test credentials with runbook before production changes.

## Issue: PDF download fails
- Symptom: Export endpoint returns 500.
- Likely cause: Unexpected document payload or runtime failure in pdf generation.
- How to confirm: Check logs for `/api/v1/articles/:slug/pdf` or admin PDF route.
- Fix:
  1. Validate article exists and content JSON is valid.
  2. Re-deploy latest build with `pdfkit` routes.
- Prevention: Include PDF smoke test in release gate.

## Issue: Admin login denied for valid GitHub account
- Symptom: OAuth succeeds but access denied.
- Likely cause: Email not in `ADMIN_EMAILS` or callback mismatch.
- How to confirm: Check env var and GitHub OAuth callback URL.
- Fix:
  1. Add exact email to `ADMIN_EMAILS`.
  2. Ensure callback matches current domain.
- Prevention: Keep one source of truth for production callback URL.
