# 12 - Operations Runbook (Migrations, Backups, Rollback, Incident Response)

- Purpose: Define executable operational procedures for safe runtime changes.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: Any production ops process or infrastructure change.
- Related pages: [11 - Deployment Runbook](./11-Deployment-and-Domain-Runbook-Railway-Hostinger-Cloudflare.md), [13 - Troubleshooting](./13-Troubleshooting-Catalog-Known-Failure-Modes-Fix-Steps.md), [14 - Testing and Quality Gates](./14-Testing-and-Quality-Gates.md)

## Runbook: Apply DB Migrations
### Preconditions
- New migration files exist in `prisma/migrations`.
- `DATABASE_URL` points at target DB.

### Command
```bash
npx prisma migrate deploy
```

### Expected output
- `All migrations have been successfully applied.`

### Rollback path
- Restore DB from backup or apply compensating migration.
- Roll back app deployment if schema/app mismatch introduced outage.

## Runbook: Pre-Release Verification
### Preconditions
- Candidate commit pushed.

### Commands
```bash
npm run lint
npm run test
npm run build
```

### Expected output
- No lint errors.
- Tests pass.
- Build succeeds.

### Rollback path
- Revert offending commit and redeploy previous known-good commit.

## Runbook: Emergency Rollback (App)
### Preconditions
- Active production incident.

### Steps
1. Identify last healthy Railway deployment.
2. Roll back deployment from Railway UI.
3. Confirm homepage/admin/API health.
4. Create incident note in changelog/ADR page.

### Expected output
- Error rate returns to baseline.

### Rollback path
- If rollback fails, switch traffic/DNS to maintenance fallback page.

## Runbook: Media Credential Rotation
### Preconditions
- New R2 key pair issued.

### Steps
1. Update `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` in Railway variables.
2. Redeploy service.
3. Validate image upload path.
4. Revoke old key pair.

### Expected output
- Uploads continue successfully.

### Rollback path
- Restore previous credentials if new keys invalid.
