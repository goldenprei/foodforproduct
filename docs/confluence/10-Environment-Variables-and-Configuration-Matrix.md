# 10 - Environment Variables and Configuration Matrix

- Purpose: Define all required runtime configuration and ownership.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: Any addition/removal/semantics change of `lib/env.ts` values.
- Related pages: [08 - Authentication](./08-Authentication-and-Access-Control-GitHub-OAuth-Admin-Allowlist.md), [07 - Media and File Storage](./07-Media-and-File-Storage-R2-S3-Compatible.md), [11 - Deployment Runbook](./11-Deployment-and-Domain-Runbook-Railway-Hostinger-Cloudflare.md)

## Validation Behavior
- Env values are validated at startup/build in `lib/env.ts`.
- Missing/invalid fields throw an error and fail the app early.

## Configuration Matrix

| Group | Variable | Required | Example | Notes |
|---|---|---|---|---|
| Database | `DATABASE_URL` | Yes | `postgresql://...` | Must point to production Postgres instance |
| Auth | `NEXTAUTH_URL` | Yes | `https://foodforproduct.com` | Must match deployed canonical URL |
| Auth | `NEXTAUTH_SECRET` | Yes | random 32+ bytes | Used for NextAuth token/session cryptography |
| Auth | `ADMIN_EMAILS` | Yes | `keimpe.wijma@gmail.com` | Comma-separated allowlist |
| Auth | `GITHUB_ID` | Yes | OAuth client id | GitHub app credential |
| Auth | `GITHUB_SECRET` | Yes | OAuth secret | GitHub app credential |
| App URL | `APP_BASE_URL` | Yes | `https://foodforproduct.com` | Used for server-side URL generation |
| Media | `S3_ENDPOINT` | Yes | `https://<acct>.r2.cloudflarestorage.com` | S3 API endpoint |
| Media | `S3_REGION` | Yes | `auto` | R2 uses `auto` |
| Media | `S3_BUCKET` | Yes | `foodforproduct` | Bucket name |
| Media | `S3_ACCESS_KEY_ID` | Yes | `...` | S3 credential |
| Media | `S3_SECRET_ACCESS_KEY` | Yes | `...` | S3 credential |
| Media | `S3_PUBLIC_URL` | Yes | `https://pub-xxxx.r2.dev` | Public serving base URL |

## Environment Ownership
- Railway service variables are source of truth for deployed runtime.
- Local `.env` is for local development only.
