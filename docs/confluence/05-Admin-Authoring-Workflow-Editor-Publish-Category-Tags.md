# 05 - Admin Authoring Workflow (Editor, Publish, Category/Tags)

- Purpose: Document the full editor workflow, publishing behavior, and category/tag UX.
- Owner: Keimpe Wijma
- Last reviewed: 2026-03-05
- Update trigger: Any changes in editor controls, autosave/publish logic, or metadata fields.
- Related pages: [04 - API Reference](./04-API-Reference-Public-Admin.md), [07 - Media and File Storage](./07-Media-and-File-Storage-R2-S3-Compatible.md), [09 - PDF Export](./09-PDF-Export-Architecture-and-Limits.md)

## Admin Entry Points
- `/admin/login` for OAuth sign-in.
- `/admin` dashboard for article list and import panel.
- `/admin/articles/new` creates draft and redirects to editor.
- `/admin/articles/:id/edit` is the authoring interface.

## Editor Features
- Rich text controls: headings, bold/italic/underline, bullet/ordered lists, indent/outdent, links, blockquote, code blocks, undo/redo.
- LaTeX helper insertions for inline and block notation.
- Image embedding from file upload.

## Save/Publish Flow
1. Save draft -> `PATCH /api/v1/admin/articles/:id`.
2. Publish -> save draft + `POST /publish` with optional custom datetime.
3. Unpublish -> `POST /unpublish`.
4. Status shown in UI (`DRAFT` or `PUBLISHED`).

## Category/Tag Behavior
- One category per article.
- Many tags per article.
- Category UX:
  - Default: dropdown of existing categories.
  - `New category` link toggles to free-text input.
  - `Use existing category` toggles back to dropdown.
- Tags entered as comma-separated values.

## Publish Date Rules
- Editable datetime (`publishAt`) supports past and future.
- Public listing only shows `PUBLISHED` where `publishAt <= now`.

## Editor User Feedback
- Info line shows action states (saving, publishing, upload status).
- Image upload button displays upload-in-progress state.

## Known UX Constraints
- No collaborative editing.
- No autosave timer; save is explicit.
