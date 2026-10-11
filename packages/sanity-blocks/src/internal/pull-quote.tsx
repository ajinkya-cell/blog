import { cn } from "@workspace/tailwind-config/utils";
import type { ReactNode } from "react";

import { sanitizeHref } from "./safe-href";

export interface PullQuoteProps {
  /** Who said it. Rendered after an em rule, in the foreground ink. */
  author?: string | null;
  children: ReactNode;
  className?: string;
  /** Where it was said — a book, talk or post. Linked when `sourceUrl` is set. */
  source?: string | null;
  sourceUrl?: string | null;
}

/**
 * The one editorial quote treatment: the rich-text `pullQuote`, the callout's
 * `quote` type, plain `>` blockquotes and the `calloutQuote` page block all
 * render through here, so a quote reads the same wherever an editor puts it.
 *
 * Set in type rather than boxed — Instrument Serif between hairline rules,
 * with the opening mark hung in the gutter so the text keeps the column edge.
 */
export function PullQuote({
  children,
  author,
  source,
  sourceUrl,
  className,
}: Readonly<PullQuoteProps>) {
  const href = sanitizeHref(sourceUrl);

  return (
    <figure
      className={cn(
        "not-prose relative my-14 border-border/70 border-y py-10 sm:py-12",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-7 left-0 select-none font-serif text-7xl text-foreground/20 leading-none sm:top-8 sm:text-8xl"
      >
        “
      </span>
      <blockquote className="pl-10 sm:pl-16">
        <div className="text-balance font-serif text-[1.75rem] text-foreground leading-[1.22] tracking-[-0.01em] sm:text-[2.25rem] [&_p+p]:mt-4 [&_p]:m-0">
          {children}
        </div>
      </blockquote>

      {(author || source) && (
        <figcaption className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 pl-10 text-muted-foreground text-sm sm:pl-16">
          <span aria-hidden="true" className="h-px w-6 bg-foreground/30" />
          {author && (
            <span className="font-medium text-foreground">{author}</span>
          )}
          {author && source && <span aria-hidden="true">·</span>}
          {source &&
            (href ? (
              <a
                className="focus-ring underline decoration-foreground/20 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground/60"
                href={href}
                rel="noopener noreferrer"
                target="_blank"
              >
                <cite className="not-italic">{source}</cite>
              </a>
            ) : (
              <cite className="not-italic">{source}</cite>
            ))}
        </figcaption>
      )}
    </figure>
  );
}
