import { renderToStaticMarkup } from "react-dom/server";
import { CalloutQuote } from "./index";

test("CalloutQuote renders quote and author citation", () => {
  const html = renderToStaticMarkup(
    <CalloutQuote
      author="Alan Kay"
      quote="The best way to predict the future is to invent it."
      source="PARC"
    />
  );

  expect(html).toMatch(/The best way to predict the future is to invent it/);
  expect(html).toMatch(/Alan Kay/);
  expect(html).toMatch(/PARC/);
});
