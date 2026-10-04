import {
  buttonsToMarkdown,
  eyebrowToMarkdown,
  joinSections,
  type MarkdownBlock,
  type MarkdownOptions,
} from "../internal/markdown";
import { portableTextToMarkdown } from "../internal/portable-text-to-markdown";

export function personalHeroToMarkdown(
  block: MarkdownBlock,
  options: MarkdownOptions
): string {
  return joinSections([
    eyebrowToMarkdown(block.statusPill),
    block.greeting?.trim() ? `# ${block.greeting.trim()}` : "",
    typeof block.tagline === "string" && block.tagline.trim()
      ? `*${block.tagline.trim()}*`
      : "",
    portableTextToMarkdown(block.bio, options),
    buttonsToMarkdown(block.buttons, options),
  ]);
}
