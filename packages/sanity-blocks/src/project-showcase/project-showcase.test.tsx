import { renderToStaticMarkup } from "react-dom/server";
import { ProjectShowcase } from "./index";

test("ProjectShowcase renders title and project cards", () => {
  const html = renderToStaticMarkup(
    <ProjectShowcase
      eyebrow="Craft"
      title="Recent Projects"
      items={[
        {
          _key: "p1",
          title: "HyperBlog",
          description: "A fast personal publication",
          category: "Open Source",
          status: "active",
          tags: ["Next.js", "Sanity"],
          liveUrl: "https://hyperblog.dev",
        },
      ]}
    />
  );

  expect(html).toMatch(/Recent Projects/);
  expect(html).toMatch(/HyperBlog/);
  expect(html).toMatch(/A fast personal publication/);
  expect(html).toMatch(/Active/);
});
