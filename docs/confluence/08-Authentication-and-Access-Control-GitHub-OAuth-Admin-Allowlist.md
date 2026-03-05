# 08 - Authentication and Access Control (GitHub OAuth + Admin Allowlist)

- Purpose: Document auth flow, authorization rules, and production setup constraints.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: Provider changes, session strategy changes, or access policy changes.
- Related pages: [04 - API Reference](./04-API-Reference-Public-Admin.md), [10 - Environment Variables](./10-Environment-Variables-and-Configuration-Matrix.md), [11 - Deployment Runbook](./11-Deployment-and-Domain-Runbook-Railway-Hostinger-Cloudflare.md)

## Auth Stack
- Framework: NextAuth.
- Provider: GitHub OAuth.
- Persistence: Prisma adapter + DB sessions.

## Authorization Model
- Sign-in allowed only when OAuth-returned email is in `ADMIN_EMAILS` allowlist.
- If user email is absent or not allowlisted, sign-in denied.
- Admin APIs check server session and return `401` when unauthenticated.

## Session Enrichment
- Session user is enriched with:
  - `id`
  - `role` (resolved from DB, fallback `OWNER`)

## Required GitHub OAuth Configuration
- Callback URL must match deployment base URL:
  - Railway temporary domain during setup
  - `https://foodforproduct.com/api/auth/callback/github` in production

## Security Notes
- Keep `NEXTAUTH_SECRET` high entropy and private.
- Restrict `ADMIN_EMAILS` to exact trusted addresses.
- Never expose DB credentials/client secrets to client-side code.
