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
        "relative overflow-hidden border-border/40 border-b py-16 md:py-24",
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
              className="popout-btn-inactive inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-1.5 text-foreground/80 text-xs transition-all hover:text-white"
              href={viewAllHref}
            >
              <span>All essays</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          {posts.map((post) => {
            const href = post.slug ?? `/blog/${post._id}`;
            const formattedDate = formatDate(post.publishedAt);

            return (
              <article
                className="site-chassis group relative flex flex-col justify-between gap-3 overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 sm:flex-row sm:items-center sm:gap-8 sm:px-6"
                key={post._id}
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    {post.category ? (
                      <span className="recessed-well rounded-md px-2 py-0.5 text-[10px] text-muted-foreground uppercase tracking-wider">
                        {post.category}
                      </span>
                    ) : null}
                    {post.category && post.readTime ? (
                      <span className="text-muted-foreground/40">•</span>
                    ) : null}
                    {post.readTime ? (
                      <span className="text-[11px] text-muted-foreground">
                        {post.readTime} min read
                      </span>
                    ) : null}
                  </div>

                  <h3 className="font-medium text-foreground text-base tracking-tight transition-colors group-hover:text-white sm:text-lg">
                    <Link className="focus-ring outline-none" href={href}>
                      <span className="absolute inset-0 z-10" />
                      {post.title}
                    </Link>
                  </h3>

                  {post.description ? (
                    <p className="line-clamp-2 text-muted-foreground text-xs sm:text-sm leading-relaxed">
                      {post.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {formattedDate ? (
                    <time
                      className="text-[11px] text-muted-foreground sm:text-right"
                      dateTime={post.publishedAt ?? ""}
                    >
                      {formattedDate}
                    </time>
                  ) : null}
                  <div className="grid size-8 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-muted-foreground transition-colors group-hover:border-white/20 group-hover:text-white">
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
