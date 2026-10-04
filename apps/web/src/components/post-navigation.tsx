import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

export type PostLinkItem = {
  title?: string | null;
  slug?: string | null;
} | null | undefined;

export type PostNavigationProps = {
  previous?: PostLinkItem;
  next?: PostLinkItem;
};

export function PostNavigation({ previous, next }: Readonly<PostNavigationProps>) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      aria-label="Previous and Next Articles"
      className="grid grid-cols-1 gap-4 border-border border-t pt-8 sm:grid-cols-2"
    >
      {previous?.slug ? (
        <Link
          className="group flex flex-col gap-1 border border-border p-4 transition-colors hover:border-foreground/50 hover:bg-muted/30"
          href={previous.slug}
        >
          <span className="flex items-center gap-1 font-mono text-muted-foreground text-xs uppercase tracking-wider">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            Previous
          </span>
          <span className="line-clamp-2 font-medium text-foreground text-sm group-hover:underline">
            {previous.title ?? "Previous article"}
          </span>
        </Link>
      ) : (
        <div aria-hidden="true" className="hidden sm:block" />
      )}

      {next?.slug ? (
        <Link
          className="group flex flex-col gap-1 border border-border p-4 text-right transition-colors hover:border-foreground/50 hover:bg-muted/30 sm:ml-auto sm:w-full"
          href={next.slug}
        >
          <span className="flex items-center justify-end gap-1 font-mono text-muted-foreground text-xs uppercase tracking-wider">
            Next
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </span>
          <span className="line-clamp-2 font-medium text-foreground text-sm group-hover:underline">
            {next.title ?? "Next article"}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
