import type { MarkdownBlock, MarkdownOptions } from "../internal/markdown";

export function calloutQuoteToMarkdown(
  block: MarkdownBlock,
  _options: MarkdownOptions
): string {
  if (!block.quote) return "";

  const lines = [String(block.quote).trim()];
  const citationParts = [block.author, block.source].filter(Boolean);
  if (citationParts.length > 0) {
    lines.push(`— ${citationParts.join(", ")}`);
  }

  return lines.map((line) => `> ${line}`).join("\n>\n");
}
