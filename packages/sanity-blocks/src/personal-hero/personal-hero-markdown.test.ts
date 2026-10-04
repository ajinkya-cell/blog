import { personalHeroToMarkdown } from "./markdown";

const para = (text: string) => [
  {
    _type: "block",
    style: "normal",
    children: [{ _type: "span", text }],
  },
];

test("personalHeroToMarkdown returns empty string for empty block", () => {
  expect(personalHeroToMarkdown({}, {})).toBe("");
});

test("personalHeroToMarkdown renders headline, tagline, and bio", () => {
  const result = personalHeroToMarkdown(
    {
      statusPill: "Active",
      greeting: "Welcome to my corner",
      tagline: "Building software",
      bio: para("I write about technology."),
    },
    {}
  );

  expect(result).toContain("**Active**");
  expect(result).toContain("# Welcome to my corner");
  expect(result).toContain("*Building software*");
  expect(result).toContain("I write about technology.");
});

test("personalHeroToMarkdown renders buttons", () => {
  const result = personalHeroToMarkdown(
    {
      greeting: "Hi",
      buttons: [
        { _key: "b1", text: "Articles", href: "/blog" },
        { _key: "b2", text: "Projects", href: "/projects" },
      ],
    },
    {}
  );

  expect(result).toContain("- [Articles](/blog)");
  expect(result).toContain("- [Projects](/projects)");
});

test("personalHeroToMarkdown emits no HTML tags", () => {
  const result = personalHeroToMarkdown(
    {
      greeting: "Hello",
      bio: para("Personal intro."),
    },
    {}
  );

  expect(result).not.toMatch(/<[A-Za-z]/);
});
