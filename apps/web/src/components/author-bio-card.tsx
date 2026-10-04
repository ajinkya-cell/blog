import { SanityImage } from "@workspace/sanity-blocks/internal/sanity-image";
import { cn } from "@workspace/tailwind-config/utils";
import {
  Globe,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export type AuthorBioProps = {
  author?: {
    name?: string | null;
    position?: string | null;
    tagline?: string | null;
    location?: string | null;
    status?: string | null;
    bio?: string | null;
    socialLinks?: {
      github?: string | null;
      twitter?: string | null;
      bluesky?: string | null;
      linkedin?: string | null;
      website?: string | null;
      email?: string | null;
    } | null;
    image?: {
      id?: string | null;
      preview?: string | null;
      alt?: string | null;
    } | null;
  } | null;
  className?: string;
};

export function AuthorBioCard({ author, className }: Readonly<AuthorBioProps>) {
  if (!author?.name) {
    return null;
  }

  const { name, position, tagline, location, status, bio, socialLinks, image } =
    author;

  return (
    <section
      aria-label="About the author"
      className={cn(
        "rounded-none border border-border bg-card p-6 md:p-8",
        className
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {image?.id ? (
          <div className="size-16 shrink-0 overflow-hidden rounded-full border border-border md:size-20">
            <SanityImage
              alt={name}
              className="size-full object-cover"
              height={80}
              image={image}
              sizes="80px"
              width={80}
            />
          </div>
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-border bg-muted font-mono font-medium text-lg md:size-20">
            {name.charAt(0)}
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground text-lg">{name}</h3>
              {position ? (
                <span className="text-muted-foreground text-sm">· {position}</span>
              ) : null}
            </div>
            {tagline ? (
              <p className="text-foreground/80 text-sm">{tagline}</p>
            ) : null}
          </div>

          {bio ? (
            <p className="text-muted-foreground text-sm leading-relaxed">{bio}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-xs">
            {location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {location}
              </span>
            ) : null}
            {status ? (
              <span className="inline-flex items-center gap-1 font-mono">
                <Sparkles className="size-3.5 text-amber-500" />
                {status}
              </span>
            ) : null}
          </div>

          {socialLinks && (
            <div className="mt-1 flex flex-wrap items-center gap-3 pt-2 text-sm">
              {socialLinks.github && (
                <Link
                  className="font-mono text-muted-foreground text-xs hover:text-foreground hover:underline"
                  href={socialLinks.github}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  GitHub
                </Link>
              )}
              {socialLinks.twitter && (
                <Link
                  className="font-mono text-muted-foreground text-xs hover:text-foreground hover:underline"
                  href={socialLinks.twitter}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Twitter/X
                </Link>
              )}
              {socialLinks.bluesky && (
                <Link
                  className="font-mono text-muted-foreground text-xs hover:text-foreground hover:underline"
                  href={socialLinks.bluesky}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Bluesky
                </Link>
              )}
              {socialLinks.linkedin && (
                <Link
                  className="font-mono text-muted-foreground text-xs hover:text-foreground hover:underline"
                  href={socialLinks.linkedin}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  LinkedIn
                </Link>
              )}
              {socialLinks.website && (
                <Link
                  className="inline-flex items-center gap-1 font-mono text-muted-foreground text-xs hover:text-foreground hover:underline"
                  href={socialLinks.website}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Globe className="size-3" />
                  Website
                </Link>
              )}
              {socialLinks.email && (
                <Link
                  className="inline-flex items-center gap-1 font-mono text-muted-foreground text-xs hover:text-foreground hover:underline"
                  href={`mailto:${socialLinks.email}`}
                >
                  <Mail className="size-3" />
                  Email
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
