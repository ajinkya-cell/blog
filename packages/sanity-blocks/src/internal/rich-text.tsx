import { Logger } from "@workspace/logger";
import { cn } from "@workspace/tailwind-config/utils";
import Link from "next/link";
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextReactComponents,
} from "next-sanity";

import { CodeBlock } from "./code-block";
import { headingChildrenToSlug as parseChildrenToSlug } from "./heading-slug";
import { sanitizeHref } from "./safe-href";
import { SanityImage } from "./sanity-image";
import { TableBlock } from "./table-block";

const logger = new Logger("RichText");

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
      <code className="rounded-none border border-border bg-zinc-200 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground before:content-none after:content-none lg:whitespace-nowrap dark:bg-zinc-800">
        {children}
      </code>
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
          language={value.language}
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
            "my-6 not-prose rounded-r border-l-4 p-4 text-sm leading-relaxed",
            type === "warning" &&
              "border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-100",
            type === "tip" &&
              "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
            type === "quote" &&
              "border-purple-500 bg-purple-500/10 italic text-purple-950 dark:text-purple-100",
            type === "info" &&
              "border-blue-500 bg-blue-500/10 text-blue-950 dark:text-blue-100"
          )}
        >
          {value.title ? (
            <div className="mb-1 font-mono font-semibold text-xs tracking-wider uppercase">
              {value.title}
            </div>
          ) : null}
          <p className="m-0 whitespace-pre-line">{value.content}</p>
        </aside>
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
        "prose prose-zinc dark:prose-invert max-w-none prose-headings:scroll-m-24 prose-a:decoration-dotted prose-strong:font-normal prose-strong:text-foreground prose-h2:first:mt-0 dark:prose-headings:text-zinc-100",
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
