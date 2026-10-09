import { BlockHeader } from "@workspace/sanity-blocks/internal/block-header";
import {
  FacebookIcon,
  GithubIcon,
  InstagramBrandIcon,
  LinkedinBrandIcon,
  RedditBrandIcon,
  SlackIcon,
  XLogoIcon,
  YoutubeIcon,
} from "@workspace/sanity-blocks/internal/icons";
import { sanitizeHref } from "@workspace/sanity-blocks/internal/safe-href";
import {
  SanityImage,
  type SanityImageData,
} from "@workspace/sanity-blocks/internal/sanity-image";
import { ArrowRight } from "lucide-react";
import { stegaClean } from "next-sanity";
import Link from "next/link";
import type { ComponentType } from "react";

export interface SocialGridItem {
  _key: string;
  platform?: string | null;
  label?: string | null;
  logo?: SanityImageData | null;
  href?: string | null;
  openInNewTab?: boolean | null;
}

export interface SocialGridProps {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  socials?: SocialGridItem[] | null;
}

type IconProps = Readonly<{ className?: string }>;

const PLATFORM_ICONS: Record<string, ComponentType<IconProps>> = {
  reddit: RedditBrandIcon,
  x: XLogoIcon,
  youtube: YoutubeIcon,
  github: GithubIcon,
  linkedin: LinkedinBrandIcon,
  facebook: FacebookIcon,
  instagram: InstagramBrandIcon,
  slack: SlackIcon,
};

function SocialCard({ social }: Readonly<{ social: SocialGridItem }>) {
  const { platform, label, logo, openInNewTab } = social;
  const href = sanitizeHref(social.href);
  // stegaClean: `platform` is not on the default stega denylist, so in
  // Presentation the raw value carries invisible characters and the lookup
  // misses — no icons in preview, icons in production.
  const key = stegaClean(platform);
  const Icon = key ? PLATFORM_ICONS[key] : undefined;
  const displayLabel = label ?? platform ?? "";

  const iconMedia = Icon ? (
    <Icon className="h-[42px] w-auto fill-current" />
  ) : null;
  const media = logo?.id ? (
    <span className="flex h-[42px] shrink-0 items-center justify-center">
      <SanityImage
        className="h-[42px] w-auto max-w-full object-contain opacity-90 invert group-hover:invert-0 dark:invert-0"
        height={42}
        image={logo}
        width={47}
      />
    </span>
  ) : (
    iconMedia
  );

  const card = (
    <div className="site-chassis group relative min-h-[220px] overflow-hidden rounded-2xl p-6 text-foreground transition-all duration-200 hover:-translate-y-1 hover:border-white/20 sm:min-h-0 sm:aspect-[360/248]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="recessed-well relative flex size-[88px] items-center justify-center rounded-2xl border border-white/[0.06] text-foreground transition-colors duration-200 group-hover:border-white/20 group-hover:text-white">
          {media}
        </span>
      </div>
      <span className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] items-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-foreground/80 text-xs uppercase tracking-wider transition-colors duration-200 group-hover:border-white/20 group-hover:text-white">
        <span className="min-w-0 truncate">{displayLabel}</span>
        {href ? (
          <ArrowRight
            aria-hidden="true"
            className="h-3.5 w-0 shrink-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:ml-1 group-hover:w-3.5 group-hover:opacity-100"
          />
        ) : null}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link
        className="focus-ring-inset block focus-visible:[outline-style:solid]!"
        href={href}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        target={openInNewTab ? "_blank" : undefined}
      >
        {card}
      </Link>
    );
  }

  return card;
}

export function SocialGrid({
  eyebrow,
  title,
  subtitle,
  socials,
}: Readonly<SocialGridProps>) {
  if (!(Array.isArray(socials) && socials.length > 0)) {
    return null;
  }

  return (
    <section className="block-section" id="socials">
      <div className="container">
        <BlockHeader eyebrow={eyebrow} title={title}>
          {subtitle ? (
            <p className="body-text max-w-xl text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </BlockHeader>
        <div className="bleed-x mt-12 grid grid-cols-1 bg-grid-dots bg-background bg-size-[5.7px_6px] text-zinc-800 sm:grid-cols-2 md:mt-16 lg:grid-cols-4 dark:text-zinc-50">
          {socials.map((social) => (
            <SocialCard key={social._key} social={social} />
          ))}
        </div>
      </div>
    </section>
  );
}
