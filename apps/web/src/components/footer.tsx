import {
  type DynamicFetchOptions,
  getDynamicFetchOptions,
  sanityFetch,
} from "@workspace/sanity/live";
import { queryFooterData } from "@workspace/sanity/query";
import type {
  QueryFooterDataResult,
  QueryGlobalSeoSettingsResult,
} from "@workspace/sanity/types";
import { normalizedLogoHeight } from "@workspace/sanity-blocks/internal/logo-height";
import { SanityImage } from "@workspace/sanity-blocks/internal/sanity-image";
import { Lacquer, Reenie_Beanie } from "next/font/google";
import { Fragment, type ReactNode } from "react";

import { RoughArrow } from "@/components/roughly/rough-arrow";
import { RoughHighlight } from "@/components/roughly/rough-highlight";
import { RoughUnderline } from "@/components/roughly/rough-underline";
import { getGlobalSettings } from "@/lib/navigation";

// Declared here rather than in the root layout so the fonts only load with
// the footer, the one place they're used.
const fontLacquer = Lacquer({ weight: "400", subsets: ["latin"] });
const fontReenieBeanie = Reenie_Beanie({ weight: "400", subsets: ["latin"] });

const ACCENT = "#7577E6";

type FooterLink = { label: string; href: string };

const PROJECT_LINKS: FooterLink[] = [
  { label: "Void UI", href: "https://voidui.in" },
  { label: "Rusper", href: "https://rusper-website.vercel.app" },
  { label: "Mood Metrics", href: "https://mood-metrics-gilt.vercel.app" },
];

// The Sanity settings still hold placeholder social URLs, so the real ones
// live here.
const ELSEWHERE_LINKS: FooterLink[] = [
  { label: "Portfolio", href: "https://ajinkya.org" },
  { label: "GitHub", href: "https://github.com/ajinkya-cell" },
  { label: "X", href: "https://x.com/ajinkyacell" },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/ajinkya-dharkar-a844b1258",
  },
];

type FooterProps = {
  data: NonNullable<QueryFooterDataResult>;
  settingsData: NonNullable<QueryGlobalSeoSettingsResult>;
};

export async function DynamicFooter() {
  const { perspective, stega } = await getDynamicFetchOptions();
  return <CachedFooter perspective={perspective} stega={stega} />;
}

export async function CachedFooter({
  perspective,
  stega,
}: DynamicFetchOptions) {
  "use cache";
  const [response, settingsData] = await Promise.all([
    sanityFetch({ query: queryFooterData, perspective, stega }),
    getGlobalSettings({ perspective, stega }),
  ]);

  if (!(response?.data && settingsData)) {
    return null;
  }
  return <Footer data={response.data} settingsData={settingsData} />;
}

const groupHeadingClass =
  "text-[11px] text-muted-foreground/70 uppercase tracking-[0.18em]";

function LinkGroup({
  title,
  links,
}: Readonly<{ title: ReactNode; links: FooterLink[] }>) {
  return (
    <div className="grid content-start gap-3">
      <h3 className={groupHeadingClass}>{title}</h3>
      <ul className="grid gap-2">
        {links.map(({ label, href }) => (
          <li key={label}>
            <a
              className="group inline-flex items-center gap-1 text-foreground/75 text-sm transition-colors hover:text-foreground"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="bg-[length:0%_1px] bg-[linear-gradient(currentColor,currentColor)] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
                {label}
              </span>
              <span
                aria-hidden="true"
                className="text-muted-foreground text-xs transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
              >
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectsHeading() {
  return (
    <>
      {/* Phones stack the columns, where a left-pointing arrow would run off
          the screen. */}
      <span className="md:hidden">Projects</span>
      {/* Hidden from a wrapper: the arrow's own inline-block would beat a
          `hidden` class passed to it. */}
      <span className="hidden md:inline-block">
        <RoughArrow
          arrowhead="open"
          className="text-muted-foreground"
          color="currentColor"
          curvature={0.32}
          distance={34}
          iterations={1}
          label="things I've built"
          labelClassName={`${fontReenieBeanie.className} normal-case tracking-normal`}
          labelFont="reenie-beanie"
          labelFontSize={22}
          offset={6}
          placement="left"
          strokeWidth={1.75}
        >
          Projects
        </RoughArrow>
      </span>
    </>
  );
}

function FooterQuote() {
  return (
    <figure className="mx-auto grid max-w-3xl justify-items-center gap-4 text-center">
      <blockquote
        className={`${fontLacquer.className} text-balance text-3xl text-foreground leading-snug sm:text-4xl`}
      >
        “In the midst of winter, I found there was, within me, an{" "}
        <RoughHighlight
          // Roughly puts the marker at z-index -1; isolate keeps it above
          // the page background instead of behind it.
          className="isolate"
          color={ACCENT}
          iterations={1}
          opacity={0.35}
          padding={[0, 4, 0, 4]}
        >
          invincible summer
        </RoughHighlight>
        .”
      </blockquote>
      <figcaption className="text-muted-foreground text-xs">
        Albert Camus, <cite>Return to Tipasa</cite>
      </figcaption>
    </figure>
  );
}

function Footer({ data, settingsData }: Readonly<FooterProps>) {
  const { copyright, credits } = data;
  const { siteTitle } = settingsData;
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-8 w-full overflow-hidden font-sans sm:mt-12">
      <div
        aria-hidden="true"
        className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-foreground/15 to-transparent"
      />

      <div className="container relative max-w-6xl pt-12 pb-20 sm:pt-14 sm:pb-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          {/* Sign-off */}
          <p className="font-instrument-serif text-4xl text-foreground italic leading-none tracking-tight sm:text-5xl">
            <RoughUnderline color={ACCENT} strokeWidth={2}>
              Thanks for reading.
            </RoughUnderline>
          </p>

          {/* Links */}
          <div className="grid grid-cols-2 gap-x-16 gap-y-8">
            <LinkGroup links={PROJECT_LINKS} title={<ProjectsHeading />} />
            <LinkGroup links={ELSEWHERE_LINKS} title="Elsewhere" />
          </div>
        </div>

        <div className="mt-14 sm:mt-16">
          <FooterQuote />
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-foreground/10 border-t pt-6 sm:flex-row">
          <div className="grid gap-1 text-center sm:text-left">
            <span className="text-[11px] text-muted-foreground">
              {copyright ?? `© ${year} ${siteTitle ?? "Ajinkya"}`}
            </span>

            {credits && credits.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground/70">
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
        </div>
      </div>
    </footer>
  );
}
