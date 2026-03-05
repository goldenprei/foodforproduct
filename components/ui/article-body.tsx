import { contentJsonToHtml } from "@/lib/content/render";

type Props = {
  contentHtml?: string | null;
  contentJson: Record<string, unknown>;
};

export function ArticleBody({ contentHtml, contentJson }: Props) {
  const html = contentHtml || contentJsonToHtml(contentJson);

  return <div className="article-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
