import { languageLabel, splitCodeLines } from "./code-lines";
import { CodeBody, CodeWindow, LineCount } from "./code-window";
import { CopyButton } from "./copy-button";
import { parseInstallCommand } from "./install-command";
import { InstallCommandBlock } from "./install-command-block";

export interface CodeBlockValue {
  code?: string | null;
  language?: string | null;
  filename?: string | null;
  highlightLines?: string | null;
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

  const install = parseInstallCommand(code, language);
  if (install) {
    return <InstallCommandBlock command={install} />;
  }

  return (
    <CodeWindow
      end={
        <>
          <LineCount count={splitCodeLines(code).length} />
          <CopyButton code={code} />
        </>
      }
      start={
        filename ? (
          <span className="truncate font-mono text-muted-foreground text-xs">
            {filename}
          </span>
        ) : (
          <span className="truncate text-muted-foreground text-xs">
            {languageLabel(language)}
          </span>
        )
      }
    >
      <CodeBody
        code={code}
        highlightLines={highlightLines}
        language={language}
      />
    </CodeWindow>
  );
}
