import { renderToStaticMarkup } from "react-dom/server";
import { FeaturedWriting } from "./index";

test("FeaturedWriting renders post list with title and meta", () => {
  const html = renderToStaticMarkup(
    <FeaturedWriting
      eyebrow="Writing"
      title="Selected Essays"
      posts={[
        {
          _id: "p1",
          title: "Designing for Humans",
          description: "Principles of great interfaces",
          category: "Design",
          readTime: 4,
          publishedAt: "2026-03-15",
          slug: "/blog/designing-for-humans",
        },
      ]}
    />
  );

  expect(html).toMatch(/Selected Essays/);
  expect(html).toMatch(/Designing for Humans/);
  expect(html).toMatch(/Design/);
  expect(html).toMatch(/4 min read/);
});
