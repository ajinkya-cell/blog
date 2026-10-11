import { SanityImage } from "@workspace/sanity-blocks/internal/sanity-image";
import { cn } from "@workspace/tailwind-config/utils";
import Link from "next/link";

import { getBlogCategoryLabel } from "@/lib/blog-categories";
import type { Blog } from "@/types";
import { formatDate } from "@/utils";

type BlogCardProps = {
  blog: Blog;
};

function BlogDate({
  publishedAt,
  className,
}: Readonly<{
  publishedAt: string | null;
  className?: string;
}>) {
  const formatted = formatDate(publishedAt);

  if (!formatted) {
    return null;
  }

  return (
    <time
      className={cn("text-xs text-muted-foreground", className)}
      dateTime={publishedAt ?? ""}
    >
      {formatted}
    </time>
  );
}

function BlogCategoryTag({ category }: Readonly<{ category?: string | null }>) {
  const label = getBlogCategoryLabel(category);

  if (!label) {
    return null;
  }

  return (
    <span className="rounded border border-foreground/10 bg-foreground/[0.03] px-2 py-0.5 text-[10px] text-muted-foreground uppercase tracking-wider">
      {label}
    </span>
  );
}

function BlogMeta({
  publishedAt,
  category,
  readTime,
}: Readonly<{
  publishedAt: string | null;
  category?: string | null;
  readTime?: number | null;
}>) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <BlogCategoryTag category={category} />
      <BlogDate publishedAt={publishedAt} />
      {readTime ? <span>· {readTime} min read</span> : null}
    </div>
  );
}

export function FeaturedBlogCard({ blog }: BlogCardProps) {
  const { title, publishedAt, slug, description, image, category, readTime } =
    blog ?? {};

  return (
    <article className="site-chassis group relative grid grid-cols-1 overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 lg:grid-cols-2">
      <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-foreground/10 bg-foreground/5 px-2.5 py-0.5 text-[10px] text-foreground/80">
          <span className="size-1.5 rounded-full bg-foreground/60" />
          <span>Featured Essay</span>
        </div>
        <div className="space-y-4">
          <BlogMeta
            category={category}
            publishedAt={publishedAt}
            readTime={readTime}
          />
          <h2 className="text-balance font-medium font-sans text-xl text-foreground tracking-tight sm:text-2xl lg:text-3xl">
            <Link className="outline-none" href={slug ?? "#"}>
              <span className="absolute inset-0 z-10" />
              {title}
            </Link>
          </h2>
          {description ? (
            <p className="line-clamp-3 text-muted-foreground text-xs sm:text-sm leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {image?.id ? (
        <div className="relative order-first min-h-60 w-full shrink-0 p-3 lg:order-last lg:min-h-full">
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-muted/20">
            <SanityImage
              alt={title ?? "Featured post"}
              className="size-full object-cover grayscale contrast-[1.08] brightness-[0.78] transition-all duration-300 group-hover:scale-[1.02] group-hover:grayscale-0 group-hover:brightness-95"
              height={600}
              image={image}
              sizes="(min-width: 1440px) 700px, (min-width: 1024px) calc((100vw - 40px) / 2), calc(100vw - 40px)"
              width={800}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#151515] lg:hidden"
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function BlogCard({ blog }: BlogCardProps) {
  if (!blog) {
    return null;
  }

  const { title, publishedAt, slug, image, readTime } = blog;

  return (
    <article className="site-chassis group relative flex flex-col justify-between overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1">
      <div>
        {/* Image — padded inside card */}
        {image?.id ? (
          <div className="relative h-[240px] w-full shrink-0 px-3 pt-3">
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-muted/20">
              <SanityImage
                alt={title ?? "Blog post"}
                className="size-full object-cover grayscale contrast-[1.08] brightness-[0.78] transition-all duration-300 group-hover:scale-[1.02] group-hover:grayscale-0 group-hover:brightness-95"
                height={390}
                image={image}
                sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                width={520}
              />
              {/* Fade into solid card body */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#151515] dark:to-[#151515]"
              />
            </div>
          </div>
        ) : null}

        {/* Card body */}
        <div className="relative flex flex-1 flex-col justify-between p-5 pt-4 pb-7 sm:p-6 sm:pt-4 sm:pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <BlogDate className="text-[11px]" publishedAt={publishedAt} />
              {publishedAt && readTime ? (
                <span aria-hidden="true">·</span>
              ) : null}
              {readTime ? <span>{readTime} min read</span> : null}
            </div>
            <h3 className="line-clamp-3 font-instrument-serif text-[22px] text-foreground leading-[1.15] sm:text-2xl">
              <Link className="outline-none" href={slug ?? "#"}>
                <span className="absolute inset-0 z-10" />
                {title}
              </Link>
            </h3>
          </div>
        </div>
      </div>
    </article>
  );
}

export function BlogHeader({
  title,
  description,
}: {
  title: string | null;
  description: string | null;
}) {
  return (
    <div className="grid gap-2 sm:gap-3">
      <h1 className="text-balance font-semibold font-sans text-2xl text-foreground tracking-tight sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-muted-foreground text-xs sm:text-sm leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
