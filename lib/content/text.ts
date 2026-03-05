export function extractPlainTextFromDoc(node: unknown): string {
  if (!node || typeof node !== "object") {
    return "";
  }

  const current = node as { text?: string; content?: unknown[] };

  const ownText = typeof current.text === "string" ? current.text : "";
  const childText = Array.isArray(current.content)
    ? current.content.map((child) => extractPlainTextFromDoc(child)).join(" ")
    : "";

  return `${ownText} ${childText}`.replace(/\s+/g, " ").trim();
}
