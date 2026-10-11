import { cn } from "@workspace/tailwind-config/utils";

import { PullQuote } from "../internal/pull-quote";

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
      className={cn("py-12 md:py-16", className)}
      data-sanity={dataSanity}
    >
      <div className="container max-w-3xl">
        <PullQuote
          author={author}
          className="my-0"
          source={source}
          sourceUrl={sourceUrl}
        >
          <p>{quote}</p>
        </PullQuote>
      </div>
    </section>
  );
}
