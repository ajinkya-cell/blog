import { projectShowcaseToMarkdown } from "./markdown";

test("projectShowcaseToMarkdown returns empty string for empty block", () => {
  expect(projectShowcaseToMarkdown({}, {})).toBe("");
});

test("projectShowcaseToMarkdown renders projects as markdown headings and links", () => {
  const result = projectShowcaseToMarkdown(
    {
      title: "Featured Works",
      items: [
        {
          title: "MicroEngine",
          description: "High speed runtime.",
          category: "Tooling",
          year: "2026",
          liveUrl: "https://micro.dev",
        },
      ],
    },
    {}
  );

  expect(result).toContain("## Featured Works");
  expect(result).toContain("### MicroEngine (2026)");
  expect(result).toContain("High speed runtime.");
  expect(result).toContain("[Live Site](https://micro.dev)");
});
