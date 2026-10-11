// Pure helpers shared by the server-rendered `CodeBlock` and the client code
// window. Kept out of `code-window.tsx`: a server component cannot call a
// function exported from a "use client" module.

// Human label for the header when a block has no filename.
export const LANGUAGE_LABELS: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  jsx: "JSX",
  py: "Python",
  python: "Python",
  rust: "Rust",
  rs: "Rust",
  go: "Go",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  md: "Markdown",
  markdown: "Markdown",
  bash: "Terminal",
  sh: "Terminal",
  zsh: "Terminal",
  dockerfile: "Dockerfile",
  groq: "GROQ",
};

export function languageLabel(language?: string | null): string {
  return (language && LANGUAGE_LABELS[language]) || "Plain text";
}

function parseRange(rangeStr: string, set: Set<number>): void {
  const [startStr, endStr] = rangeStr.split("-");
  const start = Number.parseInt(startStr ?? "", 10);
  const end = Number.parseInt(endStr ?? "", 10);
  if (!(Number.isNaN(start) || Number.isNaN(end))) {
    for (let i = start; i <= end; i++) {
      set.add(i);
    }
  }
}

export function parseHighlightedLines(raw?: string | null): Set<number> {
  const highlighted = new Set<number>();
  if (!raw) {
    return highlighted;
  }
  for (const part of raw.split(",").map((s) => s.trim())) {
    if (part.includes("-")) {
      parseRange(part, highlighted);
    } else {
      const line = Number.parseInt(part, 10);
      if (!Number.isNaN(line)) {
        highlighted.add(line);
      }
    }
  }
  return highlighted;
}

export function splitCodeLines(code: string): string[] {
  return code.replace(/\n$/, "").split("\n");
}
