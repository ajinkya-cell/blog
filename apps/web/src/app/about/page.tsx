import { sanityFetch } from "@workspace/sanity/live";
import { queryAuthorProfile, querySettingsData } from "@workspace/sanity/query";
import { SanityImage } from "@workspace/sanity-blocks/internal/sanity-image";
import { Globe, Mail, MapPin, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "About",
  description:
    "Background, philosophy, and colophon for this personal digital space.",
};

async function getAboutData() {
  "use cache";
  const [{ data: author }, { data: settings }] = await Promise.all([
    sanityFetch({
      query: queryAuthorProfile,
      perspective: "published",
      stega: false,
    }),
    sanityFetch({
      query: querySettingsData,
      perspective: "published",
      stega: false,
    }),
  ]);
  return { author, settings };
}

export default async function AboutPage() {
  const { author, settings } = await getAboutData();
  const name = author?.name ?? settings?.siteTitle ?? "About Me";
  const tagline = author?.tagline ?? settings?.siteDescription;
  const position = author?.position ?? "Software Engineer & Writer";
  const bio = author?.bio ?? settings?.authorBio;
  const colophon = settings?.colophon;

  return (
    <main className="bg-background">
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <div className="container mt-8 mb-24 max-w-3xl md:my-16">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-balance font-normal text-4xl tracking-tight sm:text-5xl">
              {name}
            </h1>
            <p className="font-mono text-muted-foreground text-sm uppercase tracking-wider">
              {position}
            </p>
            {tagline && (
              <p className="mt-2 text-foreground/80 text-lg leading-relaxed">
                {tagline}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
              {author?.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {author.location}
                </span>
              )}
              {author?.status && (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                  <Sparkles className="size-4 text-amber-500" />
                  {author.status}
                </span>
              )}
            </div>
          </div>

          {author?.image?.id && (
            <div className="size-28 shrink-0 overflow-hidden rounded-full border border-border sm:size-32">
              <SanityImage
                alt={name}
                className="size-full object-cover"
                height={128}
                image={author.image}
                sizes="128px"
                width={128}
              />
            </div>
          )}
        </header>

        <section aria-labelledby="bio-heading" className="mt-12 border-border border-t pt-8">
          <h2 className="mb-4 font-semibold text-foreground text-xl" id="bio-heading">
            Background & Philosophy
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            {bio ? (
              <p className="whitespace-pre-line text-base">{bio}</p>
            ) : (
              <p className="text-base">
                Welcome to my personal corner on the web. Here I write about software
                engineering, distributed systems, architecture, and things I build.
              </p>
            )}
            <p className="text-base">
              I believe in writing to clarify thought, open software as public
              infrastructure, and building tools that respect the reader’s
              attention and cognitive clarity.
            </p>
          </div>
        </section>

        <AuthorConnectLinks links={author?.socialLinks} />

        <section aria-labelledby="colophon-heading" className="mt-12 border-border border-t pt-8">
          <h2 className="mb-4 font-semibold text-foreground text-xl" id="colophon-heading">
            Colophon
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {colophon ??
              "This site is built with Next.js, TypeScript, Tailwind CSS, and Sanity CMS. Hosted on Vercel with server components, edge caching, and semantic markdown twins."}
          </p>
        </section>
      </div>
    </main>
  );
}

type AuthorLinks = {
  email?: string | null;
  github?: string | null;
  twitter?: string | null;
  bluesky?: string | null;
  linkedin?: string | null;
  website?: string | null;
} | null | undefined;

function AuthorConnectLinks({ links }: { links: AuthorLinks }) {
  if (!links) {
    return null;
  }

  const items = [
    {
      label: "Email",
      href: links.email ? `mailto:${links.email}` : null,
      icon: Mail,
      external: false,
    },
    { label: "GitHub", href: links.github, external: true },
    { label: "Twitter/X", href: links.twitter, external: true },
    { label: "Bluesky", href: links.bluesky, external: true },
    { label: "LinkedIn", href: links.linkedin, external: true },
    { label: "Website", href: links.website, icon: Globe, external: true },
  ].filter((item) => Boolean(item.href));

  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="connect-heading" className="mt-12 border-border border-t pt-8">
      <h2 className="mb-4 font-semibold text-foreground text-xl" id="connect-heading">
        Connect
      </h2>
      <div className="flex flex-wrap gap-4 text-sm">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-xs hover:bg-muted"
              href={item.href as string}
              key={item.label}
              rel={item.external ? "noopener noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
            >
              {Icon && <Icon className="size-3.5" />}
              {item.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
