import { CodeBlockIcon } from "@sanity/icons/CodeBlock";
import { ImageIcon } from "@sanity/icons/Image";
import { LinkIcon } from "@sanity/icons/Link";
import { ThLargeIcon } from "@sanity/icons/ThLarge";
import {
  ChevronDown,
  Download,
  Info,
  Layers,
  MessageCircle,
  Minus,
  Play,
  Quote,
  Sigma,
  Terminal,
} from "lucide-react";
import {
  type ConditionalProperty,
  defineArrayMember,
  defineField,
} from "sanity";

// Single source of truth for portable text member names
const PORTABLE_TEXT_MEMBER_NAMES = {
  block: "block",
  image: "image",
  code: "code",
  table: "table",
  callout: "callout",
  divider: "divider",
  pullQuote: "pullQuote",
  videoEmbed: "videoEmbed",
  tweetEmbed: "tweetEmbed",
  fileDownload: "fileDownload",
  mathBlock: "mathBlock",
  expandable: "expandable",
  codeGroup: "codeGroup",
  playgroundEmbed: "playgroundEmbed",
} as const;

const CODE_LANGUAGES = [
  { title: "TypeScript", value: "ts" },
  { title: "TSX", value: "tsx" },
  { title: "JavaScript", value: "js" },
  { title: "Python", value: "python" },
  { title: "Rust", value: "rust" },
  { title: "Go", value: "go" },
  { title: "SQL", value: "sql" },
  { title: "HTML", value: "html" },
  { title: "CSS", value: "css" },
  { title: "JSON", value: "json" },
  { title: "YAML", value: "yaml" },
  { title: "Markdown", value: "md" },
  { title: "Shell / Zsh", value: "zsh" },
  { title: "Bash", value: "bash" },
  { title: "Dockerfile", value: "dockerfile" },
  { title: "GROQ", value: "groq" },
];

const PORTABLE_TEXT_BLOCK_STYLES = [
  { title: "Normal", value: "normal" },
  { title: "H2", value: "h2" },
  { title: "H3", value: "h3" },
  { title: "H4", value: "h4" },
  { title: "H5", value: "h5" },
  { title: "H6", value: "h6" },
  { title: "Inline", value: "inline" },
];

const TABLE_CELL_BLOCK_STYLES = [{ title: "Normal", value: "normal" }];

const customLinkAnnotation = {
  name: "customLink",
  type: "object",
  title: "Internal/External Link",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "customLink",
      type: "customUrl",
      description:
        "Where the highlighted text takes visitors — pick a page on this site or paste a web address",
    }),
  ],
};

const PORTABLE_TEXT_MARK_DECORATORS = [
  { title: "Strong", value: "strong" },
  { title: "Emphasis", value: "em" },
  { title: "Code", value: "code" },
  { title: "Underline", value: "underline" },
  { title: "Strikethrough", value: "strike-through" },
  { title: "Highlight", value: "highlight" },
];

const PORTABLE_TEXT_MARKS = {
  annotations: [customLinkAnnotation],
  decorators: PORTABLE_TEXT_MARK_DECORATORS,
};

const richTextMembers = [
  defineArrayMember({
    name: PORTABLE_TEXT_MEMBER_NAMES.block,
    type: "block",
    styles: PORTABLE_TEXT_BLOCK_STYLES,
    lists: [
      { title: "Numbered", value: "number" },
      { title: "Bullet", value: "bullet" },
    ],
    marks: PORTABLE_TEXT_MARKS,
  }),
  defineArrayMember({
    name: PORTABLE_TEXT_MEMBER_NAMES.image,
    type: "image",
    title: "Image",
    icon: ImageIcon,
    options: {
      hotspot: true,
    },
    fields: [
      defineField({
        name: "alt",
        type: "string",
        title: "Alternative Text",
        description: "Describe the image for screen readers and search engines",
      }),
      defineField({
        name: "caption",
        type: "string",
        title: "Caption Text",
        description: "Optional caption shown beneath the image.",
      }),
    ],
  }),
  defineArrayMember({
    name: PORTABLE_TEXT_MEMBER_NAMES.code,
    type: "object",
    title: "Code Block",
    description:
      "A multi-line code snippet with preserved indentation. Use this for code examples instead of the inline Code style.",
    icon: CodeBlockIcon,
    fields: [
      defineField({
        name: "code",
        type: "text",
        title: "Code",
        description: "The code snippet. Indentation and line breaks are kept.",
        rows: 8,
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "language",
        type: "string",
        title: "Language",
        description: "Optional language label shown in the code block header.",
        options: {
          list: CODE_LANGUAGES,
        },
      }),
      defineField({
        name: "filename",
        type: "string",
        title: "Filename",
        description: "Optional filename shown in the code block header.",
      }),
      defineField({
        name: "highlightLines",
        type: "string",
        title: "Highlighted Lines (Optional)",
        description:
          "Comma-separated line numbers or ranges (e.g. '3,7-10,15').",
      }),
    ],
    preview: {
      select: {
        filename: "filename",
        language: "language",
        code: "code",
      },
      prepare({ filename, language, code }) {
        const firstLine = (code ?? "").split("\n")[0]?.trim();
        return {
          title: filename || firstLine || "Code Block",
          subtitle: language ?? "Code",
        };
      },
    },
  }),
  defineArrayMember({
    name: PORTABLE_TEXT_MEMBER_NAMES.table,
    type: "object",
    title: "Table",
    icon: ThLargeIcon,
    fields: [
      defineField({
        name: "headerRows",
        type: "number",
        title: "Header Rows",
        description: "How many rows at the top of the table are headers.",
      }),
      defineField({
        name: "rows",
        type: "array",
        title: "Rows",
        of: [
          defineArrayMember({
            name: "row",
            type: "object",
            fields: [
              defineField({
                name: "cells",
                type: "array",
                title: "Cells",
                of: [
                  defineArrayMember({
                    name: "cell",
                    type: "object",
                    fields: [
                      defineField({
                        name: "value",
                        type: "array",
                        of: [
                          defineArrayMember({
                            type: "block",
                            styles: TABLE_CELL_BLOCK_STYLES,
                            marks: PORTABLE_TEXT_MARKS,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
    preview: {
      select: {
        rows: "rows",
      },
      prepare({ rows }) {
        const rowCount = Array.isArray(rows) ? rows.length : 0;
        const columnCount = Array.isArray(rows?.[0]?.cells)
          ? rows[0].cells.length
          : 0;
        return {
          title:
            rowCount && columnCount
              ? `${rowCount}×${columnCount} Table`
              : "Table",
        };
      },
    },
  }),
  defineArrayMember({
    name: PORTABLE_TEXT_MEMBER_NAMES.callout,
    type: "object",
    title: "Callout",
    description: "A highlighted callout note, tip, warning, or quote",
    icon: Info,
    fields: [
      defineField({
        name: "type",
        type: "string",
        title: "Callout Type",
        options: {
          list: [
            { title: "Note / Info", value: "info" },
            { title: "Tip / Idea", value: "tip" },
            { title: "Warning / Caution", value: "warning" },
            { title: "Quote", value: "quote" },
          ],
          layout: "radio",
        },
        initialValue: "info",
      }),
      defineField({
        name: "title",
        type: "string",
        title: "Title (Optional)",
        description: "Optional custom header for the callout",
      }),
      defineField({
        name: "content",
        type: "array",
        title: "Content",
        description:
          "The message or text of the callout (supports bold, links, code formatting)",
        of: [
          defineArrayMember({
            type: "block",
            styles: [{ title: "Normal", value: "normal" }],
            lists: [],
            marks: {
              decorators: PORTABLE_TEXT_MARK_DECORATORS,
              annotations: [customLinkAnnotation],
            },
          }),
        ],
      }),
    ],
    preview: {
      select: {
        title: "title",
        type: "type",
      },
      prepare({ title, type }) {
        const typeEmoji =
          type === "warning"
            ? "⚠️"
            : type === "tip"
              ? "💡"
              : type === "quote"
                ? "💬"
                : "ℹ️";
        return {
          title: title || "Callout",
          subtitle: `${typeEmoji} ${type || "info"}`,
        };
      },
    },
  }),
  defineArrayMember({
    name: PORTABLE_TEXT_MEMBER_NAMES.divider,
    type: "object",
    title: "Divider",
    description: "Horizontal section divider",
    icon: Minus,
    fields: [
      defineField({
        name: "style",
        type: "string",
        title: "Style",
        description: "Visual style of the divider",
        options: {
          list: [
            { title: "Line (Solid)", value: "line" },
            { title: "Dots (· · ·)", value: "dots" },
            { title: "Stars (✦ ✦ ✦)", value: "stars" },
          ],
          layout: "radio",
        },
        initialValue: "line",
      }),
    ],
    preview: {
      select: { style: "style" },
      prepare({ style }) {
        const labels: Record<string, string> = {
          line: "────── (Solid Line)",
          dots: "·  ·  · (Dots)",
          stars: "✦  ✦  ✦ (Stars)",
        };
        return {
          title: "Divider",
          subtitle: labels[style ?? "line"] ?? style,
        };
      },
    },
  }),
  defineArrayMember({
    name: PORTABLE_TEXT_MEMBER_NAMES.pullQuote,
    type: "object",
    title: "Pull Quote",
    description: "A prominent typographic quote with optional attribution",
    icon: Quote,
    fields: [
      defineField({
        name: "text",
        type: "text",
        title: "Quote Text",
        description: "The quote to highlight in large typography",
        rows: 3,
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "attribution",
        type: "string",
        title: "Attribution (Optional)",
        description: "Who said this? (e.g. 'Donald Knuth')",
      }),
    ],
    preview: {
      select: { text: "text", attribution: "attribution" },
      prepare({ text, attribution }) {
        return {
          title: text
            ? `"${text.slice(0, 50)}${text.length > 50 ? "…" : ""}"`
            : "Pull Quote",
          subtitle: attribution ? `— ${attribution}` : "Pull Quote",
        };
      },
    },
  }),
  defineArrayMember({
    name: PORTABLE_TEXT_MEMBER_NAMES.videoEmbed,
    type: "object",
    title: "Video Embed",
    description: "Responsive YouTube or Vimeo video embed",
    icon: Play,
    fields: [
      defineField({
        name: "url",
        type: "url",
        title: "Video URL",
        description:
          "Paste a YouTube (youtube.com or youtu.be) or Vimeo (vimeo.com) video link",
        validation: (rule) =>
          rule.required().uri({ scheme: ["https", "http"] }),
      }),
      defineField({
        name: "caption",
        type: "string",
        title: "Caption (Optional)",
        description: "Optional caption shown beneath the video player",
      }),
      defineField({
        name: "autoPlay",
        type: "boolean",
        title: "Auto-play (Muted)",
        initialValue: false,
      }),
    ],
    preview: {
      select: { caption: "caption", url: "url" },
      prepare({ caption, url }) {
        return {
          title: caption || "Video Embed",
          subtitle: url || "No URL provided",
        };
      },
    },
  }),
  defineArrayMember({
    name: PORTABLE_TEXT_MEMBER_NAMES.tweetEmbed,
    type: "object",
    title: "Tweet / X Embed",
    description: "Embed an X / Twitter post by URL",
    icon: MessageCircle,
    fields: [
      defineField({
        name: "url",
        type: "url",
        title: "Tweet URL",
        description:
          "URL to the X/Twitter post (e.g. https://x.com/username/status/1234567890)",
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "caption",
        type: "string",
        title: "Fallback Note (Optional)",
      }),
    ],
    preview: {
      select: { url: "url", caption: "caption" },
      prepare({ url, caption }) {
        return {
          title: caption || "Tweet Embed",
          subtitle: url || "No URL",
        };
      },
    },
  }),
  defineArrayMember({
    name: PORTABLE_TEXT_MEMBER_NAMES.fileDownload,
    type: "object",
    title: "File Download",
    description: "A downloadable asset card (PDF, ZIP, source code, slides)",
    icon: Download,
    fields: [
      defineField({
        name: "file",
        type: "file",
        title: "File",
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "label",
        type: "string",
        title: "Button Label",
        description: "e.g. 'Download Paper (PDF)' or 'Get Starter Template'",
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "description",
        type: "string",
        title: "Description (Optional)",
        description: "Brief note about the file contents or format",
      }),
    ],
    preview: {
      select: { label: "label", filename: "file.asset.originalFilename" },
      prepare({ label, filename }) {
        return {
          title: label || "Downloadable File",
          subtitle: filename ? `File: ${filename}` : "File Download",
        };
      },
    },
  }),
  defineArrayMember({
    name: PORTABLE_TEXT_MEMBER_NAMES.mathBlock,
    type: "object",
    title: "Math (LaTeX)",
    description: "Render mathematical equations using LaTeX syntax",
    icon: Sigma,
    fields: [
      defineField({
        name: "latex",
        type: "text",
        title: "LaTeX Expression",
        description:
          "e.g. \\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}",
        rows: 3,
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "caption",
        type: "string",
        title: "Caption (Optional)",
        description: "e.g. 'Equation 1: Gauss's Law'",
      }),
    ],
    preview: {
      select: { latex: "latex", caption: "caption" },
      prepare({ latex, caption }) {
        return {
          title: caption || latex?.slice(0, 40) || "Math Block",
          subtitle: latex ? `LaTeX: ${latex.slice(0, 30)}` : "Empty",
        };
      },
    },
  }),
  defineArrayMember({
    name: PORTABLE_TEXT_MEMBER_NAMES.expandable,
    type: "object",
    title: "Expandable Section",
    description:
      "Collapsible accordion / details section for supplementary content",
    icon: ChevronDown,
    fields: [
      defineField({
        name: "summary",
        type: "string",
        title: "Summary / Title",
        description: "The clickable header always visible to the reader",
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "content",
        type: "array",
        title: "Hidden Content",
        description: "Revealed when clicked",
        of: [
          defineArrayMember({
            type: "block",
            styles: TABLE_CELL_BLOCK_STYLES,
            marks: PORTABLE_TEXT_MARKS,
          }),
        ],
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "defaultOpen",
        type: "boolean",
        title: "Open by Default",
        initialValue: false,
      }),
    ],
    preview: {
      select: { summary: "summary", defaultOpen: "defaultOpen" },
      prepare({ summary, defaultOpen }) {
        return {
          title: summary || "Expandable Section",
          subtitle: defaultOpen ? "Open by default" : "Collapsed",
        };
      },
    },
  }),
  defineArrayMember({
    name: PORTABLE_TEXT_MEMBER_NAMES.codeGroup,
    type: "object",
    title: "Code Group (Tabs)",
    description:
      "Multiple code files in a tabbed viewer (ideal for multi-file examples or before/after)",
    icon: Layers,
    fields: [
      defineField({
        name: "title",
        type: "string",
        title: "Group Title (Optional)",
        description: "Optional heading shown above the tab bar",
      }),
      defineField({
        name: "files",
        type: "array",
        title: "Code Files",
        validation: (rule) => rule.required().min(1),
        of: [
          defineArrayMember({
            type: "object",
            name: "codeFile",
            title: "File",
            fields: [
              defineField({
                name: "filename",
                type: "string",
                title: "Filename / Tab Label",
                description: "e.g. 'page.tsx' or 'After'",
                validation: (rule) => rule.required(),
              }),
              defineField({
                name: "language",
                type: "string",
                title: "Language",
                options: { list: CODE_LANGUAGES },
                initialValue: "ts",
              }),
              defineField({
                name: "code",
                type: "text",
                title: "Code",
                rows: 10,
                validation: (rule) => rule.required(),
              }),
              defineField({
                name: "highlightLines",
                type: "string",
                title: "Highlighted Lines (Optional)",
                description: "Comma-separated line numbers, e.g. '2,4-7'",
              }),
            ],
            preview: {
              select: { filename: "filename", language: "language" },
              prepare({ filename, language }) {
                return {
                  title: filename || "Untitled File",
                  subtitle: language || "code",
                };
              },
            },
          }),
        ],
      }),
    ],
    preview: {
      select: { title: "title", files: "files" },
      prepare({ title, files }) {
        const count = Array.isArray(files) ? files.length : 0;
        return {
          title: title || "Code Group",
          subtitle: `${count} file${count === 1 ? "" : "s"} tabbed`,
        };
      },
    },
  }),
  defineArrayMember({
    name: PORTABLE_TEXT_MEMBER_NAMES.playgroundEmbed,
    type: "object",
    title: "Code Playground Embed",
    description:
      "Live interactive sandbox (CodeSandbox, StackBlitz, or CodePen)",
    icon: Terminal,
    fields: [
      defineField({
        name: "url",
        type: "url",
        title: "Sandbox URL",
        description: "Paste the URL from CodeSandbox, StackBlitz, or CodePen",
        validation: (rule) => rule.required().uri({ scheme: ["https"] }),
      }),
      defineField({
        name: "title",
        type: "string",
        title: "Title",
        description: "Title / description of the sandbox for accessibility",
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "provider",
        type: "string",
        title: "Provider",
        options: {
          list: [
            { title: "CodeSandbox", value: "codesandbox" },
            { title: "StackBlitz", value: "stackblitz" },
            { title: "CodePen", value: "codepen" },
          ],
          layout: "radio",
        },
        initialValue: "codesandbox",
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "height",
        type: "number",
        title: "Height (px)",
        initialValue: 500,
        validation: (rule) => rule.min(250).max(900),
      }),
    ],
    preview: {
      select: { title: "title", provider: "provider", url: "url" },
      prepare({ title, provider, url }) {
        return {
          title: title || "Playground Embed",
          subtitle: `${provider || "Sandbox"}: ${url || ""}`,
        };
      },
    },
  }),
];

export const portableTextMemberTypes = Object.values(
  PORTABLE_TEXT_MEMBER_NAMES
);

export type PortableTextMemberType = (typeof portableTextMemberTypes)[number];

export const definePortableTextField = (
  memberTypes: PortableTextMemberType[],
  options?: {
    description?: string;
    group?: string[] | string;
    hidden?: ConditionalProperty;
    name?: string;
    title?: string;
  }
) => {
  if (memberTypes.length === 0) {
    throw new Error(
      "definePortableTextField requires at least one member type"
    );
  }

  const invalidMemberTypes = memberTypes.filter(
    (type) => !portableTextMemberTypes.includes(type)
  );
  if (invalidMemberTypes.length > 0) {
    throw new Error(
      `definePortableTextField received unsupported member types: ${invalidMemberTypes.join(", ")}`
    );
  }

  const { description = "", hidden, name = "richText" } = options ?? {};
  const selectedMembers = richTextMembers.filter(
    (member) => member.name && memberTypes.includes(member.name)
  );

  return defineField({
    ...options,
    name,
    type: "array",
    description,
    hidden,
    of: selectedMembers,
  });
};
