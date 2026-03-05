import { generateHTML, generateJSON } from "@tiptap/html";
import sanitizeHtml from "sanitize-html";

import { editorExtensions } from "@/lib/content/extensions";
import { renderMathInHtml } from "@/lib/content/math";

export function contentJsonToHtml(contentJson: unknown): string {
  const rawHtml = generateHTML(contentJson as Record<string, unknown>, editorExtensions);

  const sanitized = sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "h3",
      "span",
      "div"
    ]),
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      span: ["class"],
      div: ["class"],
      code: ["class"]
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
    parseStyleAttributes: false
  });

  return renderMathInHtml(sanitized);
}

export function htmlToContentJson(html: string): Record<string, unknown> {
  return generateJSON(html, editorExtensions);
}
