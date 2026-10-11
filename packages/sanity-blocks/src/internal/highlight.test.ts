import { cachedTokens, hasGrammar, highlightCode } from "./highlight";

describe("highlightCode", () => {
  test("colours each line with both themes", async () => {
    const code = 'const a = "x";\n// note';
    const lines = await highlightCode(code, "tsx");

    expect(lines).toHaveLength(2);
    expect(lines?.[0]?.map((token) => token.content).join("")).toBe(
      'const a = "x";'
    );
    const style = lines?.[0]?.[0]?.style as Record<string, string> | undefined;
    expect(style?.["--shiki-light"]).toMatch(/^#/);
    expect(style?.["--shiki-dark"]).toMatch(/^#/);
    // Served from the cache on the next ask, so a re-shown tab skips a frame.
    expect(cachedTokens(code, "tsx")).toBe(lines);
  });

  test("leaves languages without a grammar as plain text", async () => {
    expect(hasGrammar("groq")).toBe(false);
    expect(hasGrammar("normal")).toBe(false);
    expect(await highlightCode("*[_type == 'post']", "groq")).toBeNull();
  });
});
