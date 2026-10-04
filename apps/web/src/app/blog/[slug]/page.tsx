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

import { AuthorBioCard } from "@/components/author-bio-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  MobileTableOfContent,
  TableOfContent,
} from "@/components/elements/table-of-content";
import { ArticleJsonLd } from "@/components/json-ld";
import { PostNavigation, type PostLinkItem } from "@/components/post-navigation";
import { ReadingProgress } from "@/components/reading-progress";
import { seoFromDocument } from "@/lib/seo";
import {
  estimateReadingTime,
  formatDate,
  getBaseUrl,
  PLACEHOLDER_SLUG,
} from "@/utils";

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
  const { title, richText, publishedAt, _updatedAt, tags, readTime } = data ?? {};
  const author = data?.authors;
  const publishedDate = formatDate(publishedAt);
  const updatedDate = formatDate(_updatedAt);
  const estimatedMinutes = readTime ?? estimateReadingTime(richText);
  const shareUrl = data?.slug ? `${getBaseUrl()}${data.slug}` : undefined;

  return (
    <main className="bg-background">
      <ReadingProgress />
      <ArticleJsonLd article={data} />
      <Breadcrumbs
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: title },
        ]}
      />
      <div className="container flex flex-col gap-16 pt-12 pb-24 md:gap-24 md:pt-16">
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            {tags && tags.length > 0
              ? tags.map((tag) => (
                  <span
                    className="border border-border bg-muted/50 px-2 py-0.5 font-mono text-muted-foreground text-xs"
                    key={tag}
                  >
                    #{tag}
                  </span>
                ))
              : null}
          </div>

          <h1 className="text-balance font-normal text-4xl tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.1]">
            {title}
          </h1>

          <div className="flex flex-col gap-4">
            <dl className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
              {publishedDate && (
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground">Published:</dt>
                  <dd className="text-foreground/90">{publishedDate}</dd>
                </div>
              )}
              {updatedDate && updatedDate !== publishedDate && (
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground">Updated:</dt>
                  <dd className="text-foreground/90">{updatedDate}</dd>
                </div>
              )}
              <div className="flex gap-1.5 font-mono text-muted-foreground text-xs">
                <dt>Read time:</dt>
                <dd className="text-foreground/90">{estimatedMinutes} min</dd>
              </div>
            </dl>

            {author?.name && (
              <div className="flex items-center gap-2 pt-2">
                {author.image?.id ? (
                  <span className="inline-block size-7 overflow-hidden rounded-full">
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
                  <span className="flex size-7 items-center justify-center rounded-full bg-muted font-mono text-xs">
                    {author.name.charAt(0)}
                  </span>
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-foreground text-sm">
                    {author.name}
                  </span>
                  {author.position ? (
                    <span className="text-muted-foreground text-xs">
                      {author.position}
                    </span>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-32">
          <article className="min-w-0">
            <MobileTableOfContent
              className="mb-12"
              richText={richText ?? []}
              shareTitle={title}
              shareUrl={shareUrl}
            />
            <RichText
              className="prose-lg prose-p:my-0 prose-p:leading-7 prose-p:tracking-[0.013em] prose-li:leading-7 [&>p+p]:mt-8 [&_blockquote]:border-none [&_blockquote]:bg-grid-dots [&_blockquote]:p-4 [&_blockquote]:font-normal [&_blockquote]:not-italic [&_blockquote]:text-zinc-800 dark:[&_blockquote]:text-zinc-50 [&_blockquote_p]:my-0 [&_blockquote_p]:bg-background [&_blockquote_p]:p-8 [&_blockquote_p]:text-lg [&_blockquote_p]:text-muted-foreground [&_blockquote_p]:leading-7 [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none [&_blockquote_strong]:font-normal [&_blockquote_strong]:text-foreground"
              richText={richText as RichTextValue}
            />

            <div className="mt-16 border-border border-t pt-12">
              <AuthorBioCard author={author} />
            </div>

            <div className="mt-12">
              <PostNavigation
                next={adjacent?.next}
                previous={adjacent?.previous}
              />
            </div>
          </article>

          <div className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContent
                richText={richText ?? []}
                shareTitle={title}
                shareUrl={shareUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
