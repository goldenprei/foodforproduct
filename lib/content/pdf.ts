import fs from "node:fs";
import path from "node:path";

import PDFDocument from "pdfkit";

import { formatPublishDate } from "@/lib/format";

type PrintableArticle = {
  title: string;
  excerpt: string | null;
  publishAt: Date | string | null;
  category: { name: string };
  tags: Array<{ name: string }>;
  contentJson: Record<string, unknown>;
};

type DocNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
};

type PdfLine = {
  text?: string;
  style: "paragraph" | "heading1" | "heading2" | "heading3" | "list" | "code" | "blockquote" | "image";
  indent?: number;
  src?: string;
  alt?: string;
};

const PDF_FONT_PATH = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "compiled",
  "@vercel",
  "og",
  "noto-sans-v27-latin-regular.ttf"
);
const PDF_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const PDF_IMAGE_FETCH_TIMEOUT_MS = 8000;

function resolvePdfFontPath() {
  if (fs.existsSync(PDF_FONT_PATH)) {
    return PDF_FONT_PATH;
  }

  throw new Error(`PDF font file is missing at ${PDF_FONT_PATH}`);
}

function asDocNode(value: unknown): DocNode {
  if (!value || typeof value !== "object") {
    return {};
  }

  return value as DocNode;
}

function getChildren(node: DocNode): DocNode[] {
  return Array.isArray(node.content) ? node.content.map(asDocNode) : [];
}

function textFromNode(node: DocNode): string {
  if (node.type === "hardBreak") {
    return "\n";
  }

  const ownText = typeof node.text === "string" ? node.text : "";
  const childText = getChildren(node)
    .map((child) => textFromNode(child))
    .join("");

  return `${ownText}${childText}`;
}

function pushLine(lines: PdfLine[], text: string, style: PdfLine["style"], indent = 0) {
  const normalized = text.trim();
  if (!normalized) {
    return;
  }

  lines.push({
    text: normalized,
    style,
    indent
  });
}

function pushImage(lines: PdfLine[], src: string, alt: string, indent = 0) {
  const normalizedSrc = src.trim().replace(/\s+/g, "");
  if (!normalizedSrc) {
    return;
  }

  lines.push({
    style: "image",
    indent,
    src: normalizedSrc,
    alt: alt.trim()
  });
}

function renderList(items: DocNode[], lines: PdfLine[], indent: number, ordered: boolean) {
  items.forEach((item, index) => {
    if (item.type !== "listItem") {
      return;
    }

    let wroteMainItem = false;

    for (const child of getChildren(item)) {
      if (child.type === "paragraph") {
        const text = textFromNode(child);
        const prefix = ordered ? `${index + 1}.` : "•";
        pushLine(lines, `${prefix} ${text}`, "list", indent);
        wroteMainItem = true;
        continue;
      }

      if (child.type === "bulletList") {
        renderList(getChildren(child), lines, indent + 1, false);
        continue;
      }

      if (child.type === "orderedList") {
        renderList(getChildren(child), lines, indent + 1, true);
        continue;
      }

      renderNode(child, lines, indent + 1);
    }

    if (!wroteMainItem) {
      const prefix = ordered ? `${index + 1}.` : "•";
      pushLine(lines, `${prefix} (empty item)`, "list", indent);
    }
  });
}

function renderNode(node: DocNode, lines: PdfLine[], indent = 0) {
  switch (node.type) {
    case "heading": {
      const level = Number(node.attrs?.level ?? 1);
      const style = level <= 1 ? "heading1" : level === 2 ? "heading2" : "heading3";
      pushLine(lines, textFromNode(node), style, indent);
      return;
    }
    case "paragraph": {
      pushLine(lines, textFromNode(node), "paragraph", indent);
      return;
    }
    case "blockquote": {
      for (const child of getChildren(node)) {
        pushLine(lines, textFromNode(child), "blockquote", indent);
      }
      return;
    }
    case "codeBlock": {
      pushLine(lines, textFromNode(node), "code", indent);
      return;
    }
    case "bulletList": {
      renderList(getChildren(node), lines, indent, false);
      return;
    }
    case "orderedList": {
      renderList(getChildren(node), lines, indent, true);
      return;
    }
    case "image": {
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "Image";
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
      pushImage(lines, src, alt, indent);
      return;
    }
    default: {
      const children = getChildren(node);
      if (!children.length) {
        return;
      }
      for (const child of children) {
        renderNode(child, lines, indent);
      }
    }
  }
}

function contentToLines(contentJson: Record<string, unknown>): PdfLine[] {
  const root = asDocNode(contentJson);
  const lines: PdfLine[] = [];

  for (const child of getChildren(root)) {
    renderNode(child, lines);
  }

  return lines;
}

function writeImageFallback(doc: PDFKit.PDFDocument, fontPath: string, src: string, alt: string) {
  doc.moveDown(0.3).font(fontPath).fontSize(11).fillColor("#364335").text(`[Image] ${alt || src}`);
  doc.font(fontPath).fontSize(9).fillColor("#4f5a4d").text(src);
}

async function fetchImageBuffer(src: string): Promise<Buffer | null> {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PDF_IMAGE_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      return null;
    }

    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (contentLength > PDF_IMAGE_MAX_BYTES) {
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.length || buffer.length > PDF_IMAGE_MAX_BYTES) {
      return null;
    }

    return buffer;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function renderImageLine(doc: PDFKit.PDFDocument, fontPath: string, line: PdfLine) {
  const src = line.src?.trim();
  if (!src) {
    return;
  }

  const alt = line.alt ?? "";
  const buffer = await fetchImageBuffer(src);
  if (!buffer) {
    writeImageFallback(doc, fontPath, src, alt);
    return;
  }

  try {
    const maxWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const maxHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;

    if (doc.y > doc.page.height - doc.page.margins.bottom - 120) {
      doc.addPage();
    }

    const fit: [number, number] = [maxWidth, Math.min(360, maxHeight)];
    doc.image(buffer, { fit });

    doc.moveDown(0.25);

    if (alt) {
      doc.moveDown(0.1).font(fontPath).fontSize(9).fillColor("#4f5a4d").text(alt);
    }
  } catch {
    writeImageFallback(doc, fontPath, src, alt);
  }
}

export async function buildArticlePdfBuffer(article: PrintableArticle): Promise<Buffer> {
  const lines = contentToLines(article.contentJson);
  const fontPath = resolvePdfFontPath();

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      // Avoid pdfkit default "Helvetica" load, which requires AFM files in server chunks.
      font: ""
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    (async () => {
      try {
        doc.font(fontPath).fontSize(26).text(article.title);
        doc.moveDown(0.4);

        doc
          .font(fontPath)
          .fontSize(11)
          .fillColor("#4f5a4d")
          .text(`${article.category.name} | ${formatPublishDate(article.publishAt)}`);

        if (article.tags.length) {
          doc
            .moveDown(0.3)
            .font(fontPath)
            .fontSize(10)
            .fillColor("#4f5a4d")
            .text(article.tags.map((tag) => `#${tag.name}`).join("  "));
        }

        if (article.excerpt) {
          doc
            .moveDown(0.7)
            .font(fontPath)
            .fontSize(13)
            .fillColor("#1f281f")
            .text(article.excerpt);
        }

        doc.moveDown(0.8);

        for (const line of lines) {
          if (line.style === "image") {
            await renderImageLine(doc, fontPath, line);
            continue;
          }

          const prefix = line.indent ? "  ".repeat(Math.max(0, line.indent)) : "";
          const text = line.text ?? "";

          switch (line.style) {
            case "heading1":
              doc.moveDown(0.8).font(fontPath).fontSize(20).fillColor("#1f281f").text(`${prefix}${text}`);
              break;
            case "heading2":
              doc.moveDown(0.7).font(fontPath).fontSize(17).fillColor("#1f281f").text(`${prefix}${text}`);
              break;
            case "heading3":
              doc.moveDown(0.6).font(fontPath).fontSize(15).fillColor("#1f281f").text(`${prefix}${text}`);
              break;
            case "list":
              doc.moveDown(0.2).font(fontPath).fontSize(12).fillColor("#1f281f").text(`${prefix}${text}`);
              break;
            case "code":
              doc.moveDown(0.4).font(fontPath).fontSize(11).fillColor("#1f281f").text(`${prefix}${text}`);
              break;
            case "blockquote":
              doc.moveDown(0.3).font(fontPath).fontSize(12).fillColor("#364335").text(`${prefix}${text}`);
              break;
            default:
              doc.moveDown(0.25).font(fontPath).fontSize(12).fillColor("#1f281f").text(`${prefix}${text}`);
          }
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    })();
  });
}
