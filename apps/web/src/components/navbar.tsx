"use client";

import { GithubIcon } from "@workspace/sanity-blocks/internal/icons";
import { cn } from "@workspace/tailwind-config/utils";
import { ArrowUpRight, Home, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CommandPalette } from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import type { NavigationData } from "@/types";

export interface NavLinkItem {
  label: string;
  href: string;
  openInNewTab?: boolean;
}

function parseNavColumns(
  columns?: NonNullable<NavigationData["navbarData"]>["columns"]
): NavLinkItem[] {
  if (!columns || columns.length === 0) {
    return [
      { label: "Blog", href: "/blog" },
      { label: "Portfolio", href: "https://ajinkya.org", openInNewTab: true },
      { label: "GitHub", href: "https://github.com", openInNewTab: true },
    ];
  }

  return columns.flatMap((col) => {
    if (col.type === "link" && col.name && col.href) {
      return [
        {
          label: col.name,
          href: col.href,
          openInNewTab: Boolean(col.openInNewTab),
        },
      ];
    }
    if (col.type === "column" && Array.isArray(col.links)) {
      return col.links
        .filter((sub) => sub.name && sub.href)
        .map((sub) => ({
          label: sub.name as string,
          href: sub.href as string,
          openInNewTab: Boolean(sub.openInNewTab),
        }));
    }
    return [];
  });
}

export function Navbar({ navbarData, settingsData }: Readonly<NavigationData>) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const { columns, gitHubUrl } = navbarData || {};
  const { siteTitle, logos } = settingsData || {};

  const effectiveGitHubUrl = gitHubUrl || "https://github.com/ajinkya-cell";

  // Normalize CMS links into a flat, clean array
  const navLinks = useMemo<NavLinkItem[]>(
    () => parseNavColumns(columns),
    [columns]
  );

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    if (pathname) {
      setMobileOpen(false);
    }
  }, [pathname]);

  return (
    <>
      <header className="fixed top-3 left-0 z-50 flex w-full select-none justify-center px-3 pointer-events-none sm:top-4 sm:px-4">
        <div className="flex w-full max-w-[42rem] flex-col items-center pointer-events-auto">
          {/* Main Floating Pill */}
          <nav
            aria-label="Main Navigation"
            className="site-bevel-panel flex h-12 w-full items-center justify-between gap-2 rounded-full px-3 transition-all duration-200 sm:px-3.5"
          >
            {/* Left: Home Navigation Icon */}
            <div className="flex shrink-0 items-center">
              <Link
                aria-label="Home"
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href="/"
              >
                <Home className="size-4" />
              </Link>
            </div>

            {/* Center: Desktop Navigation Links */}
            <div className="hidden min-w-0 items-center gap-1 md:flex sm:gap-1.5">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium text-xs transition-all",
                      isActive
                        ? "bg-foreground/10 font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                    )}
                    href={link.href}
                    key={link.label}
                    rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                    target={link.openInNewTab ? "_blank" : undefined}
                  >
                    <span>{link.label}</span>
                    {link.openInNewTab && (
                      <ArrowUpRight className="size-3 text-muted-foreground" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right: Actions (Search, GitHub, Theme, Mobile Toggle) */}
            <div className="flex shrink-0 items-center gap-1">
              {/* Search Trigger */}
              <button
                aria-label="Open command palette"
                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setCommandOpen(true)}
                title="Search (Cmd+K)"
                type="button"
              >
                <Search className="size-3.5" />
                <span className="hidden text-xs lg:inline">Search</span>
                <kbd className="hidden items-center gap-0.5 rounded border border-border bg-muted/60 px-1 font-mono text-[9px] text-muted-foreground lg:inline-flex">
                  ⌘K
                </kbd>
              </button>

              {/* GitHub Link */}
              {effectiveGitHubUrl && (
                <a
                  aria-label="GitHub Repository"
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href={effectiveGitHubUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  title="GitHub"
                >
                  <GithubIcon className="size-4" />
                </a>
              )}

              {/* Theme Switcher */}
              <ThemeToggle />

              {/* Mobile Hamburger Toggle */}
              <button
                aria-label="Toggle navigation menu"
                className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground md:hidden"
                onClick={() => setMobileOpen((prev) => !prev)}
                type="button"
              >
                {mobileOpen ? (
                  <X className="size-4" />
                ) : (
                  <Menu className="size-4" />
                )}
              </button>
            </div>
          </nav>

          {/* Mobile Dropdown Panel */}
          {mobileOpen && (
            <div className="site-bevel-dropdown mt-2 w-full overflow-hidden rounded-2xl p-2.5 transition-all duration-200 animate-in fade-in slide-in-from-top-2 md:hidden">
              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link
                    className="flex items-center justify-between rounded-xl px-3 py-2 font-medium text-foreground/85 text-xs transition-colors hover:bg-foreground/5 hover:text-foreground"
                    href={link.href}
                    key={link.label}
                    onClick={() => setMobileOpen(false)}
                    rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                    target={link.openInNewTab ? "_blank" : undefined}
                  >
                    <span>{link.label}</span>
                    {link.openInNewTab && (
                      <ArrowUpRight className="size-3.5 text-muted-foreground" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette
        gitHubUrl={effectiveGitHubUrl}
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
      />
    </>
  );
}
