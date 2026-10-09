"use client";

import { Button } from "@workspace/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export interface HomeHeroButton {
  _key?: string;
  text?: string | null;
  href?: string | null;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | null;
  openInNewTab?: boolean | null;
}

interface HomeHeroProps {
  statusPill?: string | null;
  greeting?: string | null;
  tagline?: string | null;
  bioText?: string | null;
  buttons?: HomeHeroButton[] | null;
}

export function HomeHero({
  statusPill = "Available for Advisory & Engineering",
  buttons = [
    { text: "Read Essays", href: "/blog", variant: "default" },
    { text: "About Me", href: "/blog", variant: "outline" },
  ],
}: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden border-border/40 border-b py-12 md:py-20 lg:py-24">
      <div className="container max-w-4xl">
        <div className="flex flex-col gap-6 max-w-3xl">
          {statusPill ? (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1.5 font-medium font-mono text-emerald-600 dark:text-emerald-400 text-xs shadow-[inset_0_1px_2px_rgba(16,185,129,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>{statusPill}</span>
            </div>
          ) : null}

          <div className="space-y-3">
            <h1 className="font-instrument-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-foreground leading-[1.05]">
              I am <span className="italic font-normal">Ajinkya Dharkar</span>
            </h1>
            <p className="font-sans font-light text-muted-foreground text-lg sm:text-xl leading-relaxed">
              Software engineer, systems builder, and writer.
            </p>
          </div>

          <div className="text-base sm:text-lg text-foreground/85 leading-relaxed space-y-2">
            <p>
              I am a software engineer focused on building robust systems,
              high-performance web architecture, and intuitive developer tools.
              On this site, I write about engineering craft, compiler patterns,
              modern frontend systems, and software that lasts.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {buttons?.map((btn, idx) => {
              const label =
                btn.text || (idx === 0 ? "Read Essays" : "Portfolio");
              const isExternal = Boolean(btn.openInNewTab);
              return (
                <Button
                  key={btn._key ?? `${label}-${idx}`}
                  variant={btn.variant ?? (idx === 0 ? "default" : "outline")}
                  asChild
                >
                  <Link
                    href={btn.href ?? "/blog"}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-2"
                  >
                    <span>{label}</span>
                    {idx === 0 ? <ArrowRight className="size-4" /> : null}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
