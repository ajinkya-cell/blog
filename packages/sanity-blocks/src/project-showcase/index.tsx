import { BlockHeader } from "@workspace/sanity-blocks/internal/block-header";
import { GithubIcon } from "@workspace/sanity-blocks/internal/icons";
import type { SanityImageData } from "@workspace/sanity-blocks/internal/sanity-image";
import { SanityImage } from "@workspace/sanity-blocks/internal/sanity-image";
import { cn } from "@workspace/tailwind-config/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export interface ProjectItemData {
  _key: string;
  category?: string | null;
  description?: string | null;
  featured?: boolean | null;
  githubUrl?: string | null;
  image?: SanityImageData | null;
  liveUrl?: string | null;
  status?: string | null;
  tags?: string[] | null;
  title: string;
  year?: string | null;
}

export interface ProjectShowcaseProps {
  className?: string;
  dataSanity?: string;
  description?: string | null;
  eyebrow?: string | null;
  items?: ProjectItemData[] | null;
  title?: string | null;
  viewAllHref?: string | null;
}

function StatusBadge({ status }: Readonly<{ status?: string | null }>) {
  if (!status) return null;
  const isWip = status === "wip";
  const isArchived = status === "archived";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider",
        isWip && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        isArchived && "bg-zinc-500/10 text-zinc-500",
        !isWip &&
          !isArchived &&
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          isWip && "bg-amber-500",
          isArchived && "bg-zinc-400",
          !isWip && !isArchived && "bg-emerald-500"
        )}
      />
      {status === "active" ? "Active" : status === "wip" ? "WIP" : status}
    </span>
  );
}

function ProjectCard({ project }: Readonly<{ project: ProjectItemData }>) {
  const {
    title,
    description,
    category,
    year,
    status,
    tags,
    githubUrl,
    liveUrl,
    image,
    featured,
  } = project;

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between border border-border/70 bg-card p-6 transition-colors hover:border-foreground/30",
        featured && "md:col-span-2"
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 text-muted-foreground text-xs font-mono">
          <div className="flex items-center gap-2">
            {category && <span>{category}</span>}
            {category && year && <span>•</span>}
            {year && <span>{year}</span>}
          </div>
          <StatusBadge status={status} />
        </div>

        {image?.id && (
          <div className="relative mb-2 aspect-video w-full overflow-hidden border border-border/50 bg-muted">
            <SanityImage
              alt={title}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              height={360}
              image={image}
              sizes="(min-width: 768px) 50vw, 100vw"
              width={640}
            />
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-medium text-foreground text-xl tracking-tight">
            {liveUrl ? (
              <a
                className="focus-ring inline-flex items-center gap-1 hover:underline"
                href={liveUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span>{title}</span>
                <ArrowUpRight className="size-4 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ) : (
              title
            )}
          </h3>

          {description && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {tags.map((tag) => (
              <span
                className="rounded border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4 text-xs">
        <div className="flex items-center gap-3">
          {githubUrl && (
            <a
              aria-label={`${title} on GitHub`}
              className="focus-ring inline-flex items-center gap-1.5 font-mono text-muted-foreground hover:text-foreground"
              href={githubUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <GithubIcon className="size-4" />
              <span>Source</span>
            </a>
          )}
          {liveUrl && (
            <a
              className="focus-ring inline-flex items-center gap-1 font-mono text-muted-foreground hover:text-foreground"
              href={liveUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>Live Demo</span>
              <ArrowUpRight className="size-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProjectShowcase({
  eyebrow,
  title,
  description,
  items,
  viewAllHref,
  className,
  dataSanity,
}: Readonly<ProjectShowcaseProps>) {
  if (!items || items.length === 0) return null;

  return (
    <section
      className={cn("py-16 md:py-24 border-b border-border/60 bg-background", className)}
      data-sanity={dataSanity}
    >
      <div className="container max-w-5xl">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <BlockHeader
              eyebrow={eyebrow ?? "Projects"}
              title={title ?? "Selected Work"}
            >
              {description ? (
                <p className="max-w-2xl text-muted-foreground text-sm">
                  {description}
                </p>
              ) : null}
            </BlockHeader>
          </div>
          {viewAllHref && (
            <Link
              className="focus-ring inline-flex items-center gap-1 text-sm font-mono text-muted-foreground hover:text-foreground w-fit"
              href={viewAllHref}
            >
              <span>View all projects</span>
              <ArrowUpRight className="size-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((project) => (
            <ProjectCard key={project._key} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
