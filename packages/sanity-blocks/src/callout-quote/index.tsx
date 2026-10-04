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
      className={cn("py-12 md:py-16 bg-background", className)}
      data-sanity={dataSanity}
    >
      <div className="container max-w-3xl">
        <blockquote className="relative rounded-none border-l-2 border-foreground/30 bg-muted/20 pl-6 py-4 md:pl-8">
          <Quote
            aria-hidden="true"
            className="size-6 text-muted-foreground/30 mb-2"
          />
          <p className="font-serif italic text-xl md:text-2xl text-foreground leading-relaxed">
            “{quote}”
          </p>

          {(author || source) && (
            <footer className="mt-4 text-xs font-mono text-muted-foreground">
              {author && <span className="font-medium text-foreground">{author}</span>}
              {author && source && <span>, </span>}
              {source &&
                (sourceUrl ? (
                  <a
                    className="focus-ring underline underline-offset-2 hover:text-foreground"
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
