import { renderToStaticMarkup } from "react-dom/server";
import { getPlaygroundEmbedUrl } from "./playground-embed-url";
import { RichText } from "./rich-text";
import { getVideoEmbedUrl } from "./video-embed-url";

describe("getVideoEmbedUrl", () => {
  test("parses YouTube watch URLs", () => {
    expect(
      getVideoEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    ).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
    );
  });

  test("parses YouTube short URLs (youtu.be)", () => {
    expect(getVideoEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
    );
  });

  test("parses YouTube Shorts", () => {
    expect(getVideoEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
    );
  });

  test("parses Vimeo URLs", () => {
    expect(getVideoEmbedUrl("https://vimeo.com/123456789")).toBe(
      "https://player.vimeo.com/video/123456789"
    );
  });

  test("returns null for invalid or empty URLs", () => {
    expect(getVideoEmbedUrl("")).toBeNull();
    expect(getVideoEmbedUrl(null)).toBeNull();
    expect(getVideoEmbedUrl("not-a-url")).toBeNull();
  });
});

describe("getPlaygroundEmbedUrl", () => {
  test("transforms CodeSandbox public URLs to embed URLs", () => {
    expect(
      getPlaygroundEmbedUrl(
        "https://codesandbox.io/s/new-sandbox-123",
        "codesandbox"
      )
    ).toBe(
      "https://codesandbox.io/embed/new-sandbox-123?fontsize=14&hidenavigation=1&theme=dark"
    );
  });

  test("transforms StackBlitz URLs to embed URLs", () => {
    expect(
      getPlaygroundEmbedUrl(
        "https://stackblitz.com/edit/vitejs-vite-123",
        "stackblitz"
      )
    ).toBe("https://stackblitz.com/edit/vitejs-vite-123?embed=1&view=preview");
  });

  test("transforms CodePen URLs to embed URLs", () => {
    expect(
      getPlaygroundEmbedUrl("https://codepen.io/author/pen/abcXYZ", "codepen")
    ).toBe(
      "https://codepen.io/author/embed/abcXYZ?default-tab=html,result&theme-id=dark"
    );
  });
});

describe("RichText component renderers", () => {
  test("renders divider block", () => {
    const html = renderToStaticMarkup(
      <RichText
        richText={[
          {
            _type: "divider",
            style: "dots",
          },
        ]}
      />
    );
    expect(html).toContain("· · ·");
  });

  test("renders pullQuote block", () => {
    const html = renderToStaticMarkup(
      <RichText
        richText={[
          {
            _type: "pullQuote",
            text: "Programs must be written for people to read.",
            attribution: "Hal Abelson",
          },
        ]}
      />
    );
    expect(html).toContain("Programs must be written for people to read.");
    expect(html).toContain("Hal Abelson");
  });

  test("renders expandable accordion block", () => {
    const html = renderToStaticMarkup(
      <RichText
        richText={[
          {
            _type: "expandable",
            summary: "Advanced Implementation Details",
            content: [
              {
                _type: "block",
                style: "normal",
                children: [{ _type: "span", text: "Under the hood details." }],
              },
            ],
          },
        ]}
      />
    );
    expect(html).toContain("Advanced Implementation Details");
    expect(html).toContain("Under the hood details.");
  });

  test("renders mathBlock with KaTeX", () => {
    const html = renderToStaticMarkup(
      <RichText
        richText={[
          {
            _type: "mathBlock",
            latex: "a^2 + b^2 = c^2",
            caption: "Pythagorean Theorem",
          },
        ]}
      />
    );
    expect(html).toContain("katex");
    expect(html).toContain("Pythagorean Theorem");
  });
});
