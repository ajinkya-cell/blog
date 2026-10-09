/**
 * Serializes `richText` portable-text arrays to Markdown. Pure (no React), so
 * blocks degrade to semantic Markdown instead of leaking JSX like
 * `<FAQComponent/>` when content is requested as Markdown. Delegates to the
 * official `@portabletext/markdown` library with custom renderers for the
 * Sanity-specific shapes; each is explained at its definition below.
 */

import { portableTextToMarkdown as officialPortableTextToMarkdown } from "@portabletext/markdown";

export interface PortableTextSpan {
  _type?: string;
  _key?: string | null;
  text?: string | null;
  marks?: string[] | null;
}

export interface PortableTextMarkDef {
  _key?: string | null;
  _type?: string | null;
  href?: string | null;
}

export interface PortableTextNode {
  _type?: string;
  _key?: string | null;
  style?: string | null;
  listItem?: string | null;
  level?: number | null;
  children?: PortableTextSpan[] | null;
  markDefs?: PortableTextMarkDef[] | null;
  // Inline image fields (projected by the shared image GROQ fragment).
  id?: string | null;
  alt?: string | null;
  caption?: string | null;
  // Code block fields.
  code?: string | null;
  language?: string | null;
  filename?: string | null;
  highlightLines?: string | null;
  // Table fields.
  headerRows?: number | null;
  rows?: PortableTextTableRow[] | null;
  // Callout fields.
  title?: string | null;
  type?: string | null;
  content?: string | PortableTextNode[] | null;
  // Divider
  styleVariant?: string | null;
  // Pull quote
  text?: string | null;
  attribution?: string | null;
  // Video / Tweet
  url?: string | null;
  autoPlay?: boolean | null;
  // File download
  label?: string | null;
  description?: string | null;
  // Math
  latex?: string | null;
  // Expandable
  summary?: string | null;
  defaultOpen?: boolean | null;
  // Code group
  files?:
    | {
        filename?: string | null;
        language?: string | null;
        code?: string | null;
        highlightLines?: string | null;
      }[]
    | null;
  // Playground
  provider?: string | null;
  height?: number | null;
}

export interface PortableTextTableRow {
  cells?: { value?: PortableTextNode[] | null }[] | null;
}

export interface MarkdownImage {
  id?: string | null;
  alt?: string | null;
  caption?: string | null;
}

export interface MarkdownOptions {
  /**
   * Resolves a Sanity image to a public URL. When omitted, images degrade to
   * their alt/caption text rather than emitting broken `![]()` markup.
   */
  resolveImageUrl?: (image: MarkdownImage) => string | null | undefined;
  /**
   * Site origin (e.g. `https://example.com`) used to make root-relative internal
   * links absolute, so `.md` output is self-contained. Omitted → links stay relative.
   */
  baseUrl?: string;
}

export type PortableTextValue = PortableTextNode[] | null | undefined;

// Prefix a root-relative path (`/about`) with `baseUrl`. Absolute, `//`, `#`,
// and scheme links (`mailto:`) pass through; no-op without `baseUrl`.
export function absolutizeUrl(
  href: string | null | undefined,
  baseUrl: string | null | undefined
): string {
  const url = (href ?? "").trim();
  if (!(url && baseUrl) || !url.startsWith("/") || url.startsWith("//")) {
    return url;
  }
  // Strip trailing slashes (loop, not a ReDoS-prone regex).
  let base = baseUrl;
  while (base.endsWith("/")) {
    base = base.slice(0, -1);
  }
  return `${base}${url}`;
}

// Script-executing schemes dropped so a link href can't smuggle XSS.
const UNSAFE_URL_SCHEME = /^\s*(?:javascript|vbscript|data):/i;

// Format a URL for a Markdown link/image target. Spaces or parens would close
// the `(...)` early, so wrap those in CommonMark's angle-bracket form. Unsafe
// schemes return an empty target.
export function formatUrl(href: string | null | undefined): string {
  // Strip ASCII control chars (browsers ignore them) so `java\nscript:` can't
  // slip past the scheme check.
  // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional — stripping them is the fix
  const url = (href ?? "").replace(/[\u0000-\u001F]/g, "").trim();
  if (!url || UNSAFE_URL_SCHEME.test(url)) {
    return "";
  }
  return /[\s()]/.test(url) ? `<${url}>` : url;
}

// Escape inline Markdown metacharacters so literal author text (e.g.
// `user_name_field`) isn't reinterpreted as italics/bold/links.
// Used by block-level serializers for plain-string fields (title, eyebrow, etc.).
export function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_[\]<>~|#])/g, String.raw`\$1`);
}

type AnyBlock = { _type: string; [key: string]: unknown };

// Fenced code block: open with a backtick run at least one longer than the
// longest run inside the code (min 3, CommonMark §4.5) so embedded fences
// don't close the block early. The language, if any, is the info string.
function fenceCodeBlock(code: string, language?: string | null): string {
  const longestRun = (code.match(/`+/g) ?? []).reduce(
    (max, run) => Math.max(max, run.length),
    0
  );
  const fence = "`".repeat(Math.max(3, longestRun + 1));
  // Strip backticks and newlines so the info string can't break out of or
  // prematurely close the fence.
  const info = (language ?? "").replace(/[\n\r`]/g, "").trim();
  // Trim trailing newlines with a linear scan; a `/\n+$/` regex backtracks.
  let end = code.length;
  while (end > 0 && code.codePointAt(end - 1) === 10) {
    end--;
  }
  const body = code.slice(0, end);
  return `${fence}${info}\n${body}\n${fence}`;
}

// GFM pipe-table cells are single-line, so a literal `|` would split the
// column and an embedded newline would break the row entirely.
function escapeTableCell(text: string): string {
  return text.replaceAll("|", String.raw`\|`).replace(/\n+/g, "<br>");
}

function renderTableRow(cells: string[]): string {
  return `| ${cells.join(" | ")} |`;
}

// GFM requires a header row followed by a `---` separator row; the schema's
// `headerRows` is a Studio display concern with no Markdown equivalent, so
// the first row is always treated as the header here regardless of its value.
function renderTable(node: PortableTextNode, options: MarkdownOptions): string {
  const rows = node.rows ?? [];
  if (rows.length === 0) {
    return "";
  }

  const rowsMarkdown = rows.map((row) =>
    (row.cells ?? []).map((cell) =>
      escapeTableCell(portableTextToMarkdown(cell.value, options))
    )
  );
  const columnCount = Math.max(0, ...rowsMarkdown.map((cells) => cells.length));
  if (columnCount === 0) {
    return "";
  }
  const pad = (cells: string[]) =>
    Array.from({ length: columnCount }, (_, index) => cells.at(index) ?? "");

  const [headerCells = [], ...bodyCells] = rowsMarkdown;
  return [
    renderTableRow(pad(headerCells)),
    renderTableRow(Array.from({ length: columnCount }, () => "---")),
    ...bodyCells.map((cells) => renderTableRow(pad(cells))),
  ].join("\n");
}

/**
 * Converts a portable-text array to a Markdown string.
 *
 * Consecutive list items are kept together (single newline); everything else
 * is separated by a blank line (handled by the official library's block-spacing
 * renderer). Trailing blank lines from empty blocks are trimmed.
 */
export function portableTextToMarkdown(
  blocks: PortableTextValue,
  options: MarkdownOptions = {}
): string {
  if (!Array.isArray(blocks)) {
    return "";
  }

  return officialPortableTextToMarkdown(blocks as AnyBlock[], {
    marks: {
      // Sanity schema convention: links use `customLink`, not the standard `link`.
      customLink: ({ value, children }) => {
        const href = value?.href as string | null | undefined;
        if (!href || href === "#") {
          return children;
        }
        return `[${children}](${formatUrl(absolutizeUrl(href, options.baseUrl))})`;
      },
      // Underline has no Markdown equivalent — emit plain text, not `<u>`.
      underline: ({ children }) => children,
      "strike-through": ({ children }) => `~~${children}~~`,
      highlight: ({ children }) => `==${children}==`,
    },
    types: {
      code: ({ value }) => {
        const node = value as PortableTextNode;
        const code = node.code ?? "";
        if (!code.trim()) {
          return "";
        }
        return fenceCodeBlock(code, node.language);
      },
      codeGroup: ({ value }) => {
        const node = value as PortableTextNode;
        const files = node.files ?? [];
        if (files.length === 0) {
          return "";
        }
        const sections: string[] = [];
        if (node.title?.trim()) {
          sections.push(`### ${node.title.trim()}`);
        }
        for (const file of files) {
          if (file?.code?.trim()) {
            if (file.filename) {
              sections.push(`**${file.filename}**`);
            }
            sections.push(fenceCodeBlock(file.code, file.language));
          }
        }
        return sections.join("\n\n");
      },
      table: ({ value }) => renderTable(value as PortableTextNode, options),
      divider: () => "---",
      pullQuote: ({ value }) => {
        const node = value as PortableTextNode;
        const text = (node.text ?? "").trim();
        if (!text) {
          return "";
        }
        const lines = [`> "${text}"`];
        if (node.attribution?.trim()) {
          lines.push(`> — ${node.attribution.trim()}`);
        }
        return lines.join("\n");
      },
      videoEmbed: ({ value }) => {
        const node = value as PortableTextNode;
        const url = (node.url ?? "").trim();
        if (!url) {
          return "";
        }
        const label = node.caption?.trim() || "Video";
        return `[Video: ${label}](${formatUrl(url)})`;
      },
      tweetEmbed: ({ value }) => {
        const node = value as PortableTextNode;
        const url = (node.url ?? "").trim();
        if (!url) {
          return "";
        }
        const label = node.caption?.trim() || "Post on X";
        return `[${label}](${formatUrl(url)})`;
      },
      fileDownload: ({ value }) => {
        const node = value as PortableTextNode;
        const url = (node.url ?? "").trim();
        if (!url) {
          return "";
        }
        const label = node.label?.trim() || "Download File";
        const desc = node.description?.trim();
        return desc
          ? `[Download: ${label}](${formatUrl(url)})\n\n_${desc}_`
          : `[Download: ${label}](${formatUrl(url)})`;
      },
      mathBlock: ({ value }) => {
        const node = value as PortableTextNode;
        const latex = (node.latex ?? "").trim();
        if (!latex) {
          return "";
        }
        const caption = node.caption?.trim();
        const block = `$$\n${latex}\n$$`;
        return caption ? `${block}\n\n_${caption}_` : block;
      },
      expandable: ({ value }) => {
        const node = value as PortableTextNode;
        const summary = node.summary?.trim() || "Details";
        const contentMd = Array.isArray(node.content)
          ? portableTextToMarkdown(node.content, options)
          : "";
        return `<details>\n<summary>${summary}</summary>\n\n${contentMd}\n</details>`;
      },
      playgroundEmbed: ({ value }) => {
        const node = value as PortableTextNode;
        const url = (node.url ?? "").trim();
        if (!url) {
          return "";
        }
        const title = node.title?.trim() || "Interactive Code Sandbox";
        return `[Playground: ${title}](${formatUrl(url)})`;
      },
      // Sanity images carry `{id, alt, caption}`, not `{src, alt, title}`.
      image: ({ value, isInline }) => {
        if (isInline) {
          return "";
        }
        const node = value as PortableTextNode;
        const alt = (node.alt ?? "").trim();
        const caption = (node.caption ?? "").trim();
        const url = node.id
          ? options.resolveImageUrl?.(node as MarkdownImage)
          : undefined;

        if (url) {
          const img = `![${alt}](${formatUrl(url)})`;
          return caption && caption !== alt ? `${img}\n\n_${caption}_` : img;
        }

        // No resolvable URL — keep textual content instead of broken markup.
        return caption || alt;
      },
      callout: ({ value }) => {
        const node = value as PortableTextNode;
        const lines: string[] = [];
        if (node.title?.trim()) {
          lines.push(`**${node.title.trim()}**`);
        }
        if (typeof node.content === "string") {
          const content = node.content.trim();
          if (content) {
            lines.push(...content.split("\n"));
          }
        } else if (Array.isArray(node.content)) {
          const contentMd = portableTextToMarkdown(node.content, options);
          if (contentMd) {
            lines.push(...contentMd.split("\n"));
          }
        }
        if (lines.length === 0) {
          return "";
        }
        return lines.map((line) => (line ? `> ${line}` : ">")).join("\n");
      },
    },
    // Suppress unknown block types; the default emits a JSON code block.
    unknownType: () => "",
  }).trim();
}
