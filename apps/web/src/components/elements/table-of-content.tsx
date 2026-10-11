"use client";

import {
  headingChildrenToSlug,
  headingTextToSlug,
} from "@workspace/sanity-blocks/internal/heading-slug";
import {
  CopyIcon,
  InstagramIcon,
  LinkedInIcon,
  RedditIcon,
  XIcon,
} from "@workspace/sanity-blocks/internal/icons";
import {
  COPY_STATUS_CLASS,
  SWAP_HIDDEN,
  SWAP_LAYER,
  SWAP_SHOWN,
  useCopyToClipboard,
} from "@workspace/sanity-blocks/internal/use-copy";
import { cn } from "@workspace/tailwind-config/utils";
import { Check, ChevronRight, ChevronUp, ListTree } from "lucide-react";
import {
  type FC,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { RulerScrollArea } from "@/components/elements/ruler-scroll-area";
import type { SanityRichTextBlock, SanityRichTextProps } from "@/types";

type TableOfContentProps = {
  richText?: SanityRichTextProps;
  className?: string;
  maxDepth?: number;
  shareTitle?: string;
  shareUrl?: string;
};

type ProcessedHeading = {
  readonly id: string;
  readonly text: string;
  readonly href: string;
  readonly level: number;
  readonly style: HeadingStyle;
  readonly children: ProcessedHeading[];
  readonly isChild: boolean;
  readonly _key?: string;
};

type AnchorProps = {
  readonly heading: ProcessedHeading;
  readonly activeSlug: string | null;
  readonly maxDepth?: number;
  readonly currentDepth?: number;
  // Namespaces the anchor's own DOM id so the inline and floating trees can both
  // render without producing duplicate ids.
  readonly idPrefix?: string;
  // Fires after a heading link activates, letting the floating panel close.
  readonly onNavigate?: () => void;
};

type TableOfContentState = {
  readonly shouldShow: boolean;
  readonly headings: ProcessedHeading[];
  readonly error?: string;
};

type HeadingStyle = "h2" | "h3" | "h4" | "h5" | "h6";

type SanityTextChild = NonNullable<SanityRichTextBlock["children"]>[number];

type HeadingBlock = Extract<SanityRichTextBlock, { _type: "block" }> & {
  style: HeadingStyle;
  children: readonly SanityTextChild[];
};

const HEADING_STYLES: Record<HeadingStyle, string> = {
  h2: "pl-0",
  h3: "pl-4",
  h4: "pl-8",
  h5: "pl-12",
  h6: "pl-16",
} as const;

const HEADING_LEVELS: Record<HeadingStyle, number> = {
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
} as const;

// The y-offset a heading must pass to count as current. Matches the headings'
// own scroll-margin-top (`prose-headings:scroll-m-24`), so a heading reached by
// clicking the TOC is active the moment it lands rather than one item behind.
const READING_LINE = 96;
// `scrollIntoView` is sub-pixel while the scroll offset is rounded, so exact
// comparison misses by a fraction and credits the heading above.
const READING_LINE_SLACK = 2;

const DEFAULT_MAX_DEPTH = 6;
const MIN_HEADINGS_TO_SHOW = 1;

function isValidHeadingStyle(style: unknown): style is HeadingStyle {
  return typeof style === "string" && style in HEADING_STYLES;
}

function isValidTextChild(child: unknown): child is SanityTextChild {
  return (
    typeof child === "object" &&
    child !== null &&
    "_type" in child &&
    child._type === "span" &&
    "text" in child &&
    typeof child.text === "string"
  );
}

function hasValidTextChildren(
  children: unknown
): children is readonly SanityTextChild[] {
  return (
    Array.isArray(children) &&
    children.length > 0 &&
    children.every(isValidTextChild)
  );
}

function isHeadingBlock(block: unknown): block is HeadingBlock {
  if (
    typeof block !== "object" ||
    block === null ||
    !("_type" in block) ||
    block._type !== "block"
  ) {
    return false;
  }

  const candidate = block as Record<string, unknown>;

  return (
    isValidHeadingStyle(candidate.style) &&
    hasValidTextChildren(candidate.children)
  );
}

function extractTextFromChildren(children: readonly SanityTextChild[]): string {
  try {
    return children
      .map((child) => child.text?.trim() ?? "")
      .filter(Boolean)
      .join(" ")
      .trim();
  } catch (_error) {
    return "";
  }
}

function generateUniqueId(text: string, index: number, _key?: string): string {
  const baseId = _key || headingTextToSlug(text) || `heading-${index}`;
  return `toc-${baseId}`;
}

function extractHeadingBlocks(richText: SanityRichTextProps): HeadingBlock[] {
  if (!(richText && Array.isArray(richText))) {
    return [];
  }

  try {
    return richText.filter(isHeadingBlock);
  } catch (_error) {
    return [];
  }
}

function createProcessedHeading(
  block: HeadingBlock,
  index: number
): ProcessedHeading | null {
  try {
    const text = extractTextFromChildren(block.children);

    if (!text) {
      return null;
    }

    const level = HEADING_LEVELS[block.style];
    const href = `#${headingChildrenToSlug(block.children)}`;
    const id = generateUniqueId(text, index, block._key);

    return {
      id,
      text,
      href,
      level,
      style: block.style,
      children: [],
      isChild: false,
      _key: block._key,
    };
  } catch (_error) {
    return null;
  }
}

function buildHeadingHierarchy(
  flatHeadings: ProcessedHeading[],
  maxDepth: number = DEFAULT_MAX_DEPTH
): ProcessedHeading[] {
  if (flatHeadings.length === 0) {
    return [];
  }

  try {
    const result: ProcessedHeading[] = [];
    const processed = new Set<number>();

    flatHeadings.forEach((heading, index) => {
      if (processed.has(index) || heading.level > maxDepth) {
        return;
      }

      const children = collectChildHeadings(
        flatHeadings,
        index,
        processed,
        maxDepth
      );

      result.push({
        ...heading,
        children,
      });
    });

    return result;
  } catch (_error) {
    return flatHeadings.map((heading) => ({
      ...heading,
      children: [],
    }));
  }
}

function collectChildHeadings(
  headings: ProcessedHeading[],
  parentIndex: number,
  processed: Set<number>,
  maxDepth: number
): ProcessedHeading[] {
  const parentHeading = headings[parentIndex];

  if (!parentHeading || parentHeading.level >= maxDepth) {
    return [];
  }

  const children: ProcessedHeading[] = [];
  const parentLevel = parentHeading.level;

  for (let i = parentIndex + 1; i < headings.length; i++) {
    const currentHeading = headings[i];

    if (!currentHeading || currentHeading.level <= parentLevel) {
      break;
    }

    if (processed.has(i) || currentHeading.level > maxDepth) {
      continue;
    }

    processed.add(i);

    const nestedChildren = collectChildHeadings(
      headings,
      i,
      processed,
      maxDepth
    );

    children.push({
      ...currentHeading,
      children: nestedChildren,
      isChild: true,
    });
  }

  return children;
}

function processHeadingBlocks(
  headingBlocks: HeadingBlock[],
  maxDepth: number = DEFAULT_MAX_DEPTH
): ProcessedHeading[] {
  if (!Array.isArray(headingBlocks) || headingBlocks.length === 0) {
    return [];
  }

  try {
    const processedHeadings = headingBlocks
      .map(createProcessedHeading)
      .filter((heading): heading is ProcessedHeading => heading !== null);

    return buildHeadingHierarchy(processedHeadings, maxDepth);
  } catch (_error) {
    return [];
  }
}

type FlatHeading = { readonly slug: string; readonly text: string };

function flattenHeadings(headings: ProcessedHeading[]): FlatHeading[] {
  const result: FlatHeading[] = [];
  const walk = (items: ProcessedHeading[]) => {
    for (const item of items) {
      const slug = item.href.replace(/^#/, "");
      if (slug) {
        result.push({ slug, text: item.text });
      }
      if (item.children.length > 0) {
        walk(item.children);
      }
    }
  };
  walk(headings);
  return result;
}

function useTableOfContentState(
  richText?: SanityRichTextProps,
  maxDepth: number = DEFAULT_MAX_DEPTH
): TableOfContentState {
  try {
    if (!(richText && Array.isArray(richText)) || richText.length === 0) {
      return {
        shouldShow: false,
        headings: [],
      };
    }

    const headingBlocks = extractHeadingBlocks(richText);

    if (headingBlocks.length < MIN_HEADINGS_TO_SHOW) {
      return {
        shouldShow: false,
        headings: [],
      };
    }

    const processedHeadings = processHeadingBlocks(headingBlocks, maxDepth);

    return {
      shouldShow: processedHeadings.length >= MIN_HEADINGS_TO_SHOW,
      headings: processedHeadings,
    };
  } catch (error) {
    return {
      shouldShow: false,
      headings: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function useActiveHeading(slugKey: string): string | null {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    const slugs = slugKey ? slugKey.split("|") : [];
    if (slugs.length === 0) {
      return;
    }
    const elements = slugs
      .map((slug) => document.getElementById(slug))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) {
      return;
    }

    // Measured once and refreshed only when layout moves, so scrolling is pure
    // arithmetic over the cache and never forces a layout read.
    let tops: number[] = [];
    const measure = () => {
      tops = elements.map(
        (element) => element.getBoundingClientRect().top + window.scrollY
      );
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.scrollY + READING_LINE;
      let index = -1;
      for (const [i, top] of tops.entries()) {
        if (top <= line + READING_LINE_SLACK) {
          index = i;
        }
      }
      // The last heading can't always reach the line — there isn't necessarily
      // a viewport of content beneath it.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) {
        index = tops.length - 1;
      }
      setActiveSlug(index === -1 ? null : (slugs[index] ?? null));
    };
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };
    const remeasure = () => {
      measure();
      schedule();
    };

    measure();
    update();
    // Fonts finishing, images settling and the mobile disclosure opening all
    // move headings after mount; a stale cache would highlight the wrong item.
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
    };
  }, [slugKey]);

  return activeSlug;
}

const TableOfContentAnchor: FC<AnchorProps> = ({
  heading,
  activeSlug,
  maxDepth = DEFAULT_MAX_DEPTH,
  currentDepth = 1,
  idPrefix = "",
  onNavigate,
}) => {
  const { href, text, children, id } = heading;

  if (currentDepth > maxDepth) {
    return null;
  }

  if (!(text?.trim() && href?.trim())) {
    return null;
  }

  const slug = href.replace(/^#/, "");
  const isActive = activeSlug !== null && activeSlug === slug;
  const hasChildren =
    Array.isArray(children) && children.length > 0 && currentDepth < maxDepth;

  // In-page anchors are rendered as native <a>, not next/link. next/link
  // unconditionally preventDefaults hash clicks and defers the scroll to the
  // App Router, whose hash handling races with hydration and intermittently
  // no-ops — so a click during that window is swallowed (default suppressed,
  // no scroll). A native anchor plus this synchronous handler always scrolls:
  // before hydration the browser jumps natively, after hydration we scroll
  // here, and the router is never involved.
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const target = document.getElementById(slug);
    if (!target) {
      // Fall back to the browser's native hash navigation.
      return;
    }
    event.preventDefault();
    window.history.pushState(null, "", href);
    onNavigate?.();
    target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <li className={cn(currentDepth > 1 && "ml-2.5")}>
      <a
        aria-current={isActive ? "location" : undefined}
        className={cn(
          "group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-all cursor-pointer",
          isActive
            ? "popout-btn-active font-semibold shadow-sm"
            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        )}
        href={href}
        id={`${idPrefix}${id}`}
        onClick={handleClick}
      >
        <span className="truncate">{text}</span>
        {isActive ? (
          <ChevronRight className="size-3 shrink-0 text-black" />
        ) : (
          <span className="size-1 shrink-0 rounded-full bg-foreground/20 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </a>

      {hasChildren && (
        <ul className="mt-1 flex flex-col gap-1">
          {children.map((child, index) => (
            <TableOfContentAnchor
              activeSlug={activeSlug}
              currentDepth={currentDepth + 1}
              heading={child}
              idPrefix={idPrefix}
              key={child.id || `${child.text}-${index}-${currentDepth}`}
              maxDepth={maxDepth}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

type ShareTarget = {
  readonly network: string;
  readonly label: string;
  readonly icon: FC<{ className?: string }>;
  readonly url: (encodedUrl: string, encodedTitle: string) => string;
  // Networks with no web share-URL endpoint (Instagram) use the native Web
  // Share sheet instead of a plain link.
  readonly webShare?: boolean;
};

const SHARE_TARGETS: readonly ShareTarget[] = [
  {
    network: "X",
    label: "Post",
    icon: XIcon,
    url: (u, t) => `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
  },
  {
    network: "Instagram",
    label: "Post",
    icon: InstagramIcon,
    url: () => "https://www.instagram.com/",
    webShare: true,
  },
  {
    network: "LinkedIn",
    label: "Share",
    icon: LinkedInIcon,
    url: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
  },
  {
    network: "Reddit",
    label: "Post",
    icon: RedditIcon,
    url: (u, t) => `https://www.reddit.com/submit?url=${u}&title=${t}`,
  },
] as const;

function ShareOptions({
  title,
  shareUrl,
}: Readonly<{ title?: string; shareUrl?: string }>) {
  const [url, setUrl] = useState(shareUrl ?? "");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const getShareUrl = useCallback(() => url || window.location.href, [url]);
  const { status: copyStatus, copy } = useCopyToClipboard(getShareUrl);
  const copied = copyStatus === "copied";

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title ?? "");

  const handleWebShare = async (fallbackUrl: string) => {
    const resolvedUrl = url || window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: title || undefined, url: resolvedUrl });
        return;
      } catch {
        // Cancelled or the share failed — fall through to the fallback link.
      }
    }
    window.open(fallbackUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="recessed-well flex items-center justify-between p-1.5">
      <div className="flex items-center gap-1">
        {SHARE_TARGETS.map((target) => {
          const shareClass =
            "flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground";
          if (target.webShare) {
            return (
              <button
                aria-label={`Share on ${target.network}`}
                className={shareClass}
                key={target.network}
                onClick={() =>
                  handleWebShare(target.url(encodedUrl, encodedTitle))
                }
                title={`Share on ${target.network}`}
                type="button"
              >
                <target.icon className="size-3.5" />
              </button>
            );
          }
          return (
            <a
              aria-label={`Share on ${target.network}`}
              className={shareClass}
              href={target.url(encodedUrl, encodedTitle)}
              key={target.network}
              rel="noopener noreferrer"
              target="_blank"
              title={`Share on ${target.network}`}
            >
              <target.icon className="size-3.5" />
            </a>
          );
        })}
      </div>
      <button
        aria-label="Copy link to clipboard"
        className={cn(
          "flex h-7 items-center gap-1 rounded-lg px-2 text-muted-foreground text-xs transition-colors hover:bg-foreground/5 hover:text-foreground",
          COPY_STATUS_CLASS[copyStatus]
        )}
        onClick={copy}
        title="Copy article link"
        type="button"
      >
        <span aria-hidden="true" className="grid size-3.5 place-items-center">
          <Check
            className={cn(
              SWAP_LAYER,
              "size-3.5",
              copied ? SWAP_SHOWN : SWAP_HIDDEN
            )}
          />
          <CopyIcon
            className={cn(
              SWAP_LAYER,
              "size-3.5",
              copied ? SWAP_HIDDEN : SWAP_SHOWN
            )}
          />
        </span>
        <span aria-hidden="true" className="text-[10px]">
          {copied ? "Copied" : "Copy"}
        </span>
        <output className="sr-only">
          {copyStatus === "copied" ? "Link copied to clipboard" : ""}
          {copyStatus === "error" ? "Could not copy link" : ""}
        </output>
      </button>
    </div>
  );
}

export const TableOfContent: FC<TableOfContentProps> = ({
  richText,
  className,
  maxDepth = DEFAULT_MAX_DEPTH,
  shareTitle,
  shareUrl,
}) => {
  const { shouldShow, headings, error } = useTableOfContentState(
    richText,
    maxDepth
  );

  const slugKey = flattenHeadings(headings)
    .map((heading) => heading.slug)
    .join("|");
  const activeSlug = useActiveHeading(slugKey);

  if (error || !shouldShow || headings.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Table of contents"
      className={cn(
        "site-chassis relative w-full overflow-hidden rounded-2xl font-sans select-none",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-border/40 border-b bg-foreground/[0.02] px-4 py-3">
        <ListTree className="size-3.5 text-muted-foreground" />
        <span className="font-semibold text-[11px] text-muted-foreground tracking-wider uppercase">
          On This Page
        </span>
      </div>

      {/* Links List */}
      <RulerScrollArea className="max-h-[60vh] space-y-1 p-2">
        <ul className="flex flex-col gap-1">
          {headings.map((heading, index) => (
            <TableOfContentAnchor
              activeSlug={activeSlug}
              currentDepth={1}
              heading={heading}
              key={heading.id || `${heading.text}-${index}`}
              maxDepth={maxDepth}
            />
          ))}
        </ul>
      </RulerScrollArea>

      {/* Share Tray */}
      <div className="border-border/40 border-t p-2">
        <ShareOptions shareUrl={shareUrl} title={shareTitle} />
      </div>
    </nav>
  );
};

// Grace period before a mouse-out closes the floating panel, so crossing the
// gap between the pill and the panel doesn't collapse it.
const HOVER_CLOSE_DELAY_MS = 150;

export const FloatingTableOfContent: FC<
  Omit<TableOfContentProps, "shareTitle" | "shareUrl">
> = ({ richText, className, maxDepth = DEFAULT_MAX_DEPTH }) => {
  const { shouldShow, headings, error } = useTableOfContentState(
    richText,
    maxDepth
  );

  const flatHeadings = flattenHeadings(headings);
  const slugKey = flatHeadings.map((heading) => heading.slug).join("|");
  const activeSlug = useActiveHeading(slugKey);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef(0);
  const lastPointerRef = useRef("mouse");

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  if (error || !shouldShow || headings.length === 0) {
    return null;
  }

  const activeIndex = flatHeadings.findIndex(
    (heading) => heading.slug === activeSlug
  );
  const activeHeading = flatHeadings[Math.max(activeIndex, 0)];
  const position = activeIndex === -1 ? 0 : activeIndex + 1;

  // Hover expands only for a real mouse — touch fires pointerenter on tap,
  // which would race the tap's own toggle below.
  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") {
      return;
    }
    window.clearTimeout(closeTimerRef.current);
    setOpen(true);
  };
  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") {
      return;
    }
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(
      () => setOpen(false),
      HOVER_CLOSE_DELAY_MS
    );
  };
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setOpen(false);
    }
  };
  // A mouse click lands on a panel that hover already opened, so it must not
  // toggle it shut; taps and keyboard activation (detail 0) toggle.
  const handlePillClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (lastPointerRef.current === "mouse" && event.detail > 0) {
      setOpen(true);
      return;
    }
    setOpen((current) => !current);
  };

  return (
    <div
      className={cn(
        "fixed right-4 bottom-4 z-40 font-sans sm:right-6 sm:bottom-6",
        className
      )}
      onBlur={handleBlur}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      ref={containerRef}
    >
      <nav
        aria-label="Table of contents"
        className={cn(
          "site-chassis absolute right-0 bottom-full mb-3 w-80 max-w-[calc(100vw-2rem)] origin-bottom-right select-none overflow-hidden rounded-2xl transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none",
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible translate-y-2 scale-95 opacity-0"
        )}
        id="floating-toc-panel"
        inert={!open}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-border/40 border-b bg-foreground/[0.02] px-4 py-3">
          <ListTree className="size-3.5 text-muted-foreground" />
          <span className="font-medium text-muted-foreground text-xs">
            On this page
          </span>
          <span className="ml-auto text-[11px] text-muted-foreground/70 tabular-nums">
            {position}/{flatHeadings.length}
          </span>
        </div>

        {/* Links List */}
        <RulerScrollArea className="max-h-[min(60vh,28rem)] space-y-1 p-2">
          <ul className="flex flex-col gap-1">
            {headings.map((heading, index) => (
              <TableOfContentAnchor
                activeSlug={activeSlug}
                currentDepth={1}
                heading={heading}
                idPrefix="floating-"
                key={heading.id || `${heading.text}-${index}`}
                maxDepth={maxDepth}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </ul>
        </RulerScrollArea>
      </nav>

      <button
        aria-controls="floating-toc-panel"
        aria-expanded={open}
        aria-label={`Table of contents: ${activeHeading?.text ?? ""}`}
        className="site-chassis flex h-10 max-w-[min(18rem,calc(100vw-2rem))] cursor-pointer items-center gap-2.5 rounded-full pr-3.5 pl-3 text-xs transition-transform active:scale-95"
        onClick={handlePillClick}
        onPointerDown={(event) => {
          lastPointerRef.current = event.pointerType;
        }}
        type="button"
      >
        <ListTree
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground"
        />
        <span className="truncate font-medium text-foreground/90">
          {activeHeading?.text}
        </span>
        <span className="shrink-0 text-muted-foreground/70 tabular-nums">
          {position}/{flatHeadings.length}
        </span>
        <ChevronUp
          aria-hidden="true"
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
    </div>
  );
};
