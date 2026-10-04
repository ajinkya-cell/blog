import { sanityFetch } from "@workspace/sanity/live";
import { queryAllProjects } from "@workspace/sanity/query";
import { GithubIcon } from "@workspace/sanity-blocks/internal/icons";
import { SanityImage } from "@workspace/sanity-blocks/internal/sanity-image";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "A catalog of open source tools, experiments, systems, and creative ventures.",
};

async function getProjectsData() {
  "use cache";
  const { data } = await sanityFetch({
    query: queryAllProjects,
    perspective: "published",
    stega: false,
  });
  return data ?? [];
}

export default async function ProjectsPage() {
  const projects = await getProjectsData();

  return (
    <main className="bg-background">
      <Breadcrumbs
        crumbs={[{ label: "Home", href: "/" }, { label: "Projects" }]}
      />
      <div className="container mt-8 mb-20 md:my-16">
        <header className="mb-12 max-w-2xl">
          <h1 className="text-balance font-normal text-4xl tracking-tight sm:text-5xl">
            Projects & Ventures
          </h1>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            Software, open source experiments, libraries, and design systems I have
            designed and engineered.
          </p>
        </header>

        {projects.length === 0 ? (
          <div className="border border-border p-12 text-center text-muted-foreground">
            No projects published yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article
                className="group relative flex flex-col justify-between border border-border bg-card p-6 transition-colors hover:border-foreground/40"
                key={project._id}
              >
                <div>
                  {project.image?.id && (
                    <div className="mb-4 aspect-video overflow-hidden border border-border bg-muted">
                      <SanityImage
                        alt={project.title ?? "Project preview"}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        height={360}
                        image={project.image}
                        sizes="(min-width: 1024px) 360px, 100vw"
                        width={640}
                      />
                    </div>
                  )}

                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-mono text-muted-foreground text-xs">
                      {project.year ?? "Ongoing"}
                    </span>
                    {project.status && (
                      <span className="rounded-none border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground uppercase">
                        {project.status}
                      </span>
                    )}
                  </div>

                  <h2 className="font-medium text-foreground text-xl tracking-tight">
                    {project.title}
                  </h2>

                  {project.description && (
                    <p className="mt-2 line-clamp-3 text-muted-foreground text-sm leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  {project.techStack && project.techStack.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.techStack.map((tech) => (
                        <span
                          className="bg-muted px-2 py-0.5 font-mono text-muted-foreground text-xs"
                          key={tech}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-3 border-border border-t pt-4 text-sm">
                  {project.liveUrl && (
                    <Link
                      className="inline-flex items-center gap-1.5 font-mono text-foreground text-xs hover:underline"
                      href={project.liveUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <ExternalLink className="size-3.5" />
                      Live Demo
                    </Link>
                  )}
                  {project.githubUrl && (
                    <Link
                      className="inline-flex items-center gap-1.5 font-mono text-muted-foreground text-xs hover:text-foreground hover:underline"
                      href={project.githubUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <GithubIcon className="size-3.5" />
                      Source
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
