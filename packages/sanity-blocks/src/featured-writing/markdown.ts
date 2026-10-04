import {
  eyebrowToMarkdown,
  headingToMarkdown,
  joinSections,
  type MarkdownBlock,
  type MarkdownOptions,
} from "../internal/markdown";

interface PostItem {
  category?: string;
  description?: string;
  publishedAt?: string;
  readTime?: number;
  slug?: string;
  title: string;
}

export function featuredWritingToMarkdown(
  block: MarkdownBlock,
  _options: MarkdownOptions
): string {
  const posts = (block.posts as PostItem[]) ?? [];

  const postsMarkdown = posts
    .map((post) => {
      const parts: string[] = [];
      const header = post.slug
        ? `### [${post.title}](${post.slug})`
        : headingToMarkdown(post.title, 3);
      parts.push(header);
      const meta = [
        post.category ? `Category: ${post.category}` : null,
        post.readTime ? `${post.readTime} min read` : null,
        post.publishedAt ? `Published: ${post.publishedAt}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      if (meta) parts.push(`*${meta}*`);
      if (post.description) parts.push(post.description);
      return parts.join("\n\n");
    })
    .join("\n\n");

  return joinSections([
    eyebrowToMarkdown(block.eyebrow),
    headingToMarkdown(block.title, 2),
    block.description ? String(block.description) : "",
    postsMarkdown,
  ]);
}
