import { cn } from "@workspace/tailwind-config/utils";
import { CopyButton } from "./copy-button";

// Short label shown in the language tile.
const BADGE_MAP: Record<string, string> = {
  ts: "TS",
  tsx: "TSX",
  js: "JS",
  jsx: "JSX",
  py: "PY",
  python: "PY",
  rust: "RS",
  rs: "RS",
  go: "GO",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  json: "{ }",
  yaml: "YML",
  yml: "YML",
  md: "MD",
  markdown: "MD",
  bash: "SH",
  sh: "SH",
  zsh: "ZSH",
  dockerfile: "DOCKER",
  groq: "GRQ",
};

export interface CodeBlockValue {
  code?: string | null;
  language?: string | null;
  filename?: string | null;
  highlightLines?: string | null;
}

function parseRange(rangeStr: string, set: Set<number>): void {
  const [startStr, endStr] = rangeStr.split("-");
  const start = Number.parseInt(startStr ?? "", 10);
  const end = Number.parseInt(endStr ?? "", 10);
  if (!Number.isNaN(start) && !Number.isNaN(end)) {
    for (let i = start; i <= end; i++) {
      set.add(i);
    }
  }
}

function parseHighlightedLines(raw?: string | null): Set<number> {
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

export function CodeBlock({
  code,
  language,
  filename,
  highlightLines,
}: Readonly<CodeBlockValue>) {
  if (!code) {
    return null;
  }

  const badge = (language && BADGE_MAP[language]) || "TXT";
  const highlightedSet = parseHighlightedLines(highlightLines);

  const lines = code.replace(/\n$/, "").split("\n");
  const lineCount = lines.length;

  return (
    <figure className="site-chassis not-prose relative my-6 overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-3 border-border/40 border-b bg-foreground/[0.02] px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="grid h-5.5 min-w-6 place-items-center rounded border border-foreground/10 bg-foreground/5 px-1.5 font-bold font-mono text-[9px] text-foreground/80 tracking-wider uppercase"
          >
            {badge}
          </span>
          {filename ? (
            <span className="truncate font-mono text-muted-foreground text-xs">
              {filename}
            </span>
          ) : null}
        </div>
        <CopyButton code={code} />
      </div>
      <div className="recessed-well m-2 overflow-hidden rounded-xl text-sm leading-relaxed">
        <div className="rich-code flex p-2 font-mono">
          <div
            aria-hidden="true"
            className="rich-code-gutter select-none font-mono text-muted-foreground/40"
          >
            {Array.from({ length: lineCount }, (_, index) => {
              const lineNum = index + 1;
              const isHighlighted = highlightedSet.has(lineNum);
              return (
                <span
                  className={cn(
                    isHighlighted && "font-semibold text-foreground"
                  )}
                  key={lineNum}
                >
                  {lineNum}
                </span>
              );
            })}
          </div>
          {/* No tabIndex: browsers make an overflowing scroll container
              keyboard-focusable on their own, so arrow keys can still pan a long
              line into view (WCAG 2.1.1). */}
          <pre className="rich-code-pre overflow-x-auto font-mono">
            {highlightedSet.size > 0 ? (
              <code className="font-mono">
                {lines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isHighlighted = highlightedSet.has(lineNum);
                  return (
                    <span
                      className={cn(
                        "block",
                        isHighlighted &&
                          "-mx-4 bg-foreground/10 px-4 font-medium"
                      )}
                      key={`line-${lineNum}-${line.slice(0, 8)}`}
                    >
                      {line || "\n"}
                    </span>
                  );
                })}
              </code>
            ) : (
              <code className="font-mono">{code}</code>
            )}
          </pre>
        </div>
      </div>
    </figure>
  );
}
