import { Logger } from "@workspace/logger";
import {
  DRAFTS_WITHOUT_SESSION,
  type DynamicFetchOptions,
  getDynamicFetchOptions,
  resolvePageFetchOptions,
  sanityFetch,
  sanityFetchMetadata,
  sanityFetchStaticParams,
} from "@workspace/sanity/live";
import {
  queryAllBlogSlugsAndTitles,
  queryBlogPaths,
  queryBlogSlugPageData,
} from "@workspace/sanity/query";
import {
  RichText,
  type RichTextValue,
} from "@workspace/sanity-blocks/internal/rich-text";
import { SanityImage } from "@workspace/sanity-blocks/internal/sanity-image";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { BreadcrumbsJsonLd } from "@/components/breadcrumbs";
import { FloatingTableOfContent } from "@/components/elements/table-of-content";
import { ArticleJsonLd } from "@/components/json-ld";
import {
  PostNavigation,
  type PostLinkItem,
} from "@/components/post-navigation";
import { seoFromDocument } from "@/lib/seo";
import { estimateReadingTime, formatDate, PLACEHOLDER_SLUG } from "@/utils";

const logger = new Logger("BlogSlug");

type BlogParams = { slug: string };

export async function generateStaticParams() {
  try {
    const { data: slugs } = await sanityFetchStaticParams({
      query: queryBlogPaths,
    });

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return [{ slug: PLACEHOLDER_SLUG }];
    }

    const paths: BlogParams[] = [];
    for (const slug of slugs) {
      if (!slug) {
        continue;
      }
      const [, , path] = slug.split("/");
      if (path) {
        paths.push({ slug: path });
      }
    }
    return paths;
  } catch (error) {
    logger.error("Error fetching blog paths", error);
    return [{ slug: PLACEHOLDER_SLUG }];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<BlogParams>;
}): Promise<Metadata> {
  const [{ slug }, { perspective }] = await Promise.all([
    params,
    getDynamicFetchOptions(),
  ]);
  const slugString = `/blog/${slug}`;
  const { data } = await sanityFetchMetadata({
    query: queryBlogSlugPageData,
    params: { slug: slugString },
    perspective,
  });
  return seoFromDocument(data, { slug: slugString, pageType: "article" });
}

export default async function BlogSlugPage({
  params,
}: Readonly<{
  params: Promise<BlogParams>;
}>) {
  const { isEnabled: isDraftMode } = await draftMode();

  if (isDraftMode || DRAFTS_WITHOUT_SESSION) {
    return <BlogSlugInner params={params} />;
  }

  const { slug } = await params;
  const slugString = `/blog/${slug}`;
  const [data, adjacent] = await Promise.all([
    getPublishedBlogPage(slug),
    getAdjacentPosts(slugString),
  ]);
  if (!data) {
    notFound();
  }
  return <BlogPageContent adjacent={adjacent} data={data} />;
}

async function getAdjacentPosts(currentSlug: string): Promise<{
  previous: PostLinkItem;
  next: PostLinkItem;
}> {
  "use cache";
  const { data: allPosts } = await sanityFetch({
    query: queryAllBlogSlugsAndTitles,
    perspective: "published",
    stega: false,
  });
  if (!allPosts || allPosts.length === 0) {
    return { previous: null, next: null };
  }
  const currentIndex = allPosts.findIndex((p) => p.slug === currentSlug);
  return {
    previous: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
    next:
      currentIndex >= 0 && currentIndex < allPosts.length - 1
        ? allPosts[currentIndex + 1]
        : null,
  };
}

async function getPublishedBlogPage(slug: string) {
  "use cache";
  const slugString = `/blog/${slug}`;
  const { data } = await sanityFetch({
    query: queryBlogSlugPageData,
    params: { slug: slugString },
    perspective: "published",
    stega: false,
  });
  return data;
}

type BlogPageData = NonNullable<
  Awaited<ReturnType<typeof getPublishedBlogPage>>
>;

async function BlogSlugInner({
  params,
}: Readonly<{ params: Promise<BlogParams> }>) {
  const [{ slug }, { perspective, stega }] = await Promise.all([
    params,
    resolvePageFetchOptions(),
  ]);
  const slugString = `/blog/${slug}`;
  const [data, adjacent] = await Promise.all([
    getDraftBlogPage({ slug, perspective, stega }),
    getAdjacentPosts(slugString),
  ]);
  if (!data) {
    notFound();
  }
  return <BlogPageContent adjacent={adjacent} data={data} />;
}

async function getDraftBlogPage({
  slug,
  perspective,
  stega,
}: BlogParams & DynamicFetchOptions) {
  "use cache";
  const slugString = `/blog/${slug}`;
  const { data } = await sanityFetch({
    query: queryBlogSlugPageData,
    params: { slug: slugString },
    perspective,
    stega,
  });
  return data;
}

function BlogPageContent({
  data,
  adjacent,
}: Readonly<{
  data: BlogPageData;
  adjacent?: { previous: PostLinkItem; next: PostLinkItem };
}>) {
  const { title, richText, publishedAt, _updatedAt, tags, readTime, image } =
    data ?? {};
  const author = data?.authors;
  const publishedDate = formatDate(publishedAt);
  const updatedDate = formatDate(_updatedAt);
  const estimatedMinutes = readTime ?? estimateReadingTime(richText);

  return (
    <main className="bg-background font-sans text-foreground antialiased">
      <ArticleJsonLd article={data} />
      <BreadcrumbsJsonLd
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: title },
        ]}
      />

      <div className="container max-w-4xl pt-8 pb-8 sm:pt-12 md:pb-12">
        {/* Top Featured Hero Image with Bottom Fade */}
        {image?.id ? (
          <div className="relative mx-auto mb-10 w-full overflow-hidden rounded-2xl border border-border/40 shadow-sm sm:mb-12 sm:rounded-3xl">
            <div className="relative aspect-[16/9] w-full sm:aspect-[21/9] md:h-[420px]">
              <SanityImage
                alt={image?.alt || title || "Featured image"}
                className="h-full w-full object-cover"
                height={840}
                image={image}
                sizes="(min-width: 1024px) 896px, 100vw"
                width={1680}
              />
              {/* Bottom gradient fade blending into page background */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
            </div>
          </div>
        ) : null}

        {/* Centered Blog Header */}
        <header className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center font-sans">
          {tags && tags.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {tags.map((tag) => (
                <span
                  className="rounded-full border border-border/60 bg-muted/60 px-3 py-0.5 text-muted-foreground text-xs"
                  key={tag}
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <h1 className="text-balance font-sans font-semibold text-3xl tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[2.75rem] lg:leading-[1.15]">
            {title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-2 text-sm text-muted-foreground">
            {author?.name ? (
              <div className="flex items-center gap-2.5">
                {author.image?.id ? (
                  <span className="inline-block size-7 overflow-hidden rounded-full ring-1 ring-border">
                    <SanityImage
                      alt={author.name}
                      className="size-7 rounded-full object-cover"
                      height={28}
                      image={author.image}
                      sizes="28px"
                      width={28}
                    />
                  </span>
                ) : (
                  <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs">
                    {author.name.charAt(0)}
                  </span>
                )}
                <span className="font-medium text-foreground text-sm">
                  {author.name}
                </span>
              </div>
            ) : null}

            {publishedDate ? (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Published:</span>
                <span className="text-foreground/90">{publishedDate}</span>
              </div>
            ) : null}

            {updatedDate && updatedDate !== publishedDate ? (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Updated:</span>
                <span className="text-foreground/90">{updatedDate}</span>
              </div>
            ) : null}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Read time:</span>
              <span className="text-foreground/90">{estimatedMinutes} min</span>
            </div>
          </div>
        </header>

        {/* Centered Blog Article — the table of contents floats bottom-right */}
        <FloatingTableOfContent richText={richText ?? []} />
        <div className="mx-auto mt-10 flex w-full max-w-3xl flex-col gap-10 sm:mt-12">
          {/* Main Article Content */}
          <article className="min-w-0 font-sans">
            <RichText
              className="prose-lg font-sans prose-p:my-0 prose-p:leading-7 prose-p:tracking-[0.013em] prose-li:leading-7 [&>p+p]:mt-8"
              richText={richText as RichTextValue}
            />

            <div className="mt-12 border-border border-t pt-8">
              <PostNavigation
                next={adjacent?.next}
                previous={adjacent?.previous}
              />
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
