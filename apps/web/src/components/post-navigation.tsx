import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

export type PostLinkItem =
  | {
      title?: string | null;
      slug?: string | null;
    }
  | null
  | undefined;

export type PostNavigationProps = {
  previous?: PostLinkItem;
  next?: PostLinkItem;
};

export function PostNavigation({
  previous,
  next,
}: Readonly<PostNavigationProps>) {
  if (!previous?.slug && !next?.slug) {
    return null;
  }

  return (
    <nav
      aria-label="Previous and Next Articles"
      className="flex w-full items-center justify-between gap-4 border-border/40 border-t pt-8"
    >
      {/* Previous Button: Minimal pill expanding smoothly on hover */}
      {previous?.slug ? (
        <Link
          className="group relative inline-flex h-10 max-w-[110px] items-center gap-2 overflow-hidden whitespace-nowrap rounded-full border border-border/40 bg-card/40 px-3.5 text-muted-foreground text-xs shadow-sm transition-all duration-300 ease-out hover:max-w-[340px] hover:border-foreground/30 hover:bg-card hover:text-foreground hover:shadow-md sm:max-w-[120px] sm:hover:max-w-[420px]"
          href={previous.slug}
        >
          <ArrowLeft className="size-3.5 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span className="shrink-0 font-medium uppercase tracking-wider">
            Previous
          </span>
          {previous.title ? (
            <span className="truncate font-sans text-foreground/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              · {previous.title}
            </span>
          ) : null}
        </Link>
      ) : (
        <div aria-hidden="true" />
      )}

      {/* Next Button: Minimal pill expanding smoothly on hover */}
      {next?.slug ? (
        <Link
          className="group relative ml-auto inline-flex h-10 max-w-[95px] items-center justify-end gap-2 overflow-hidden whitespace-nowrap rounded-full border border-border/40 bg-card/40 px-3.5 text-muted-foreground text-xs shadow-sm transition-all duration-300 ease-out hover:max-w-[340px] hover:border-foreground/30 hover:bg-card hover:text-foreground hover:shadow-md sm:max-w-[105px] sm:hover:max-w-[420px]"
          href={next.slug}
        >
          {next.title ? (
            <span className="truncate font-sans text-foreground/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {next.title} ·
            </span>
          ) : null}
          <span className="shrink-0 font-medium uppercase tracking-wider">
            Next
          </span>
          <ArrowRight className="size-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </nav>
  );
}
