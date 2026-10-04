import {
  eyebrowToMarkdown,
  headingToMarkdown,
  joinSections,
  type MarkdownBlock,
  type MarkdownOptions,
} from "../internal/markdown";

interface ProjectItem {
  category?: string;
  description?: string;
  githubUrl?: string;
  liveUrl?: string;
  title: string;
  year?: string;
}

export function projectShowcaseToMarkdown(
  block: MarkdownBlock,
  _options: MarkdownOptions
): string {
  const items = (block.items as ProjectItem[]) ?? [];

  const itemsMarkdown = items
    .map((item) => {
      const parts: string[] = [];
      const header = item.year ? `${item.title} (${item.year})` : item.title;
      parts.push(headingToMarkdown(header, 3));
      if (item.category) parts.push(`*Category: ${item.category}*`);
      if (item.description) parts.push(item.description);
      if (item.liveUrl) parts.push(`[Live Site](${item.liveUrl})`);
      if (item.githubUrl) parts.push(`[Source Code](${item.githubUrl})`);
      return parts.join("\n\n");
    })
    .join("\n\n");

  return joinSections([
    eyebrowToMarkdown(block.eyebrow),
    headingToMarkdown(block.title, 2),
    block.description ? String(block.description) : "",
    itemsMarkdown,
  ]);
}
