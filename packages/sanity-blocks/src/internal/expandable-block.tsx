"use client";

import { cn } from "@workspace/tailwind-config/utils";
import { BookOpen, ChevronDown } from "lucide-react";
import { type MouseEvent, type ReactNode, useState } from "react";

import { useDisclosureAnimation } from "./use-disclosure-animation";

export interface ExpandableBlockProps {
  children?: ReactNode;
  defaultOpen?: boolean | null;
  summary: string;
}

/**
 * The rich-text `expandable` ("deep dive"). Still a native `<details>`, so
 * keyboard, screen readers and no-JS readers all get a working disclosure;
 * the summary click is taken over only to animate the height.
 */
export function ExpandableBlock({
  summary,
  defaultOpen,
  children,
}: Readonly<ExpandableBlockProps>) {
  // The `open` attribute is rendered once from the editor's setting and never
  // re-rendered — `useDisclosureAnimation` owns `details.open` after mount.
  const [initialOpen] = useState(Boolean(defaultOpen));
  const [open, setOpen] = useState(initialOpen);
  const { detailsRef, contentRef } = useDisclosureAnimation(open);

  const handleSummaryClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setOpen((current) => !current);
  };

  return (
    <details
      className="not-prose my-8 overflow-hidden rounded-xl border border-border/70 bg-foreground/[0.015] transition-colors open:bg-foreground/[0.025]"
      open={initialOpen}
      ref={detailsRef}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: summary is natively interactive */}
      <summary
        className="group flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 transition-colors hover:bg-foreground/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden"
        onClick={handleSummaryClick}
      >
        <BookOpen
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        />
        <span className="grid min-w-0 flex-1 gap-0.5">
          <span className="font-medium text-muted-foreground text-xs">
            Deep dive
          </span>
          <span className="font-medium text-base text-foreground leading-snug">
            {summary}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-[color,transform] duration-200 group-hover:text-foreground",
            open && "rotate-180"
          )}
        />
      </summary>
      {children ? (
        <div className="overflow-hidden" ref={contentRef}>
          <div className="border-border/60 border-t px-4 py-5 text-[0.95rem] text-foreground/85 leading-7 sm:px-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-4 [&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-5">
            {children}
          </div>
        </div>
      ) : null}
    </details>
  );
}
