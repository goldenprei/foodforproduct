import katex from "katex";

function renderFormula(formula: string, displayMode: boolean): string {
  try {
    return katex.renderToString(formula.trim(), {
      throwOnError: false,
      displayMode
    });
  } catch {
    return formula;
  }
}

export function renderMathInHtml(html: string): string {
  const withBlockMath = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, formula: string) => {
    return `<div class="math-block">${renderFormula(formula, true)}</div>`;
  });

  return withBlockMath.replace(/(^|[^$])\$([^$\n]+?)\$/g, (_, prefix: string, formula: string) => {
    return `${prefix}<span class="math-inline">${renderFormula(formula, false)}</span>`;
  });
}
