# 11 - Deployment and Domain Runbook (Railway + Hostinger + Cloudflare)

- Purpose: Provide executable production deployment and custom domain setup instructions.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: Hosting provider or DNS flow changes.
- Related pages: [10 - Environment Variables](./10-Environment-Variables-and-Configuration-Matrix.md), [12 - Operations Runbook](./12-Operations-Runbook-Migrations-Backups-Rollback-Incident-Response.md), [13 - Troubleshooting](./13-Troubleshooting-Catalog-Known-Failure-Modes-Fix-Steps.md)

## Preconditions
- GitHub repo contains latest code.
- Railway project and Postgres service created.
- Cloudflare R2 bucket and credentials created.
- Hostinger controls DNS for `foodforproduct.com`.

## Deployment Steps
1. Create Railway service from GitHub repo.
2. Set required env vars from page `10`.
3. Build command:
```bash
npm run build
```
4. Start command:
```bash
sh -c "npx prisma migrate deploy && npm run start -- --hostname 0.0.0.0 --port $PORT"
```
5. Ensure public domain generated for app port (typically `8080`).

## Expected Output
- Railway deployment reaches healthy state.
- Homepage returns HTTP 200.
- Admin login page loads.

## Domain Wiring (Hostinger DNS)
1. Add Railway custom domains:
- `foodforproduct.com`
- `www.foodforproduct.com`
2. In Hostinger DNS Zone, apply records exactly as Railway requests.
3. Remove conflicting old records for apex/www.
4. Wait for DNS propagation and certificate issuance.

## OAuth Production Cutover
Update GitHub OAuth callback URL to:
```text
https://foodforproduct.com/api/auth/callback/github
```
Update env:
- `NEXTAUTH_URL=https://foodforproduct.com`
- `APP_BASE_URL=https://foodforproduct.com`

## Rollback Path
- In Railway, rollback to previous healthy deployment.
- If DNS change caused outage, temporarily restore previous DNS records.
