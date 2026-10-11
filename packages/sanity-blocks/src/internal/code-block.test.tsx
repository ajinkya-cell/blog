import { renderToStaticMarkup } from "react-dom/server";

import { CodeBlock } from "./code-block";
import { CodeGroupBlock } from "./code-group-block";

describe("CodeBlock", () => {
  test("renders a window with filename, line count and every line", () => {
    const html = renderToStaticMarkup(
      <CodeBlock
        code={"const a = 1;\nconst b = 2;\n"}
        filename="app/page.tsx"
        language="tsx"
      />
    );
    expect(html).toContain("app/page.tsx");
    expect(html).toContain("2 lines");
    expect(html).toContain("const a = 1;");
    expect(html).toContain("const b = 2;");
    expect(html).toContain("Copy code to clipboard");
  });

  test("falls back to the language name without a filename", () => {
    const html = renderToStaticMarkup(
      <CodeBlock code="SELECT 1;" language="sql" />
    );
    expect(html).toContain("SQL");
  });

  test("marks highlighted lines", () => {
    const html = renderToStaticMarkup(
      <CodeBlock code={"a\nb\nc"} highlightLines="2" language="ts" />
    );
    expect(html.match(/bg-foreground\/\[0\.07\]/g)).toHaveLength(1);
  });

  test("renders a one-line shell install as a package-manager switcher", () => {
    const html = renderToStaticMarkup(
      <CodeBlock code="npm i next-sanity" language="bash" />
    );
    expect(html).toContain('role="tablist"');
    expect(html).toContain("npm install next-sanity");
    expect(html).toContain("pnpm");
    expect(html).toContain("bun");
  });
});

describe("CodeGroupBlock", () => {
  test("renders file tabs in the window header and the first file", () => {
    const html = renderToStaticMarkup(
      <CodeGroupBlock
        files={[
          {
            _key: "a",
            code: "export const a = 1;",
            filename: "a.ts",
            language: "ts",
          },
          {
            _key: "b",
            code: "export const b = 2;",
            filename: "b.ts",
            language: "ts",
          },
        ]}
        title="Two files"
      />
    );
    expect(html).toContain("a.ts");
    expect(html).toContain("b.ts");
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain("export const a = 1;");
    expect(html).not.toContain("export const b = 2;");
  });
});
