import { featuredWritingToMarkdown } from "./markdown";

test("featuredWritingToMarkdown returns empty string for empty block", () => {
  expect(featuredWritingToMarkdown({}, {})).toBe("");
});

test("featuredWritingToMarkdown renders post titles as markdown headings", () => {
  const result = featuredWritingToMarkdown(
    {
      title: "Best Essays",
      posts: [
        {
          title: "Architecture Patterns",
          description: "Clean composable systems.",
          category: "Engineering",
          slug: "/blog/architecture-patterns",
          readTime: 6,
        },
      ],
    },
    {}
  );

  expect(result).toContain("## Best Essays");
  expect(result).toContain(
    "### [Architecture Patterns](/blog/architecture-patterns)"
  );
  expect(result).toContain("Category: Engineering | 6 min read");
  expect(result).toContain("Clean composable systems.");
});
