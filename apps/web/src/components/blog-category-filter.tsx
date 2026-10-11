import { cn } from "@workspace/tailwind-config/utils";
import Link from "next/link";

import { BLOG_CATEGORIES } from "@/lib/blog-categories";

export function BlogCategoryFilter({
  activeCategory,
  className,
}: Readonly<{ activeCategory: string; className?: string }>) {
  return (
    <nav
      aria-label="Filter posts by category"
      className={cn(
        "recessed-well flex flex-wrap gap-1.5 rounded-xl p-1.5",
        className
      )}
    >
      {BLOG_CATEGORIES.map(({ label, value }) => {
        const isActive = activeCategory === value;
        const href = value ? `/blog?category=${value}` : "/blog";

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center rounded-lg px-3 py-1.5 text-xs tracking-wide transition-all",
              isActive
                ? "popout-btn-active font-semibold shadow-sm"
                : "popout-btn-inactive hover:bg-foreground/5 hover:text-foreground"
            )}
            href={href}
            key={value || "all"}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
