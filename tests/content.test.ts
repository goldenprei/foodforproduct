import assert from "node:assert/strict";
import test from "node:test";

import { extractPlainTextFromDoc } from "../lib/content/text";
import { toSlug } from "../lib/content/slug";

test("toSlug normalizes titles", () => {
  assert.equal(toSlug("Ancient World Maths!!!"), "ancient-world-maths");
  assert.equal(toSlug("  Product + AI = value loops  "), "product-ai-value-loops");
});

test("extractPlainTextFromDoc flattens nested nodes", () => {
  const doc = {
    type: "doc",
    content: [
      {
        type: "heading",
        content: [{ type: "text", text: "Hello" }]
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "World" }]
      }
    ]
  };

  assert.equal(extractPlainTextFromDoc(doc), "Hello World");
});
