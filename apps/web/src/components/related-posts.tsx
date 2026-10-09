import { BlogCard } from "@/components/blog-card";
import type { Blog } from "@/types";

export interface RelatedPostsProps {
  // biome-ignore lint/suspicious/noExplicitAny: projected blogCardFragment shape
  posts?: any[] | null;
}

export function RelatedPosts({ posts }: Readonly<RelatedPostsProps>) {
  if (!posts || posts.length === 0) {
    return null;
  }

  // Filter out any null or unresolvable references
  const validPosts = posts.filter((post): post is Blog =>
    Boolean(post?.title && post?.slug)
  );

  if (validPosts.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-writing-heading"
      className="flex flex-col gap-6"
    >
      <div className="flex items-center gap-3">
        <h2
          className="font-mono text-muted-foreground text-xs uppercase tracking-wider"
          id="related-writing-heading"
        >
          Related Writing
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {validPosts.map((post) => (
          <BlogCard blog={post} key={post._id ?? post.slug} />
        ))}
      </div>
    </section>
  );
}
