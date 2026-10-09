import crypto from "crypto";

const projectId = "a2vuctp3";
const dataset = "production";
// Write token from .env.local
const token = "skmxAifAFULvXZeBQqyLDvm7EBZfSWIKMLcwL6bycZq4AZlwOBZmP3jBcyGpjE4P62qh8xHRHOwzx5UdT0EjFIGzKGVg9oGzmF7xHCxAvUPRbOxb7LKkjECjdFZB7wXqqaYR68qKmzj7zL4wTSg63hwM2U7nKFXf17wozQg2nOZJFI1pAlj8";

function key() {
  return crypto.randomBytes(6).toString("hex");
}

function makeParagraph(children, markDefs = []) {
  return {
    _key: key(),
    _type: "block",
    style: "normal",
    markDefs,
    children,
  };
}

function makeHeading(level, text) {
  return {
    _key: key(),
    _type: "block",
    style: level, // h2, h3, h4, h5, h6
    markDefs: [],
    children: [
      {
        _key: key(),
        _type: "span",
        text,
        marks: [],
      },
    ],
  };
}

function makeListItem(text, type = "bullet", marks = []) {
  return {
    _key: key(),
    _type: "block",
    style: "normal",
    listItem: type, // "bullet" or "number"
    markDefs: [],
    children: [
      {
        _key: key(),
        _type: "span",
        text,
        marks,
      },
    ],
  };
}

const docId = "blog-rich-text-showcase";

const richText = [
  // Intro paragraph
  makeParagraph([
    {
      _key: key(),
      _type: "span",
      text: "Welcome to the interactive ",
      marks: [],
    },
    {
      _key: key(),
      _type: "span",
      text: "Rich Text Design System & Component Showcase",
      marks: ["strong"],
    },
    {
      _key: key(),
      _type: "span",
      text: ". This post demonstrates ",
      marks: [],
    },
    {
      _key: key(),
      _type: "span",
      text: "every typography style, mark decorator, block element, code viewer, mathematical equation, and rich embed",
      marks: ["em"],
    },
    {
      _key: key(),
      _type: "span",
      text: " available across the reading platform. Use this article to evaluate visual harmony, line heights, contrast, spacing, and responsive behaviors.",
      marks: [],
    },
  ]),

  // Paragraph exercising all inline marks
  {
    _key: key(),
    _type: "block",
    style: "normal",
    markDefs: [
      {
        _key: "link1",
        _type: "customLink",
        type: "external",
        external: "https://nextjs.org",
        openInNewTab: true,
      },
      {
        _key: "link2",
        _type: "customLink",
        type: "internal",
        internal: {
          _type: "reference",
          _ref: "blog-architecture-long-lived-software",
        },
        openInNewTab: false,
      },
    ],
    children: [
      {
        _key: key(),
        _type: "span",
        text: "Here is a typography mark verification checklist: ",
        marks: [],
      },
      { _key: key(), _type: "span", text: "bold / strong text", marks: ["strong"] },
      { _key: key(), _type: "span", text: ", ", marks: [] },
      { _key: key(), _type: "span", text: "italicized emphasis", marks: ["em"] },
      { _key: key(), _type: "span", text: ", ", marks: [] },
      { _key: key(), _type: "span", text: "inlineCodeSnippet()", marks: ["code"] },
      { _key: key(), _type: "span", text: ", ", marks: [] },
      { _key: key(), _type: "span", text: "underlined text", marks: ["underline"] },
      { _key: key(), _type: "span", text: ", ", marks: [] },
      { _key: key(), _type: "span", text: "strikethrough text", marks: ["strike-through"] },
      { _key: key(), _type: "span", text: ", ", marks: [] },
      { _key: key(), _type: "span", text: "highlighted notation", marks: ["highlight"] },
      { _key: key(), _type: "span", text: ", an ", marks: [] },
      { _key: key(), _type: "span", text: "external link to Next.js ↗", marks: ["link1"] },
      { _key: key(), _type: "span", text: ", and an ", marks: [] },
      { _key: key(), _type: "span", text: "internal essay cross-reference", marks: ["link2"] },
      { _key: key(), _type: "span", text: ".", marks: [] },
    ],
  },

  // Divider: dots
  {
    _key: key(),
    _type: "divider",
    style: "dots",
  },

  // Section 1: Callouts
  makeHeading("h2", "1. Editorial Callouts & Notice Panels"),
  makeParagraph([
    {
      _key: key(),
      _type: "span",
      text: "Callout containers provide structured visual breaks for asides, warnings, tips, and highlighted quotes. All four semantic variants are demonstrated below:",
      marks: [],
    },
  ]),

  // Callout: info
  {
    _key: key(),
    _type: "callout",
    type: "info",
    title: "System Architecture Note",
    content: [
      {
        _key: key(),
        _type: "block",
        style: "normal",
        markDefs: [],
        children: [
          {
            _key: key(),
            _type: "span",
            text: "Informational callouts provide neutral context and background details. They feature a cool accent border with recessed background tone to keep reader focus aligned with the main narrative.",
            marks: [],
          },
        ],
      },
    ],
  },

  // Callout: tip
  {
    _key: key(),
    _type: "callout",
    type: "tip",
    title: "Performance Best Practice",
    content: [
      {
        _key: key(),
        _type: "block",
        style: "normal",
        markDefs: [],
        children: [
          {
            _key: key(),
            _type: "span",
            text: "Use Next.js 16 cache components with 'use cache' directives to cache data at function boundaries while maintaining dynamic client navigation.",
            marks: [],
          },
        ],
      },
    ],
  },

  // Callout: warning
  {
    _key: key(),
    _type: "callout",
    type: "warning",
    title: "Caution: Breaking Configuration Changes",
    content: [
      {
        _key: key(),
        _type: "block",
        style: "normal",
        markDefs: [],
        children: [
          {
            _key: key(),
            _type: "span",
            text: "Do not double-prefix slugs when constructing URL navigation paths. Slugs sourced from Sanity already include the leading forward slash and namespace segment.",
            marks: [],
          },
        ],
      },
    ],
  },

  // Callout: quote
  {
    _key: key(),
    _type: "callout",
    type: "quote",
    title: "Philosophical Axiom",
    content: [
      {
        _key: key(),
        _type: "block",
        style: "normal",
        markDefs: [],
        children: [
          {
            _key: key(),
            _type: "span",
            text: "“Simplicity is prerequisite for reliability.” — Edsger W. Dijkstra",
            marks: [],
          },
        ],
      },
    ],
  },

  // Divider: line
  {
    _key: key(),
    _type: "divider",
    style: "line",
  },

  // Section 2: Code Blocks & Code Groups
  makeHeading("h2", "2. Code Snippets & Multi-File Tabbed Groups"),
  makeParagraph([
    {
      _key: key(),
      _type: "span",
      text: "Code presentation supports single-file snippets with line highlights as well as tabbed multi-file code groups:",
      marks: [],
    },
  ]),

  // Single code block
  {
    _key: key(),
    _type: "code",
    filename: "revalidate-webhook.ts",
    language: "ts",
    highlightLines: "4-6,11",
    code: `import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { body } = await req.json();
  const tags = body?.tags ?? [];

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({ revalidated: true, count: tags.length });
}`,
  },

  makeHeading("h3", "Multi-File Code Group (Tabbed Viewer)"),
  makeParagraph([
    {
      _key: key(),
      _type: "span",
      text: "The CodeGroup component lets readers switch between related files, such as schema definitions and React view components:",
      marks: [],
    },
  ]),

  // Code Group block
  {
    _key: key(),
    _type: "codeGroup",
    title: "Component Scaffold Architecture",
    files: [
      {
        _key: key(),
        filename: "schema.ts",
        language: "ts",
        highlightLines: "3,7-9",
        code: `import { defineField, defineType } from "sanity";

export const mathBlock = defineType({
  name: "mathBlock",
  type: "object",
  title: "Math (LaTeX)",
  fields: [
    defineField({ name: "latex", type: "text", title: "LaTeX Formula" }),
    defineField({ name: "caption", type: "string", title: "Caption" }),
  ],
});`,
      },
      {
        _key: key(),
        filename: "math-renderer.tsx",
        language: "tsx",
        highlightLines: "6-8",
        code: `import katex from "katex";

export function MathBlock({ latex, caption }: { latex: string; caption?: string }) {
  const html = katex.renderToString(latex, { displayMode: true });
  return (
    <figure className="my-6 border border-border/40 p-4 rounded-xl text-center">
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {caption && <figcaption className="text-xs text-muted-foreground mt-2">{caption}</figcaption>}
    </figure>
  );
}`,
      },
      {
        _key: key(),
        filename: "groq-projection.groq",
        language: "groq",
        highlightLines: "2-3",
        code: `_type == "mathBlock" => {
  latex,
  caption
}`,
      },
    ],
  },

  // Divider: stars
  {
    _key: key(),
    _type: "divider",
    style: "stars",
  },

  // Section 3: Mathematical Formulations
  makeHeading("h2", "3. Mathematical Notation & LaTeX (KaTeX)"),
  makeParagraph([
    {
      _key: key(),
      _type: "span",
      text: "Engineers writing about algorithms, graphics, signal processing, or machine learning can embed display-mode LaTeX formulas rendered with KaTeX:",
      marks: [],
    },
  ]),

  // Math equation 1
  {
    _key: key(),
    _type: "mathBlock",
    latex: "e^{i\\pi} + 1 = 0",
    caption: "Equation 1: Euler's Identity linking analysis, trigonometry, and complex numbers",
  },

  // Math equation 2
  {
    _key: key(),
    _type: "mathBlock",
    latex: "\\mathcal{L}_{\\text{total}}(\\theta) = \\frac{1}{N} \\sum_{i=1}^N \\ell(f_\\theta(x_i), y_i) + \\frac{\\lambda}{2} \\|\\theta\\|_2^2",
    caption: "Equation 2: Regularized Empirical Risk Minimization Objective",
  },

  // Math equation 3
  {
    _key: key(),
    _type: "mathBlock",
    latex: "\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}, \\quad \\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}",
    caption: "Equation 3: Maxwell-Faraday & Ampère-Maxwell Field Equations",
  },

  // Section 4: Data Tables
  makeHeading("h2", "4. Structured Data Matrix & Tables"),
  makeParagraph([
    {
      _key: key(),
      _type: "span",
      text: "Tables render with clear borders, subtle alternating row backgrounds, and responsive horizontal overflow scrolling:",
      marks: [],
    },
  ]),

  // Table block
  {
    _key: key(),
    _type: "table",
    headerRows: 1,
    rows: [
      {
        _key: key(),
        _type: "row",
        cells: [
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "Rendering Paradigm", marks: ["strong"] }],
              },
            ],
          },
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "Data Freshness", marks: ["strong"] }],
              },
            ],
          },
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "TTFB / Latency", marks: ["strong"] }],
              },
            ],
          },
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "Cache Granularity", marks: ["strong"] }],
              },
            ],
          },
        ],
      },
      {
        _key: key(),
        _type: "row",
        cells: [
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "Static Site Generation (SSG)", marks: ["code"] }],
              },
            ],
          },
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "Build-time immutable", marks: [] }],
              },
            ],
          },
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "< 25ms (Edge CDN)", marks: [] }],
              },
            ],
          },
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "Entire Route", marks: [] }],
              },
            ],
          },
        ],
      },
      {
        _key: key(),
        _type: "row",
        cells: [
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "Incremental Static (ISR)", marks: ["code"] }],
              },
            ],
          },
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "Time-to-Live / Tag revalidated", marks: [] }],
              },
            ],
          },
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "< 35ms on hit", marks: [] }],
              },
            ],
          },
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "Route or Fetch level", marks: [] }],
              },
            ],
          },
        ],
      },
      {
        _key: key(),
        _type: "row",
        cells: [
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "Next.js 16 Cache Components", marks: ["code"] }],
              },
            ],
          },
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "Tag-driven on-demand", marks: [] }],
              },
            ],
          },
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "Instant shell + cached payload", marks: [] }],
              },
            ],
          },
          {
            _key: key(),
            _type: "cell",
            value: [
              {
                _key: key(),
                _type: "block",
                style: "normal",
                children: [{ _key: key(), _type: "span", text: "Per-component function scope", marks: ["strong"] }],
              },
            ],
          },
        ],
      },
    ],
  },

  // Section 5: Lists & Outline Hierarchy
  makeHeading("h2", "5. Lists & Heading Hierarchies"),
  makeHeading("h3", "3rd Level Subheading (H3)"),
  makeParagraph([
    {
      _key: key(),
      _type: "span",
      text: "Unordered (bullet) lists render with custom list markers and proportional spacing:",
      marks: [],
    },
  ]),
  makeListItem("Core foundational primitives must remain backwards compatible across releases"),
  makeListItem("Type safety guarantees prevent runtime schema drift between Sanity and Next.js"),
  makeListItem("Stega visual editing metadata only activates in authenticated draft mode sessions"),

  makeHeading("h4", "4th Level Subheading (H4)"),
  makeParagraph([
    {
      _key: key(),
      _type: "span",
      text: "Ordered (numbered) lists provide sequential instructional flows:",
      marks: [],
    },
  ]),
  makeListItem("Define schema types and GROQ projections in @workspace/sanity-blocks", "number"),
  makeListItem("Scaffold the React component with clean Tailwind CSS utility classes", "number"),
  makeListItem("Register serializers in portableText components and verify build integrity", "number"),

  makeHeading("h5", "5th Level Subheading (H5)"),
  makeParagraph([
    {
      _key: key(),
      _type: "span",
      text: "H5 and H6 levels provide micro-section anchors for technical specifications.",
      marks: [],
    },
  ]),
  makeHeading("h6", "6th Level Subheading (H6)"),
  makeParagraph([
    {
      _key: key(),
      _type: "span",
      text: "Terminal heading level for deep architectural notes and glossary terms.",
      marks: [],
    },
  ]),

  // Section 6: Pull Quote
  makeHeading("h2", "6. Editorial Pull Quotes"),
  {
    _key: key(),
    _type: "pullQuote",
    text: "A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable.",
    attribution: "Leslie Lamport",
  },

  // Section 7: Expandable Accordion
  makeHeading("h2", "7. Collapsible Deep-Dives (Expandable Section)"),
  {
    _key: key(),
    _type: "expandable",
    summary: "Click to expand: How GROQ projections synchronize with React TypeGen",
    defaultOpen: true,
    content: [
      {
        _key: key(),
        _type: "block",
        style: "normal",
        markDefs: [],
        children: [
          {
            _key: key(),
            _type: "span",
            text: "When you run Sanity TypeGen, it parses every defineQuery invocation in packages/sanity/src/query.ts and generates strictly typed interfaces in sanity.types.ts. This ensures runtime fetch calls match compile-time component props perfectly.",
            marks: [],
          },
        ],
      },
    ],
  },
  {
    _key: key(),
    _type: "expandable",
    summary: "Click to expand: Cache tagging and Presentation live updates",
    defaultOpen: false,
    content: [
      {
        _key: key(),
        _type: "block",
        style: "normal",
        markDefs: [],
        children: [
          {
            _key: key(),
            _type: "span",
            text: "next-sanity attaches query sync tags to each response. When an editor edits text in Sanity Studio, Sanity Live broadcasts an invalidation webhook to revalidateSyncTags, keeping preview and live views synchronized.",
            marks: [],
          },
        ],
      },
    ],
  },

  // Section 8: Image Block
  makeHeading("h2", "8. Inline Figures & Media Images"),
  makeParagraph([
    {
      _key: key(),
      _type: "span",
      text: "Inline figures include automatic WebP format conversion, responsive srcset calculation, and styled captions:",
      marks: [],
    },
  ]),
  {
    _key: key(),
    _type: "image",
    asset: {
      _type: "reference",
      _ref: "image-704bc8e4fd8c7dceae51cf095f26359e22317963-1200x800-jpg",
    },
    alt: "System Architecture & Engineering Diagrams",
    caption: "Figure 1: High-level architectural pipeline for static cache components and on-demand live revalidation.",
  },

  // Section 9: Video & Social Embeds
  makeHeading("h2", "9. Video & Interactive Sandbox Embeds"),
  makeParagraph([
    {
      _key: key(),
      _type: "span",
      text: "Media embeds provide responsive 16:9 aspect ratio containers for YouTube/Vimeo videos and external playgrounds:",
      marks: [],
    },
  ]),

  // Video embed
  {
    _key: key(),
    _type: "videoEmbed",
    url: "https://www.youtube.com/watch?v=k5yq_lPzE5k",
    caption: "Video 1: Keynote presentation on Next.js App Router Architecture & React Server Components",
    autoPlay: false,
  },

  // Tweet embed
  {
    _key: key(),
    _type: "tweetEmbed",
    url: "https://x.com/nextjs/status/1881734567890",
    caption: "Release bulletin from the core engineering team.",
  },

  // Playground embed
  {
    _key: key(),
    _type: "playgroundEmbed",
    provider: "codesandbox",
    url: "https://codesandbox.io/embed/new",
    title: "Interactive CodeSandbox Playground",
    height: 420,
  },

  // Section 10: Conclusion
  makeHeading("h2", "10. Conclusion & Design System Verification"),
  makeParagraph([
    {
      _key: key(),
      _type: "span",
      text: "Every component presented above is styled using the project's monochrome aesthetic, custom typography tokens, and recessed-well border patterns. Use this post to verify contrast ratios, margins, and layout behavior across device widths.",
      marks: [],
    },
  ]),
];

async function seedBlog() {
  const document = {
    _id: docId,
    _type: "blog",
    title: "The Anatomy of Modern Engineering Writing: A Rich Text Component Showcase",
    slug: {
      _type: "slug",
      current: "/blog/rich-text-component-showcase",
    },
    publishedAt: "2026-10-07",
    category: "nextjs",
    tags: ["design-system", "rich-text", "components", "nextjs", "katex"],
    readTime: 8,
    series: "Engineering Craft",
    showTableOfContents: true,
    description: "An exhaustive demonstration of every rich text component, typography style, code viewer, mathematical notation, table, callout, and media embed supported by the blog platform.",
    image: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: "image-b5dc1df487a0801fed5e5d7218ef5d379c667eca-1200x799-jpg",
      },
      alt: "Rich Text Design System & Component Showcase",
    },
    richText,
    seoNoIndex: false,
    seoHideFromLists: false,
  };

  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/mutate/${dataset}?returnDocuments=true`;
  const mutations = [
    {
      createOrReplace: document,
    },
  ];

  console.log("Submitting mutation to Sanity...");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mutations }),
  });

  const data = await res.json();
  if (data.error) {
    console.error("Mutation failed:", data.error);
    process.exit(1);
  }

  console.log("Success! Created/Updated document:", data.results?.[0]?.id);
}

seedBlog().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
