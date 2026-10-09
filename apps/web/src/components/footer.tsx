import {
  type DynamicFetchOptions,
  getDynamicFetchOptions,
  sanityFetch,
} from "@workspace/sanity/live";
import {
  queryFooterData,
  queryRecentThreeBlogs,
} from "@workspace/sanity/query";
import type {
  QueryFooterDataResult,
  QueryGlobalSeoSettingsResult,
  QueryRecentThreeBlogsResult,
} from "@workspace/sanity/types";
import {
  FacebookIcon,
  GithubIcon,
  InstagramBrandIcon,
  LinkedinBrandIcon,
  RedditBrandIcon,
  XBrandIcon,
  YoutubeIcon,
} from "@workspace/sanity-blocks/internal/icons";
import { normalizedLogoHeight } from "@workspace/sanity-blocks/internal/logo-height";
import { SanityImage } from "@workspace/sanity-blocks/internal/sanity-image";
import Link from "next/link";
import { Fragment } from "react";

import { FooterThemeToggle } from "@/components/footer-theme-toggle";
import { BLOG_CATEGORIES } from "@/lib/blog-categories";
import { getGlobalSettings } from "@/lib/navigation";
import { formatDate } from "@/utils";

type SocialLinksProps = {
  data: NonNullable<QueryGlobalSeoSettingsResult>["socialLinks"];
};

type FooterProps = {
  data: NonNullable<QueryFooterDataResult>;
  latestPost: QueryRecentThreeBlogsResult[number] | null;
  settingsData: NonNullable<QueryGlobalSeoSettingsResult>;
};

type FooterLink = {
  key: string;
  name: string;
  href: string;
  newTab?: boolean;
};

// Category shortcuts; skips the "All" entry, which has an empty value.
const TOPIC_LINKS: FooterLink[] = BLOG_CATEGORIES.filter(
  (category) => category.value
).map((category) => ({
  key: category.value,
  name: category.label,
  href: `/blog?category=${category.value}`,
}));

export async function DynamicFooter() {
  const { perspective, stega } = await getDynamicFetchOptions();
  return <CachedFooter perspective={perspective} stega={stega} />;
}

export async function CachedFooter({
  perspective,
  stega,
}: DynamicFetchOptions) {
  "use cache";
  const [response, settingsData, recentPosts] = await Promise.all([
    sanityFetch({ query: queryFooterData, perspective, stega }),
    getGlobalSettings({ perspective, stega }),
    sanityFetch({ query: queryRecentThreeBlogs, perspective, stega }),
  ]);

  if (!(response?.data && settingsData)) {
    return null;
  }
  return (
    <Footer
      data={response.data}
      latestPost={recentPosts?.data?.[0] ?? null}
      settingsData={settingsData}
    />
  );
}

function SocialLinks({ data }: Readonly<SocialLinksProps>) {
  if (!data) {
    return null;
  }

  const { facebook, twitter, instagram, youtube, linkedin, reddit, github } =
    data;

  const socialLinks = [
    {
      url: github || "https://github.com/ajinkya-cell",
      Icon: GithubIcon,
      label: "GitHub",
    },
    { url: twitter, Icon: XBrandIcon, label: "Twitter/X" },
    { url: linkedin, Icon: LinkedinBrandIcon, label: "LinkedIn" },
    { url: instagram, Icon: InstagramBrandIcon, label: "Instagram" },
    { url: youtube, Icon: YoutubeIcon, label: "YouTube" },
    { url: reddit, Icon: RedditBrandIcon, label: "Reddit" },
    { url: facebook, Icon: FacebookIcon, label: "Facebook" },
  ].filter((link) => Boolean(link.url));

  return (
    <div className="flex items-center gap-2">
      {socialLinks.map(({ url, Icon, label }) => (
        <a
          aria-label={label}
          className="flex size-8 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/[0.03] text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-foreground/[0.08] hover:text-foreground"
          href={url ?? "#"}
          key={label}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Icon className="size-4" />
        </a>
      ))}
    </div>
  );
}

function FooterLinkColumn({
  title,
  links,
}: Readonly<{ title: string; links: FooterLink[] }>) {
  if (links.length === 0) {
    return null;
  }
  return (
    <div className="grid content-start gap-3">
      <h3 className="font-mono text-[11px] text-muted-foreground/70 uppercase tracking-[0.18em]">
        {title}
      </h3>
      <ul className="grid gap-2">
        {links.map((link) => (
          <li key={link.key}>
            <Link
              className="group inline-flex text-foreground/75 text-sm transition-colors hover:text-foreground"
              href={link.href}
              rel={link.newTab ? "noopener noreferrer" : undefined}
              target={link.newTab ? "_blank" : undefined}
            >
              <span className="bg-[length:0%_1px] bg-[linear-gradient(currentColor,currentColor)] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
                {link.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LatestPost({ post }: Readonly<{ post: FooterProps["latestPost"] }>) {
  if (!post?.slug) {
    return null;
  }
  const date = formatDate(post.publishedAt);
  return (
    <Link
      className="group inline-flex w-fit max-w-full items-center gap-2.5 rounded-full border border-foreground/10 bg-foreground/[0.03] py-1 pr-3 pl-2 text-xs transition-colors hover:border-foreground/20"
      href={post.slug}
    >
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7577E6]/60 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-[#7577E6]" />
      </span>
      <span className="shrink-0 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
        Latest
      </span>
      <span className="truncate text-foreground/85 group-hover:text-foreground">
        {post.title}
      </span>
      {date ? (
        <span className="hidden shrink-0 font-mono text-[10px] text-muted-foreground sm:inline">
          {date}
        </span>
      ) : null}
    </Link>
  );
}

function Footer({ data, settingsData, latestPost }: Readonly<FooterProps>) {
  const { subtitle, columns, copyright, credits } = data;
  const { siteTitle, socialLinks } = settingsData;
  const year = new Date().getFullYear();
  const wordmark = (siteTitle ?? "Ajinkya").toLowerCase();

  const cmsColumns = (columns ?? [])
    .map((column) => ({
      key: column._key,
      title: column.title ?? "",
      links: (column.links ?? [])
        .filter((link) => Boolean(link.href && link.name))
        .map((link) => ({
          key: link._key,
          name: link.name ?? "",
          href: link.href ?? "#",
          newTab: Boolean(link.openInNewTab),
        })),
    }))
    .filter((column) => column.links.length > 0)
    .slice(0, 2);

  return (
    <footer className="relative mt-24 w-full overflow-hidden font-sans">
      <div
        aria-hidden="true"
        className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-foreground/15 to-transparent"
      />

      <div className="container relative max-w-6xl pt-16 pb-8 sm:pt-20">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Sign-off */}
          <div className="grid content-start gap-5">
            <p className="font-instrument-serif text-4xl text-foreground italic leading-none tracking-tight sm:text-5xl">
              Thanks for reading.
            </p>
            <p className="max-w-sm text-muted-foreground text-sm leading-relaxed">
              {subtitle ??
                "I write about systems, interfaces and the things I break along the way."}
            </p>
            <LatestPost post={latestPost} />
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterLinkColumn links={TOPIC_LINKS} title="Topics" />
            {cmsColumns.map((column) => (
              <FooterLinkColumn
                key={column.key}
                links={column.links}
                title={column.title}
              />
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-foreground/10 border-t pt-6 sm:flex-row">
          <div className="grid gap-1 text-center sm:text-left">
            <span className="font-mono text-[11px] text-muted-foreground">
              {copyright ?? `© ${year} ${siteTitle ?? "Ajinkya"}`}
            </span>

            {credits && credits.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground/70">
                {credits.map((item, index) => {
                  const logoHeight = normalizedLogoHeight(item.logo, {
                    base: 24,
                    min: 10,
                    max: 16,
                  });
                  return (
                    <Fragment key={item._key || index}>
                      {index > 0 && <span>•</span>}
                      {item.url ? (
                        <a
                          className="hover:text-foreground"
                          href={item.url}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <span>{item.label}</span>
                      )}
                      {item.logo?.id && (
                        <SanityImage
                          alt={item.label || "credit"}
                          className="inline-block object-contain"
                          height={logoHeight}
                          image={item.logo}
                          style={{ height: logoHeight }}
                          width={48}
                        />
                      )}
                    </Fragment>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <SocialLinks data={socialLinks} />
            <FooterThemeToggle />
          </div>
        </div>
      </div>

      {/* Oversized outlined wordmark, clipped by the page edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative h-[19vw] max-h-64 select-none overflow-hidden"
      >
        <span className="footer-wordmark absolute inset-x-0 top-0 text-center font-instrument-serif text-[22vw] italic leading-[0.85] tracking-tight lg:text-[17rem]">
          {wordmark}
        </span>
      </div>
    </footer>
  );
}
