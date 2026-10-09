"use client";

import { headingChildrenToSlug } from "@workspace/sanity-blocks/internal/heading-slug";
import { cn } from "@workspace/tailwind-config/utils";
import { ChevronRight, ChevronUp, ListTree, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { SanityRichTextBlock } from "@/types";

type HeadingItem = {
  id: string;
  text: string;
  href: string;
  level: number;
};

type FloatingTableOfContentsProps = {
  richText?: unknown[] | null;
  className?: string;
};

type HeadingCandidate = SanityRichTextBlock & {
  style?: string;
  children?: Array<{ _type?: string; text?: string }>;
};

const READING_LINE = 140;

function parseHeadingBlock(block: unknown): HeadingItem | null {
  if (typeof block !== "object" || block === null) return null;
  const candidate = block as HeadingCandidate;
  if (candidate._type !== "block") return null;

  const style = candidate.style;
  if (style !== "h2" && style !== "h3" && style !== "h4") return null;

  const children = candidate.children;
  if (!Array.isArray(children) || children.length === 0) return null;

  const text = children
    .map((c) => c.text?.trim() ?? "")
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!text) return null;

  const slug = headingChildrenToSlug(
    children as Parameters<typeof headingChildrenToSlug>[0]
  );

  return {
    id: slug,
    text,
    href: `#${slug}`,
    level: style === "h2" ? 2 : style === "h3" ? 3 : 4,
  };
}

function extractHeadings(richText?: unknown[] | null): HeadingItem[] {
  if (!Array.isArray(richText)) return [];
  const items: HeadingItem[] = [];
  for (const block of richText) {
    const item = parseHeadingBlock(block);
    if (item) items.push(item);
  }
  return items;
}

function findActiveHeading(headings: HeadingItem[]): string | null {
  if (typeof window === "undefined") return null;
  if (window.scrollY < 180) {
    return headings[0]?.id ?? null;
  }
  let active: string | null = headings[0]?.id ?? null;
  for (const heading of headings) {
    const el = document.getElementById(heading.id);
    if (el && el.getBoundingClientRect().top <= READING_LINE) {
      active = heading.id;
    }
  }
  return active;
}

export function FloatingTableOfContents({
  richText,
  className,
}: Readonly<FloatingTableOfContentsProps>) {
  const headings = extractHeadings(richText);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll spy to detect currently visible heading
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      setActiveSlug(findActiveHeading(headings));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  // Click outside and Escape to close
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (headings.length === 0) {
    return null;
  }

  const activeHeading = headings.find((h) => h.id === activeSlug);
  const displayLabel =
    activeHeading?.text ?? headings[0]?.text ?? "Table of Contents";

  const handleHeadingClick = (href: string) => {
    const id = href.replace(/^#/, "");
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      history.pushState(null, "", href);
      setActiveSlug(id);
      setIsOpen(false);
    }
  };

  return (
    <div
      className={cn("fixed right-4 bottom-6 z-40 sm:right-8", className)}
      ref={containerRef}
    >
      {/* Expanded Popover Panel (Void UI 3D Beveled Chassis) */}
      {isOpen && (
        <div
          aria-label="Table of Contents"
          className="site-chassis absolute right-0 bottom-12 mb-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl p-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.35),0_24px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
          role="dialog"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-2">
              <ListTree className="h-3.5 w-3.5 text-white/50" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white/70">
                On This Page
              </span>
              <span className="font-mono text-[10px] text-white/40">
                ({headings.length})
              </span>
            </div>
            <button
              aria-label="Close table of contents"
              className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Links List in Recessed Tray */}
          <nav
            aria-label="Article outline"
            className="p-2 space-y-1 max-h-[60vh] overflow-y-auto"
          >
            {headings.map((heading) => {
              const isActive = heading.id === activeSlug;
              const indentClass =
                heading.level === 4
                  ? "pl-7"
                  : heading.level === 3
                    ? "pl-5"
                    : "pl-3";

              return (
                <button
                  className={cn(
                    "group flex w-full items-center justify-between rounded-lg pr-2.5 py-1.5 text-left text-xs transition-all cursor-pointer",
                    indentClass,
                    isActive
                      ? "bg-white text-black font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.3)] border border-white/40"
                      : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                  )}
                  key={heading.id}
                  onClick={() => handleHeadingClick(heading.href)}
                  type="button"
                >
                  <span className="truncate">{heading.text}</span>
                  {isActive ? (
                    <ChevronRight className="h-3 w-3 shrink-0 text-black" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Collapsed Pill Button showing current section title */}
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Table of Contents: ${displayLabel}`}
        className="site-chassis flex h-9 max-w-[280px] cursor-pointer select-none items-center gap-2.5 rounded-full px-3.5 py-1 text-xs text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.35),0_12px_30px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all hover:border-white/20 hover:text-white sm:max-w-[340px] active:scale-95"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="truncate font-medium text-white/90">
          {displayLabel}
        </span>
        <ChevronUp
          className={cn(
            "size-3.5 shrink-0 text-white/50 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
    </div>
  );
}
