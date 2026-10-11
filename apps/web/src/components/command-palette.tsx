"use client";

import { cn } from "@workspace/tailwind-config/utils";
import {
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  Home,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useBlogSearch } from "@/hooks/use-blog-search";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  gitHubUrl?: string | null;
}

interface DefaultNavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external: boolean;
}

export function CommandPalette({
  isOpen,
  onClose,
  gitHubUrl,
}: Readonly<CommandPaletteProps>) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchQuery, setSearchQuery, results, isSearching } = useBlogSearch();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const defaultLinks: DefaultNavLink[] = useMemo(
    () => [
      { label: "Home", href: "/", icon: Home, external: false },
      {
        label: "All Blog Posts",
        href: "/blog",
        icon: BookOpen,
        external: false,
      },
      {
        label: "Portfolio",
        href: "https://ajinkya.org",
        icon: ExternalLink,
        external: true,
      },
      ...(gitHubUrl
        ? [
            {
              label: "GitHub",
              href: gitHubUrl,
              icon: ArrowUpRight,
              external: true,
            },
          ]
        : []),
    ],
    [gitHubUrl]
  );

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setSearchQuery("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, setSearchQuery]);

  // Keyboard navigation & Escape key listener
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const totalItems = searchQuery.trim()
      ? results.length
      : defaultLinks.length;

    function handleSelect() {
      if (searchQuery.trim()) {
        const selected = results[selectedIndex];
        if (selected?.slug) {
          const href = selected.slug.startsWith("/")
            ? selected.slug
            : `/blog/${selected.slug}`;
          router.push(href);
          onClose();
        }
        return;
      }
      const selected = defaultLinks[selectedIndex];
      if (!selected) {
        return;
      }
      if (selected.external) {
        window.open(selected.href, "_blank", "noopener,noreferrer");
      } else {
        router.push(selected.href);
      }
      onClose();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalItems));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) =>
            (prev - 1 + Math.max(1, totalItems)) % Math.max(1, totalItems)
        );
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        handleSelect();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    onClose,
    results,
    selectedIndex,
    searchQuery,
    defaultLinks,
    router,
  ]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-label="Command palette modal"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24"
      role="dialog"
    >
      {/* Backdrop */}
      <button
        aria-label="Close command palette overlay"
        className="fixed inset-0 cursor-default bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        type="button"
      />

      {/* Beveled Modal Content */}
      <div className="site-bevel-panel relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-border border-b px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent font-sans text-foreground text-sm outline-none placeholder:text-muted-foreground"
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search articles or jump to..."
            ref={inputRef}
            type="text"
            value={searchQuery}
          />
          {isSearching && (
            <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
          )}
          <button
            aria-label="Close command palette"
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Results / Navigation List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {searchQuery.trim() ? (
            results.length > 0 ? (
              <div className="flex flex-col gap-1">
                <div className="px-3 py-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                  Articles
                </div>
                {results.map((post, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <Link
                      className={cn(
                        "flex flex-col rounded-xl px-3 py-2 text-sm transition-colors",
                        isSelected
                          ? "bg-foreground/10 text-foreground font-medium"
                          : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                      )}
                      href={
                        post.slug?.startsWith("/")
                          ? post.slug
                          : `/blog/${post.slug}`
                      }
                      key={post._id ?? post.slug}
                      onClick={onClose}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <span className="font-normal text-foreground">
                        {post.title}
                      </span>
                      {post.description && (
                        <span className="line-clamp-1 text-muted-foreground text-xs">
                          {post.description}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ) : isSearching ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Searching...
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No matching articles found for "{searchQuery}"
              </div>
            )
          ) : (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                Quick Navigation
              </div>
              {defaultLinks.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const IconComponent = item.icon;
                return (
                  <a
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors",
                      isSelected
                        ? "bg-foreground/10 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                    )}
                    href={item.href}
                    key={item.label}
                    onClick={(e) => {
                      if (!item.external) {
                        e.preventDefault();
                        router.push(item.href);
                      }
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    target={item.external ? "_blank" : undefined}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.external && (
                      <ArrowUpRight className="size-3.5 text-muted-foreground" />
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-border border-t bg-muted/40 px-4 py-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-border bg-background px-1 py-0.5">
                ↑↓
              </kbd>{" "}
              navigate
            </span>
            <span>
              <kbd className="rounded border border-border bg-background px-1 py-0.5">
                ↵
              </kbd>{" "}
              select
            </span>
          </div>
          <span>
            <kbd className="rounded border border-border bg-background px-1 py-0.5">
              esc
            </kbd>{" "}
            close
          </span>
        </div>
      </div>
    </div>
  );
}
