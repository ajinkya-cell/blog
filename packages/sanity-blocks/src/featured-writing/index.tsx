import { BlockHeader } from "@workspace/sanity-blocks/internal/block-header";
import type { SanityImageData } from "@workspace/sanity-blocks/internal/sanity-image";
import { cn } from "@workspace/tailwind-config/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export interface FeaturedPostItem {
  _id: string;
  authors?: {
    avatar?: SanityImageData | null;
    name?: string | null;
  } | null;
  category?: string | null;
  description?: string | null;
  image?: SanityImageData | null;
  publishedAt?: string | null;
  readTime?: number | null;
  slug?: string | null;
  title: string;
}

export interface FeaturedWritingProps {
  className?: string;
  dataSanity?: string;
  description?: string | null;
  eyebrow?: string | null;
  posts?: FeaturedPostItem[] | null;
  title?: string | null;
  viewAllHref?: string | null;
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function FeaturedWriting({
  eyebrow,
  title,
  description,
  posts,
  viewAllHref,
  className,
  dataSanity,
}: Readonly<FeaturedWritingProps>) {
  if (!posts || posts.length === 0) return null;

  return (
    <section
      className={cn(
        "border-border/60 border-b bg-background py-16 md:py-24",
        className
      )}
      data-sanity={dataSanity}
    >
      <div className="container max-w-5xl">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <BlockHeader
              eyebrow={eyebrow ?? "Writing"}
              title={title ?? "Selected Essays"}
            >
              {description ? (
                <p className="max-w-2xl text-muted-foreground text-sm">
                  {description}
                </p>
              ) : null}
            </BlockHeader>
          </div>
          {viewAllHref ? (
            <Link
              className="focus-ring inline-flex w-fit items-center gap-1 font-mono text-muted-foreground text-sm hover:text-foreground"
              href={viewAllHref}
            >
              <span>All essays</span>
              <ArrowUpRight className="size-4" />
            </Link>
          ) : null}
        </div>

        <div className="divide-y divide-border/60 border-y border-border/60">
          {posts.map((post) => {
            const href = post.slug ?? `/blog/${post._id}`;
            const formattedDate = formatDate(post.publishedAt);

            return (
              <article
                className="group relative flex flex-col justify-between gap-3 py-6 transition-colors hover:bg-muted/30 sm:flex-row sm:items-baseline sm:gap-8 sm:px-4"
                key={post._id}
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    {post.category ? (
                      <span className="font-mono text-muted-foreground uppercase tracking-wider">
                        {post.category}
                      </span>
                    ) : null}
                    {post.category && post.readTime ? (
                      <span className="text-muted-foreground/60">•</span>
                    ) : null}
                    {post.readTime ? (
                      <span className="font-mono text-muted-foreground">
                        {post.readTime} min read
                      </span>
                    ) : null}
                  </div>

                  <h3 className="font-medium text-foreground text-xl tracking-tight transition-colors group-hover:text-primary">
                    <Link className="focus-ring outline-none" href={href}>
                      <span className="absolute inset-0 z-10" />
                      {post.title}
                    </Link>
                  </h3>

                  {post.description ? (
                    <p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
                      {post.description}
                    </p>
                  ) : null}
                </div>

                {formattedDate ? (
                  <time
                    className="shrink-0 font-mono text-muted-foreground text-xs sm:text-right"
                    dateTime={post.publishedAt ?? ""}
                  >
                    {formattedDate}
                  </time>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
