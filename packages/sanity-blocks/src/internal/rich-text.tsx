import { Logger } from "@workspace/logger";
import { cn } from "@workspace/tailwind-config/utils";
import katex from "katex";
import { Download } from "lucide-react";
import Link from "next/link";
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextReactComponents,
} from "next-sanity";
import { CodeBlock } from "./code-block";
import { CodeGroupBlock, type CodeGroupFile } from "./code-group-block";
import { headingChildrenToSlug as parseChildrenToSlug } from "./heading-slug";
import { getPlaygroundEmbedUrl } from "./playground-embed-url";
import { sanitizeHref } from "./safe-href";
import { SanityImage } from "./sanity-image";
import { TableBlock } from "./table-block";
import { TweetEmbed } from "./tweet-embed";
import { getVideoEmbedUrl } from "./video-embed-url";

const logger = new Logger("RichText");

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) {
    return "";
  }
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

const components: Partial<PortableTextReactComponents> = {
  block: {
    // The Studio only offers H2–H6, but the schema doesn't police what's
    // already stored — seeded, imported or migrated blocks can still carry
    // `style: "h1"`, and @portabletext/react's default would render a real
    // `<h1>` right next to the page's own. Demote it to the H2 renderer so the
    // outline stays single-rooted and no level is skipped. Same slug, so
    // existing anchors keep resolving.
    h1: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h2
          className="mt-12 mb-8 scroll-m-20 font-medium text-4xl leading-[48px] tracking-[-0.24px] first:mt-0"
          id={slug}
        >
          {children}
        </h2>
      );
    },
    h2: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h2
          className="mt-12 mb-8 scroll-m-20 font-medium text-4xl leading-[48px] tracking-[-0.24px] first:mt-0"
          id={slug}
        >
          {children}
        </h2>
      );
    },
    h3: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h3
          className="scroll-m-20 font-medium text-3xl leading-10 tracking-[-0.24px]"
          id={slug}
        >
          {children}
        </h3>
      );
    },
    h4: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h4
          className="scroll-m-20 font-medium text-2xl leading-8 tracking-[-0.24px]"
          id={slug}
        >
          {children}
        </h4>
      );
    },
    h5: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h5 className="scroll-m-20 font-medium text-xl leading-7" id={slug}>
          {children}
        </h5>
      );
    },
    h6: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h6 className="scroll-m-20 font-medium text-lg leading-7" id={slug}>
          {children}
        </h6>
      );
    },
  },
  marks: {
    code: ({ children }) => (
      <code className="rounded-md border border-white/[0.08] bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-foreground/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] before:content-none after:content-none lg:whitespace-nowrap">
        {children}
      </code>
    ),
    underline: ({ children }) => (
      <u className="underline decoration-dotted underline-offset-4">
        {children}
      </u>
    ),
    "strike-through": ({ children }) => (
      <s className="line-through opacity-80">{children}</s>
    ),
    highlight: ({ children }) => (
      <mark className="rounded-none bg-yellow-200 px-1 py-0.5 text-foreground dark:bg-yellow-800/60 dark:text-yellow-100">
        {children}
      </mark>
    ),
    customLink: ({ children, value }) => {
      const safeHref = sanitizeHref(value.href);
      if (!safeHref || safeHref === "#") {
        return (
          <span className="underline decoration-dotted underline-offset-2">
            Link Broken
          </span>
        );
      }
      return (
        // The anchor text is the accessible name. An `aria-label` here would
        // replace it with a raw URL, which is what a screen reader would then
        // read out in place of the words the author wrote.
        <Link
          className="underline decoration-dotted underline-offset-2"
          href={safeHref}
          prefetch={false}
          rel={value.openInNewTab ? "noopener noreferrer" : undefined}
          target={value.openInNewTab ? "_blank" : "_self"}
        >
          {children}
          {value.openInNewTab ? (
            <span className="sr-only"> (opens in a new tab)</span>
          ) : null}
        </Link>
      );
    },
  },
  types: {
    code: ({ value }) => {
      if (!value?.code) {
        return null;
      }
      return (
        <CodeBlock
          code={value.code}
          filename={value.filename}
          highlightLines={value.highlightLines}
          language={value.language}
        />
      );
    },
    codeGroup: ({ value }) => {
      if (!value?.files || value.files.length === 0) {
        return null;
      }
      return (
        <CodeGroupBlock
          files={value.files as CodeGroupFile[]}
          title={value.title}
        />
      );
    },
    image: ({ value }) => {
      if (!value?.id) {
        return null;
      }
      return (
        <figure className="my-4">
          <SanityImage
            className="h-auto w-full"
            height={900}
            image={value}
            sizes="(min-width: 1024px) 900px, calc(100vw - 40px)"
            width={1600}
          />
          {value?.caption && (
            <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    table: ({ value }) => (
      <TableBlock
        cellComponents={components}
        headerRows={value?.headerRows}
        rows={value?.rows}
      />
    ),
    callout: ({ value }) => {
      if (!value?.content) {
        return null;
      }
      const type = value.type ?? "info";
      return (
        <aside
          className={cn(
            "recessed-well not-prose my-6 rounded-2xl border p-5 text-sm leading-relaxed",
            type === "warning" && "border-amber-500/30 text-amber-200/90",
            type === "tip" && "border-emerald-500/30 text-emerald-200/90",
            type === "quote" &&
              "border-purple-500/30 italic text-purple-200/90",
            type === "info" && "border-blue-500/30 text-blue-200/90"
          )}
        >
          <div className="mb-2.5 flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 font-bold font-mono text-[10px] tracking-wider uppercase",
                type === "warning" &&
                  "border border-amber-500/30 bg-amber-500/15 text-amber-400",
                type === "tip" &&
                  "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
                type === "quote" &&
                  "border border-purple-500/30 bg-purple-500/15 text-purple-400",
                type === "info" &&
                  "border border-blue-500/30 bg-blue-500/15 text-blue-400"
              )}
            >
              {value.title || type}
            </span>
          </div>
          {typeof value.content === "string" ? (
            <p className="m-0 whitespace-pre-line text-foreground/90">
              {value.content}
            </p>
          ) : Array.isArray(value.content) ? (
            <div className="text-foreground/90 [&>p]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
              <PortableText
                components={components}
                value={value.content as PortableTextBlock[]}
              />
            </div>
          ) : null}
        </aside>
      );
    },
    divider: ({ value }) => {
      const style = value?.style ?? "line";
      if (style === "dots") {
        return (
          <div
            aria-hidden="true"
            className="not-prose my-12 select-none text-center font-mono text-base tracking-[0.6em] text-muted-foreground"
          >
            · · ·
          </div>
        );
      }
      if (style === "stars") {
        return (
          <div
            aria-hidden="true"
            className="not-prose my-12 select-none text-center font-mono text-sm tracking-[0.5em] text-muted-foreground"
          >
            ✦ ✦ ✦
          </div>
        );
      }
      return <hr className="not-prose my-12 border-border/40 border-t" />;
    },
    pullQuote: ({ value }) => {
      if (!value?.text) {
        return null;
      }
      return (
        <blockquote className="site-chassis not-prose relative my-10 overflow-hidden rounded-2xl p-6 sm:p-8 font-sans">
          <p className="text-balance font-sans text-2xl text-foreground font-normal italic leading-relaxed sm:text-3xl">
            "{value.text}"
          </p>
          {value.attribution && (
            <cite className="mt-4 block font-mono text-muted-foreground text-xs uppercase tracking-wider not-italic">
              — {value.attribution}
            </cite>
          )}
        </blockquote>
      );
    },
    videoEmbed: ({ value }) => {
      const embedUrl = getVideoEmbedUrl(value?.url, {
        autoPlay: value?.autoPlay,
      });
      if (!embedUrl) {
        return null;
      }
      return (
        <figure className="site-chassis not-prose relative my-8 overflow-hidden rounded-2xl">
          <div className="aspect-video w-full overflow-hidden bg-black">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full border-none"
              loading="lazy"
              src={embedUrl}
              title={value?.caption || "Embedded video"}
            />
          </div>
          {value?.caption && (
            <figcaption className="border-border/40 border-t bg-foreground/[0.02] p-2.5 text-center font-mono text-muted-foreground text-xs">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    tweetEmbed: ({ value }) => {
      if (!value?.url) {
        return null;
      }
      return <TweetEmbed caption={value.caption} url={value.url} />;
    },
    fileDownload: ({ value }) => {
      if (!value?.url) {
        return null;
      }
      const sizeStr = formatBytes(value.size);
      const ext = value.extension ? `.${value.extension.toUpperCase()}` : "";
      const meta = [ext, sizeStr].filter(Boolean).join(" • ");

      return (
        <div className="site-chassis not-prose relative my-6 flex items-center justify-between gap-4 overflow-hidden rounded-2xl p-4 transition-all hover:border-white/20">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-foreground/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.06)]">
              <Download className="h-4 w-4" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <a
                className="truncate font-medium text-foreground text-sm hover:underline"
                download={value.originalFilename || true}
                href={value.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {value.label || value.originalFilename || "Download File"}
              </a>
              {value.description && (
                <p className="line-clamp-1 text-muted-foreground text-xs leading-normal">
                  {value.description}
                </p>
              )}
              {meta && (
                <span className="font-mono text-[10px] text-muted-foreground uppercase">
                  {meta}
                </span>
              )}
            </div>
          </div>
          <a
            className="popout-btn-inactive shrink-0 rounded-xl px-3.5 py-1.5 font-mono text-xs text-foreground transition-all hover:text-white"
            download={value.originalFilename || true}
            href={value.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            Download
          </a>
        </div>
      );
    },
    mathBlock: ({ value }) => {
      if (!value?.latex) {
        return null;
      }
      let html = "";
      try {
        html = katex.renderToString(value.latex, {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        html = `<code class="font-mono text-destructive">${value.latex}</code>`;
      }
      return (
        <figure className="recessed-well not-prose my-8 overflow-x-auto rounded-2xl border border-border/40 p-5 text-center">
          <div dangerouslySetInnerHTML={{ __html: html }} />
          {value.caption && (
            <figcaption className="mt-3 font-mono text-muted-foreground text-xs">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    expandable: ({ value }) => {
      if (!value?.summary) {
        return null;
      }
      return (
        <details
          className="group site-chassis not-prose relative my-6 overflow-hidden rounded-2xl p-4 transition-colors"
          open={value.defaultOpen}
        >
          <summary className="flex cursor-pointer select-none items-center justify-between font-medium text-foreground text-sm list-none [&::-webkit-details-marker]:hidden">
            <span>{value.summary}</span>
            <span
              aria-hidden="true"
              className="font-mono text-muted-foreground text-xs transition-transform duration-200 group-open:rotate-180"
            >
              ▼
            </span>
          </summary>
          {Array.isArray(value.content) && value.content.length > 0 && (
            <div className="recessed-well mt-3 rounded-xl border border-white/[0.04] p-3 text-muted-foreground text-sm leading-relaxed [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
              <PortableText
                components={components}
                value={value.content as PortableTextBlock[]}
              />
            </div>
          )}
        </details>
      );
    },
    playgroundEmbed: ({ value }) => {
      const embedUrl = getPlaygroundEmbedUrl(value?.url, value?.provider);
      if (!embedUrl) {
        return null;
      }
      const height = value?.height ?? 500;
      return (
        <figure className="site-chassis not-prose relative my-8 overflow-hidden rounded-2xl">
          <div
            className="w-full overflow-hidden bg-background"
            style={{ height }}
          >
            <iframe
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              allowFullScreen
              className="h-full w-full border-none"
              loading="lazy"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
              src={embedUrl}
              title={value?.title || "Code Sandbox"}
            />
          </div>
          {value?.title && (
            <figcaption className="border-border/40 border-t bg-foreground/[0.02] p-2.5 text-center font-mono text-muted-foreground text-xs">
              {value.title}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  hardBreak: () => <br />,
};

// GROQ projections type block children as optional even though a real
// block always has them, so loosen that field rather than requiring `any`
// casts at every call site that passes raw query results in.
type LooseRichTextBlock = Omit<PortableTextBlock, "children" | "markDefs"> & {
  children?: PortableTextBlock["children"];
  markDefs?: PortableTextBlock["markDefs"] | null;
};

export type RichTextValue = LooseRichTextBlock[] | null | undefined;

export function RichText<T extends RichTextValue>({
  richText,
  className,
}: Readonly<{
  richText?: T | null;
  className?: string;
}>) {
  if (!richText) {
    return null;
  }

  return (
    <div
      className={cn(
        // `strong` is the design's highlight treatment: foreground ink at
        // normal weight, not bold.
        "prose prose-zinc dark:prose-invert font-sans max-w-none prose-headings:scroll-m-24 prose-a:decoration-dotted prose-strong:font-normal prose-strong:text-foreground prose-h2:first:mt-0 dark:prose-headings:text-zinc-100",
        className
      )}
    >
      <PortableText
        components={components}
        onMissingComponent={(_, { nodeType, type }) => {
          logger.warn(`Missing component: ${nodeType} for type: ${type}`);
        }}
        value={richText}
      />
    </div>
  );
}
