/** Thin dispatcher: each block's Markdown serializer is co-located in its block
 * directory (add a `case` + `markdown.ts` for new blocks). Unknown types return "". */

import { calloutQuoteToMarkdown } from "../callout-quote/markdown";
import { ctaToMarkdown } from "../cta/markdown";
import { featuredWritingToMarkdown } from "../featured-writing/markdown";
import { heroToMarkdown } from "../hero/markdown";
import type { MarkdownBlock, MarkdownOptions } from "../internal/markdown";
import { personalHeroToMarkdown } from "../personal-hero/markdown";
import { projectShowcaseToMarkdown } from "../project-showcase/markdown";
import { richTextBlockToMarkdown } from "../rich-text-block/markdown";
import { showcaseGridToMarkdown } from "../showcase-grid/markdown";
import { socialGridToMarkdown } from "../social-grid/markdown";
import { subscribeNewsletterToMarkdown } from "../subscribe-newsletter/markdown";

export { imageToMarkdown } from "./markdown";
export type { MarkdownBlock };

function blockToMarkdown(
  block: MarkdownBlock,
  options: MarkdownOptions
): string {
  switch (block?._type) {
    case "personalHero":
      return personalHeroToMarkdown(block, options);
    case "featuredWriting":
      return featuredWritingToMarkdown(block, options);
    case "projectShowcase":
      return projectShowcaseToMarkdown(block, options);
    case "calloutQuote":
      return calloutQuoteToMarkdown(block, options);
    case "hero":
      return heroToMarkdown(block, options);
    case "cta":
      return ctaToMarkdown(block, options);
    case "richTextBlock":
      return richTextBlockToMarkdown(block, options);
    case "socialGrid":
      return socialGridToMarkdown(block, options);
    case "showcaseGrid":
      return showcaseGridToMarkdown(block, options);
    case "subscribeNewsletter":
      return subscribeNewsletterToMarkdown(block, options);
    default:
      return "";
  }
}

export function pageBuilderToMarkdown(
  blocks: MarkdownBlock[] | null | undefined,
  options: MarkdownOptions = {}
): string {
  if (!Array.isArray(blocks)) {
    return "";
  }

  return blocks
    .map((block) => blockToMarkdown(block, options))
    .filter((markdown) => markdown.trim())
    .join("\n\n");
}
