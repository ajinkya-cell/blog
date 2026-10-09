import { cn } from "@workspace/tailwind-config/utils";
import { Quote } from "lucide-react";

export interface CalloutQuoteProps {
  author?: string | null;
  className?: string;
  dataSanity?: string;
  quote?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
}

export function CalloutQuote({
  quote,
  author,
  source,
  sourceUrl,
  className,
  dataSanity,
}: Readonly<CalloutQuoteProps>) {
  if (!quote) return null;

  return (
    <section
      className={cn("border-border/40 border-b py-12 md:py-16", className)}
      data-sanity={dataSanity}
    >
      <div className="container max-w-3xl">
        <blockquote className="site-chassis relative overflow-hidden rounded-2xl p-6 sm:p-8">
          <Quote
            aria-hidden="true"
            className="mb-3 size-6 text-foreground/20"
          />
          <p className="font-sans italic text-foreground text-xl leading-relaxed sm:text-2xl">
            “{quote}”
          </p>

          {(author || source) && (
            <footer className="mt-5 flex items-center gap-1.5 font-mono text-muted-foreground text-xs">
              {author && (
                <span className="font-semibold text-foreground">{author}</span>
              )}
              {author && source && <span>—</span>}
              {source &&
                (sourceUrl ? (
                  <a
                    className="focus-ring underline underline-offset-2 hover:text-white"
                    href={sourceUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {source}
                  </a>
                ) : (
                  <span>{source}</span>
                ))}
            </footer>
          )}
        </blockquote>
      </div>
    </section>
  );
}
