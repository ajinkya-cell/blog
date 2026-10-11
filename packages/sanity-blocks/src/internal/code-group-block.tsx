"use client";

import { cn } from "@workspace/tailwind-config/utils";
import { type KeyboardEvent, useId, useRef, useState } from "react";

import type { CodeBlockValue } from "./code-block";
import { splitCodeLines } from "./code-lines";
import { CodeBody, CodeWindow, LineCount } from "./code-window";
import { CopyButton } from "./copy-button";

export interface CodeGroupFile extends CodeBlockValue {
  _key?: string;
}

export interface CodeGroupBlockProps {
  title?: string | null;
  files?: CodeGroupFile[] | null;
}

export function CodeGroupBlock({
  title,
  files,
}: Readonly<CodeGroupBlockProps>) {
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const idPrefix = useId();

  if (!files || files.length === 0) {
    return null;
  }

  const validIndex = Math.min(activeTab, files.length - 1);
  const activeFile = files[validIndex];

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next = -1;
    if (event.key === "ArrowRight") {
      next = (validIndex + 1) % files.length;
    } else if (event.key === "ArrowLeft") {
      next = (validIndex - 1 + files.length) % files.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = files.length - 1;
    }
    if (next === -1) {
      return;
    }
    event.preventDefault();
    setActiveTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <CodeWindow
      end={
        <>
          {title ? (
            <span className="hidden max-w-48 truncate text-muted-foreground text-xs md:inline">
              {title}
            </span>
          ) : null}
          {activeFile?.code ? (
            <>
              <LineCount count={splitCodeLines(activeFile.code).length} />
              <CopyButton code={activeFile.code} />
            </>
          ) : null}
        </>
      }
      start={
        <div
          aria-label={title || "Code files"}
          className="-mb-px flex h-full min-w-0 items-stretch gap-4 overflow-x-auto [scrollbar-width:none]"
          onKeyDown={handleKeyDown}
          role="tablist"
        >
          {files.map((file, index) => {
            const isSelected = index === validIndex;
            return (
              <button
                aria-controls={`${idPrefix}-panel`}
                aria-selected={isSelected}
                className={cn(
                  "focus-ring relative flex shrink-0 items-center font-mono text-xs transition-colors",
                  isSelected
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground/80"
                )}
                id={`${idPrefix}-tab-${index}`}
                key={file._key || `${file.filename}-${index}`}
                onClick={() => setActiveTab(index)}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                role="tab"
                tabIndex={isSelected ? 0 : -1}
                type="button"
              >
                {file.filename || `File ${index + 1}`}
                {isSelected ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-foreground"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      }
    >
      <div
        aria-labelledby={`${idPrefix}-tab-${validIndex}`}
        id={`${idPrefix}-panel`}
        role="tabpanel"
      >
        {activeFile?.code ? (
          <CodeBody
            code={activeFile.code}
            highlightLines={activeFile.highlightLines}
            language={activeFile.language}
          />
        ) : null}
      </div>
    </CodeWindow>
  );
}
