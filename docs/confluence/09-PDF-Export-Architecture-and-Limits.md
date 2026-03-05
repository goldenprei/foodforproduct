# 09 - PDF Export Architecture and Limits

- Purpose: Document current PDF generation mechanism, guarantees, and limitations.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: Any change in PDF library, formatting behavior, or endpoint contracts.
- Related pages: [04 - API Reference](./04-API-Reference-Public-Admin.md), [05 - Admin Authoring Workflow](./05-Admin-Authoring-Workflow-Editor-Publish-Category-Tags.md), [13 - Troubleshooting](./13-Troubleshooting-Catalog-Known-Failure-Modes-Fix-Steps.md)

## Endpoints
- Public: `GET /api/v1/articles/:slug/pdf`
- Admin: `GET /api/v1/admin/articles/:id/pdf`

## Current Implementation
- Library: `pdfkit`
- Rendering strategy: parse article `contentJson` into line-oriented PDF blocks.
- No browser/headless runtime dependency.

## Why This Architecture
- Railway reliability: avoids Playwright/Chromium install/runtime failures.
- Faster cold-start profile for PDF endpoint.

## Formatting Coverage
- Title/meta/tags/excerpt header block.
- Headings, paragraphs, lists, code blocks, blockquotes.
- Image nodes rendered as textual references (alt/src), not embedded binary images.

## Limits
- Not pixel-equivalent to web article rendering.
- Advanced rich layout from HTML/CSS is intentionally simplified.
- Math notation is rendered as text, not full KaTeX typesetting in PDF.

## Future Upgrade Path
- If richer visual fidelity is needed, evaluate dedicated HTML-to-PDF service/runtime with deterministic binary support.
