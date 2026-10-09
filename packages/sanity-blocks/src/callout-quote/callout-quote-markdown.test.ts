import { calloutQuoteToMarkdown } from "./markdown";

test("calloutQuoteToMarkdown returns empty string for empty block", () => {
  expect(calloutQuoteToMarkdown({}, {})).toBe("");
});

test("calloutQuoteToMarkdown renders blockquote with citation", () => {
  const result = calloutQuoteToMarkdown(
    {
      quote:
        "Simple things should be simple, complex things should be possible.",
      author: "Alan Kay",
    },
    {}
  );

  expect(result).toContain("> Simple things should be simple");
  expect(result).toContain("> — Alan Kay");
});
