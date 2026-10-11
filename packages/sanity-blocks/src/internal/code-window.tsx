"use client";

import { cn } from "@workspace/tailwind-config/utils";
import { type ReactNode, useEffect, useState } from "react";

import { parseHighlightedLines, splitCodeLines } from "./code-lines";
import {
  cachedTokens,
  type HighlightToken,
  hasGrammar,
  highlightCode,
} from "./highlight";

function TrafficLights() {
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
      <span className="size-2.5 rounded-full bg-[#ff5f56]" />
      <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
      <span className="size-2.5 rounded-full bg-[#27c93f]" />
    </span>
  );
}

/**
 * The window chrome every code surface shares: the site chassis, a header bar
 * with the three window dots, and whatever the caller puts either side of it.
 * Colours come from the theme tokens, so the window follows light and dark.
 */
export function CodeWindow({
  start,
  end,
  children,
  className,
}: Readonly<{
  start?: ReactNode;
  end?: ReactNode;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <figure
      className={cn(
        "site-chassis not-prose relative my-8 overflow-hidden rounded-xl",
        className
      )}
    >
      <div className="flex h-10 items-stretch justify-between gap-3 border-border/50 border-b bg-foreground/[0.02] px-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <TrafficLights />
          {start}
        </div>
        {end ? (
          <div className="flex shrink-0 items-center gap-3">{end}</div>
        ) : null}
      </div>
      {children}
    </figure>
  );
}

export function LineCount({ count }: Readonly<{ count: number }>) {
  return (
    <span className="hidden text-[11px] text-muted-foreground/70 tabular-nums sm:inline">
      {count} {count === 1 ? "line" : "lines"}
    </span>
  );
}

// Plain text renders first (server and first client paint); colours arrive
// once the highlighter has loaded. Same characters, same line boxes, so the
// swap recolours in place without moving anything.
function useHighlightedTokens(
  code: string,
  language?: string | null
): HighlightToken[][] | null {
  const [result, setResult] = useState<{
    key: string;
    tokens: HighlightToken[][] | null;
  } | null>(null);
  const key = `${language}\u0000${code}`;

  useEffect(() => {
    if (!hasGrammar(language)) {
      return;
    }
    let cancelled = false;
    highlightCode(code, language)
      .then((tokens) => {
        if (!cancelled) {
          setResult({ key, tokens });
        }
      })
      .catch(() => {
        // Highlighting is decoration: on failure the plain text stays.
      });
    return () => {
      cancelled = true;
    };
  }, [code, language, key]);

  if (result?.key === key) {
    return result.tokens;
  }
  // Switching back to a code-group tab already coloured shows its colours on
  // the first frame instead of flashing plain text until the effect runs.
  return cachedTokens(code, language);
}

export function CodeBody({
  code,
  language,
  highlightLines,
}: Readonly<{
  code: string;
  language?: string | null;
  highlightLines?: string | null;
}>) {
  const lines = splitCodeLines(code);
  const highlighted = parseHighlightedLines(highlightLines);
  const tokens = useHighlightedTokens(lines.join("\n"), language);

  return (
    <div className="rich-code flex text-[13px] leading-relaxed">
      <div aria-hidden="true" className="rich-code-gutter">
        {lines.map((_, index) => {
          const lineNum = index + 1;
          return (
            <span
              className={cn(
                highlighted.has(lineNum) && "font-semibold text-foreground"
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
        <code className="font-mono">
          {lines.map((line, index) => {
            const lineNum = index + 1;
            const lineTokens = tokens?.[index];
            return (
              <span
                className={cn(
                  "block",
                  highlighted.has(lineNum) &&
                    "-mx-(--rich-code-inset-inline) bg-foreground/[0.07] px-(--rich-code-inset-inline)"
                )}
                key={index}
              >
                {lineTokens && lineTokens.length > 0
                  ? lineTokens.map((token, tokenIndex) => (
                      <span data-token="" key={tokenIndex} style={token.style}>
                        {token.content}
                      </span>
                    ))
                  : line || "\n"}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
