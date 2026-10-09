"use client";

import { cn } from "@workspace/tailwind-config/utils";
import { Search, X } from "lucide-react";

export function SearchInput({
  className,
  placeholder,
  value,
  onChange,
  onClear,
}: {
  className?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className={cn("w-full max-w-sm", className)}>
      <div className="relative">
        <label className="sr-only" htmlFor="blog-search-input">
          {placeholder}
        </label>

        <div className="void-input relative flex items-center transition-colors focus-within:border-foreground/30">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
          />

          <input
            className="h-10 w-full bg-transparent pr-10 pl-9.5 font-sans text-foreground text-sm outline-none placeholder:text-muted-foreground"
            id="blog-search-input"
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            type="text"
            value={value}
          />

          {value && (
            <button
              aria-label="Clear search"
              className="absolute right-2.5 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              onClick={onClear}
              type="button"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
