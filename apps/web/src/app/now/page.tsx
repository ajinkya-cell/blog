import { sanityFetch } from "@workspace/sanity/live";
import { queryAuthorProfile } from "@workspace/sanity/query";
import { Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Now",
  description:
    "What I'm currently working on, thinking about, and exploring right now.",
};

async function getNowData() {
  "use cache";
  const { data: author } = await sanityFetch({
    query: queryAuthorProfile,
    perspective: "published",
    stega: false,
  });
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  return { author, currentDate };
}

export default async function NowPage() {
  const { author, currentDate } = await getNowData();

  return (
    <main className="bg-background">
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Now" }]} />
      <div className="container mt-8 mb-24 max-w-2xl md:my-16">
        <header className="mb-10">
          <div className="flex items-center gap-2 font-mono text-muted-foreground text-xs uppercase tracking-wider">
            <Clock className="size-3.5" />
            <span>Updated {currentDate}</span>
          </div>
          <h1 className="mt-3 text-balance font-normal text-4xl tracking-tight sm:text-5xl">
            What I&apos;m Doing Now
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Inspired by Derek Sivers&apos;{" "}
            <Link
              className="underline underline-offset-4 hover:text-foreground"
              href="https://nownownow.com/about"
              rel="noopener noreferrer"
              target="_blank"
            >
              /now page movement
            </Link>
            .
          </p>
        </header>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section className="border-border border-t pt-6">
            <h2 className="mb-3 font-medium text-foreground text-lg">
              Primary Focus
            </h2>
            <p className="text-muted-foreground">
              {author?.status ??
                "Designing and building reliable web systems, experimenting with agentic tools, and publishing essays on software craft."}
            </p>
          </section>

          <section className="border-border border-t pt-6">
            <h2 className="mb-3 font-medium text-foreground text-lg">
              Writing & Research
            </h2>
            <p className="text-muted-foreground">
              Exploring Next.js 16 cache models, Sanity content architecture, and
              distilling lessons from long-term software maintenance into practical
              guides on{" "}
              <Link className="underline hover:text-foreground" href="/blog">
                the blog
              </Link>
              .
            </p>
          </section>

          <section className="border-border border-t pt-6">
            <h2 className="mb-3 font-medium text-foreground text-lg">
              Coding & Ventures
            </h2>
            <p className="text-muted-foreground">
              Prototyping developer tooling and open source packages. You can follow
              the latest active experiments on the{" "}
              <Link className="underline hover:text-foreground" href="/projects">
                projects directory
              </Link>
              .
            </p>
          </section>

          <section className="border-border border-t pt-6">
            <h2 className="mb-3 font-medium text-foreground text-lg">Location</h2>
            <p className="text-muted-foreground">
              Currently based in {author?.location ?? "Earth"}, working remotely and
              thinking globally.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
