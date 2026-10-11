"use client";

import { cn } from "@workspace/tailwind-config/utils";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

import { CodeWindow } from "./code-window";
import { CopyButton } from "./copy-button";
import {
  formatInstallCommand,
  type InstallCommand,
  PACKAGE_MANAGERS,
  type PackageManager,
} from "./install-command";

const STORAGE_KEY = "code-window:package-manager";
const CHANGE_EVENT = "code-window:package-manager";

function readStoredManager(): PackageManager | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return PACKAGE_MANAGERS.includes(stored as PackageManager)
      ? (stored as PackageManager)
      : null;
  } catch {
    return null;
  }
}

function storeManager(manager: PackageManager) {
  try {
    window.localStorage.setItem(STORAGE_KEY, manager);
  } catch {
    // Private mode or blocked storage: the choice just doesn't persist.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: manager }));
}

// A reader picks a manager once; every install block on the page (and the
// next visit) follows. Until they pick, each block shows what its author wrote.
function usePackageManager(authored: PackageManager) {
  const [manager, setManager] = useState(authored);

  useEffect(() => {
    const stored = readStoredManager();
    if (stored) {
      setManager(stored);
    }
    const handleChange = (event: Event) => {
      const next = (event as CustomEvent<PackageManager>).detail;
      if (PACKAGE_MANAGERS.includes(next)) {
        setManager(next);
      }
    };
    window.addEventListener(CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(CHANGE_EVENT, handleChange);
  }, []);

  return [manager, storeManager] as const;
}

function ManagerIcon({ manager }: Readonly<{ manager: PackageManager }>) {
  const className = "size-3.5 shrink-0";
  switch (manager) {
    case "pnpm":
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        >
          <rect fill="#F69220" height="5.5" rx="1" width="5.5" x="2" y="2" />
          <rect fill="#F69220" height="5.5" rx="1" width="5.5" x="9.25" y="2" />
          <rect fill="#F69220" height="5.5" rx="1" width="5.5" x="16.5" y="2" />
          <rect
            fill="#F69220"
            height="5.5"
            rx="1"
            width="5.5"
            x="9.25"
            y="9.25"
          />
          <rect
            className="fill-foreground/40"
            height="5.5"
            rx="1"
            width="5.5"
            x="16.5"
            y="9.25"
          />
          <rect fill="#F69220" height="5.5" rx="1" width="5.5" x="2" y="16.5" />
          <rect
            fill="#F69220"
            height="5.5"
            rx="1"
            width="5.5"
            x="9.25"
            y="16.5"
          />
          <rect
            fill="#F69220"
            height="5.5"
            rx="1"
            width="5.5"
            x="16.5"
            y="16.5"
          />
        </svg>
      );
    case "npm":
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        >
          <rect fill="#CB3837" height="24" rx="3" width="24" />
          <path d="M4 6h16v12H12v-8H8v8H4V6zm10 4h2v4h-2v-4z" fill="#FFFFFF" />
        </svg>
      );
    case "yarn":
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            fill="#2C8EBB"
            fillOpacity="0.15"
            r="9.5"
            stroke="#2C8EBB"
            strokeWidth="1.5"
          />
          <path
            d="M7.5 13.5c1.2 1.8 3.5 2.5 5.5 1.5 1.5-.7 2.2-1.8 2.2-3 0-1.8-1.5-2.8-3.2-2.8-1.5 0-2.8.8-3.2 2"
            stroke="#2C8EBB"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    default:
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="13"
            fill="#FDF6E2"
            r="8.5"
            stroke="#D97736"
            strokeWidth="1.5"
          />
          <ellipse cx="12" cy="9" fill="#D97736" rx="3.5" ry="1.8" />
          <circle cx="9.5" cy="13" fill="#262626" r="1" />
          <circle cx="14.5" cy="13" fill="#262626" r="1" />
          <path
            d="M11 15.5c.5.5 1.5.5 2 0"
            stroke="#D97736"
            strokeLinecap="round"
            strokeWidth="1.2"
          />
        </svg>
      );
  }
}

/**
 * A one-line package install rendered as a package-manager switcher. Chosen by
 * `parseInstallCommand` from an ordinary shell code block — no schema field.
 */
export function InstallCommandBlock({
  command,
}: Readonly<{ command: InstallCommand }>) {
  const [manager, setManager] = usePackageManager(command.authored);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelId = useId();
  const text = formatInstallCommand(command, manager);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) {
      return;
    }
    event.preventDefault();
    const current = PACKAGE_MANAGERS.indexOf(manager);
    const nextIndex =
      (current + step + PACKAGE_MANAGERS.length) % PACKAGE_MANAGERS.length;
    const next = PACKAGE_MANAGERS[nextIndex];
    if (next) {
      setManager(next);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <CodeWindow
      end={<CopyButton code={text} />}
      start={
        <>
          <ManagerIcon manager={manager} />
          <div
            aria-label="Package manager"
            className="flex h-full items-stretch gap-3.5"
            onKeyDown={handleKeyDown}
            role="tablist"
          >
            {PACKAGE_MANAGERS.map((option, index) => {
              const selected = option === manager;
              return (
                <button
                  aria-controls={panelId}
                  aria-selected={selected}
                  className={cn(
                    "focus-ring relative flex items-center font-mono text-xs transition-colors",
                    selected
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground/80"
                  )}
                  key={option}
                  onClick={() => setManager(option)}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  role="tab"
                  tabIndex={selected ? 0 : -1}
                  type="button"
                >
                  {option}
                  {selected ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </>
      }
    >
      <div className="overflow-x-auto px-4 py-3.5" id={panelId} role="tabpanel">
        <p className="flex items-center gap-2.5 whitespace-nowrap font-mono text-[13px] text-foreground">
          <span
            aria-hidden="true"
            className="select-none text-muted-foreground/60"
          >
            $
          </span>
          <code className="select-all font-mono">{text}</code>
        </p>
      </div>
    </CodeWindow>
  );
}
