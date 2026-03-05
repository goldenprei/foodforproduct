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
  text: string;
  style: "paragraph" | "heading1" | "heading2" | "heading3" | "list" | "code" | "blockquote";
  indent?: number;
};

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
      pushLine(lines, `[${alt}] ${src}`.trim(), "blockquote", indent);
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

export async function buildArticlePdfBuffer(article: PrintableArticle): Promise<Buffer> {
  const lines = contentToLines(article.contentJson);

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "A4",
      margin: 50
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.font("Helvetica-Bold").fontSize(26).text(article.title);
    doc.moveDown(0.4);

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#4f5a4d")
      .text(`${article.category.name} | ${formatPublishDate(article.publishAt)}`);

    if (article.tags.length) {
      doc
        .moveDown(0.3)
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#4f5a4d")
        .text(article.tags.map((tag) => `#${tag.name}`).join("  "));
    }

    if (article.excerpt) {
      doc
        .moveDown(0.7)
        .font("Helvetica-Oblique")
        .fontSize(13)
        .fillColor("#1f281f")
        .text(article.excerpt);
    }

    doc.moveDown(0.8);

    for (const line of lines) {
      const prefix = line.indent ? "  ".repeat(Math.max(0, line.indent)) : "";

      switch (line.style) {
        case "heading1":
          doc.moveDown(0.8).font("Helvetica-Bold").fontSize(20).fillColor("#1f281f").text(`${prefix}${line.text}`);
          break;
        case "heading2":
          doc.moveDown(0.7).font("Helvetica-Bold").fontSize(17).fillColor("#1f281f").text(`${prefix}${line.text}`);
          break;
        case "heading3":
          doc.moveDown(0.6).font("Helvetica-Bold").fontSize(15).fillColor("#1f281f").text(`${prefix}${line.text}`);
          break;
        case "list":
          doc.moveDown(0.2).font("Helvetica").fontSize(12).fillColor("#1f281f").text(`${prefix}${line.text}`);
          break;
        case "code":
          doc.moveDown(0.4).font("Courier").fontSize(11).fillColor("#1f281f").text(`${prefix}${line.text}`);
          break;
        case "blockquote":
          doc
            .moveDown(0.3)
            .font("Helvetica-Oblique")
            .fontSize(12)
            .fillColor("#364335")
            .text(`${prefix}${line.text}`);
          break;
        default:
          doc.moveDown(0.25).font("Helvetica").fontSize(12).fillColor("#1f281f").text(`${prefix}${line.text}`);
      }
    }

    doc.end();
  });
}
