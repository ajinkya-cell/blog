"use client";

import { cn } from "@workspace/tailwind-config/utils";
import { useState } from "react";
import { CodeBlock, type CodeBlockValue } from "./code-block";

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

  if (!files || files.length === 0) {
    return null;
  }

  const validIndex = Math.min(activeTab, files.length - 1);
  const activeFile = files[validIndex];

  return (
    <div className="site-chassis not-prose relative my-6 overflow-hidden rounded-2xl">
      {title && (
        <div className="border-border/40 border-b bg-foreground/[0.02] px-4 py-2 font-mono text-muted-foreground text-xs uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="p-2 pb-0">
        <div
          aria-label="Code tabs"
          className="recessed-well flex items-center gap-1.5 overflow-x-auto rounded-xl p-1.5"
          role="tablist"
        >
          {files.map((file, index) => {
            const isSelected = index === validIndex;
            const label = file.filename || `File ${index + 1}`;
            return (
              <button
                key={file._key || `${file.filename}-${index}`}
                aria-selected={isSelected}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1 font-mono text-xs transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  isSelected
                    ? "popout-btn-active font-semibold shadow-sm"
                    : "popout-btn-inactive text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab(index)}
                role="tab"
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      {activeFile && (
        <div className="[&>figure]:my-0 [&>figure]:rounded-none [&>figure]:border-none [&>figure]:bg-transparent [&>figure]:shadow-none">
          <CodeBlock
            code={activeFile.code}
            filename={undefined}
            highlightLines={activeFile.highlightLines}
            language={activeFile.language}
          />
        </div>
      )}
    </div>
  );
}
