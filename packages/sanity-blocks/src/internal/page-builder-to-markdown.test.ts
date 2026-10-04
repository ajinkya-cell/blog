import {
  type MarkdownBlock,
  pageBuilderToMarkdown,
} from "@workspace/sanity-blocks/internal/page-builder-to-markdown";

const para = (text: string) => [
  { _type: "block", style: "normal", children: [{ _type: "span", text }] },
];

test("returns empty string for missing input", () => {
  expect(pageBuilderToMarkdown(undefined)).toBe("");
  expect(pageBuilderToMarkdown(null)).toBe("");
  expect(pageBuilderToMarkdown([])).toBe("");
});

test("serializes a personal hero block as semantic markdown", () => {
  const md = pageBuilderToMarkdown([
    {
      _type: "personalHero",
      greeting: "Hello, I am Alex",
      statusPill: "Active",
      tagline: "Software builder",
      bio: para("I write about technology."),
      buttons: [{ _key: "b1", text: "Writing", href: "/blog" }],
    },
  ]);

  expect(md).toContain("**Active**");
  expect(md).toContain("# Hello, I am Alex");
  expect(md).toContain("*Software builder*");
  expect(md).toContain("I write about technology.");
  expect(md).toContain("- [Writing](/blog)");
  expect(md).not.toMatch(/<[A-Za-z]/);
});

test("serializes hero with buttons as markdown links", () => {
  const md = pageBuilderToMarkdown([
    {
      _type: "hero",
      badge: "New",
      title: "Welcome",
      richText: para("Intro copy."),
      buttons: [
        { _key: "b1", text: "Get started", href: "/start" },
        { _key: "b2", text: "Broken", href: "#" },
      ],
    },
  ]);

  expect(md).toContain("## Welcome");
  expect(md).toContain("Intro copy.");
  expect(md).toContain("- [Get started](/start)");
  expect(md).toContain("- Broken");
});

test("serializes project showcase as nested headings and links", () => {
  const md = pageBuilderToMarkdown([
    {
      _type: "projectShowcase",
      title: "Selected Projects",
      items: [
        {
          _key: "p1",
          title: "Blog Engine",
          description: "Fast writing tool.",
          category: "Tool",
          year: "2026",
          liveUrl: "https://engine.dev",
        },
      ],
    },
  ]);

  expect(md).toContain("## Selected Projects");
  expect(md).toContain("### Blog Engine (2026)");
  expect(md).toContain("Fast writing tool.");
  expect(md).toContain("[Live Site](https://engine.dev)");
});

test("serializes subscribe newsletter without form markup", () => {
  const md = pageBuilderToMarkdown([
    {
      _type: "subscribeNewsletter",
      title: "Stay in the loop",
      subTitle: para("Subscribe for updates."),
      helperText: para("No spam."),
    },
  ]);

  expect(md).toContain("## Stay in the loop");
  expect(md).toContain("Subscribe for updates.");
  expect(md).toContain("No spam.");
  expect(md).not.toMatch(/<(form|input|button)/i);
});

test("unknown blocks contribute nothing", () => {
  const md = pageBuilderToMarkdown([
    { _type: "someFutureBlock", title: "Ignore me" } as MarkdownBlock,
    { _type: "richTextBlock", title: "Kept", richText: para("Body.") },
  ]);

  expect(md).not.toContain("Ignore me");
  expect(md).toContain("## Kept");
  expect(md).toContain("Body.");
});

test("separates blocks with a blank line", () => {
  const md = pageBuilderToMarkdown([
    { _type: "richTextBlock", title: "One" },
    { _type: "richTextBlock", title: "Two" },
  ]);

  expect(md).toBe("## One\n\n## Two");
});
