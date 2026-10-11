import type { CSSProperties } from "react";
import type { HighlighterCore, LanguageRegistration } from "shiki/core";

export type HighlightToken = {
  readonly content: string;
  readonly style?: CSSProperties;
};

type GrammarModule = { default: LanguageRegistration[] };

// Studio language value → the Shiki grammar that colours it. Values missing
// here (`groq`, `normal`, anything stored before the list) render as plain
// text rather than guessing a grammar.
const GRAMMARS: Record<string, () => Promise<GrammarModule>> = {
  ts: () => import("shiki/dist/langs/typescript.mjs"),
  tsx: () => import("shiki/dist/langs/tsx.mjs"),
  js: () => import("shiki/dist/langs/javascript.mjs"),
  jsx: () => import("shiki/dist/langs/jsx.mjs"),
  python: () => import("shiki/dist/langs/python.mjs"),
  py: () => import("shiki/dist/langs/python.mjs"),
  rust: () => import("shiki/dist/langs/rust.mjs"),
  go: () => import("shiki/dist/langs/go.mjs"),
  sql: () => import("shiki/dist/langs/sql.mjs"),
  html: () => import("shiki/dist/langs/html.mjs"),
  css: () => import("shiki/dist/langs/css.mjs"),
  json: () => import("shiki/dist/langs/json.mjs"),
  yaml: () => import("shiki/dist/langs/yaml.mjs"),
  yml: () => import("shiki/dist/langs/yaml.mjs"),
  md: () => import("shiki/dist/langs/markdown.mjs"),
  markdown: () => import("shiki/dist/langs/markdown.mjs"),
  bash: () => import("shiki/dist/langs/shellscript.mjs"),
  sh: () => import("shiki/dist/langs/shellscript.mjs"),
  zsh: () => import("shiki/dist/langs/shellscript.mjs"),
  dockerfile: () => import("shiki/dist/langs/docker.mjs"),
};

const THEMES = { light: "github-light", dark: "github-dark-dimmed" } as const;

let highlighterPromise: Promise<HighlighterCore> | null = null;
const loadedGrammars = new Map<string, Promise<string>>();
const tokenCache = new Map<string, HighlightToken[][]>();

// One highlighter for the whole page, created on first use. The JS regex
// engine avoids shipping Oniguruma's WASM; grammars load one by one as blocks
// ask for them, so a page of TypeScript never downloads the Rust grammar.
function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
    ]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) =>
      createHighlighterCore({
        themes: [
          import("shiki/dist/themes/github-light.mjs"),
          import("shiki/dist/themes/github-dark-dimmed.mjs"),
        ],
        langs: [],
        engine: createJavaScriptRegexEngine(),
      })
    );
    // A failed chunk load must not poison every later block on the page.
    highlighterPromise.catch(() => {
      highlighterPromise = null;
    });
  }
  return highlighterPromise;
}

async function ensureGrammar(
  highlighter: HighlighterCore,
  language: string
): Promise<string | null> {
  const loader = GRAMMARS[language];
  if (!loader) {
    return null;
  }
  let pending = loadedGrammars.get(language);
  if (!pending) {
    pending = loader().then(async (module) => {
      await highlighter.loadLanguage(module.default);
      // A grammar module can register embedded languages too; the last entry
      // is the one the module is named after.
      return module.default.at(-1)?.name ?? language;
    });
    loadedGrammars.set(language, pending);
  }
  return pending;
}

export function hasGrammar(language?: string | null): boolean {
  return Boolean(language && GRAMMARS[language]);
}

export function cachedTokens(
  code: string,
  language?: string | null
): HighlightToken[][] | null {
  return tokenCache.get(`${language}\u0000${code}`) ?? null;
}

/**
 * Tokenizes `code` into lines of coloured runs. Each run carries both themes
 * as `--shiki-light` / `--shiki-dark` custom properties; `globals.css` picks
 * one from the `.dark` class, so the theme toggle recolours without a re-run.
 * Resolves `null` for languages without a grammar.
 */
export async function highlightCode(
  code: string,
  language?: string | null
): Promise<HighlightToken[][] | null> {
  if (!(language && hasGrammar(language))) {
    return null;
  }
  const key = `${language}\u0000${code}`;
  const cached = tokenCache.get(key);
  if (cached) {
    return cached;
  }
  const highlighter = await getHighlighter();
  const grammar = await ensureGrammar(highlighter, language);
  if (!grammar) {
    return null;
  }
  const { tokens } = highlighter.codeToTokens(code, {
    lang: grammar,
    themes: THEMES,
    defaultColor: false,
  });
  const lines = tokens.map((line) =>
    line.map((token) => ({
      content: token.content,
      style: token.htmlStyle as CSSProperties | undefined,
    }))
  );
  tokenCache.set(key, lines);
  return lines;
}
