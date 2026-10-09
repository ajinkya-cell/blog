import { renderToStaticMarkup } from "react-dom/server";
import { PersonalHero } from "./index";

test("PersonalHero renders primary greeting and tagline", () => {
  const html = renderToStaticMarkup(
    <PersonalHero
      greeting="Hey, I'm Alex"
      statusPill="🟢 Available"
      tagline="Software builder & writer"
      buttons={[{ _key: "b1", href: "/blog", text: "Read Essays" }]}
    />
  );

  expect(html).toMatch(/Hey, I&#x27;m Alex|Hey, I'm Alex/);
  expect(html).toMatch(
    /Software builder &amp; writer|Software builder & writer/
  );
  expect(html).toMatch(/Read Essays/);
  expect(html).toMatch(/Available/);
});
