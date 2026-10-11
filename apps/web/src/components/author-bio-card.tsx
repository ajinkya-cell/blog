import { SanityImage } from "@workspace/sanity-blocks/internal/sanity-image";
import { cn } from "@workspace/tailwind-config/utils";
import { Globe, Mail, MapPin, Sparkles } from "lucide-react";
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
        "site-chassis relative overflow-hidden rounded-2xl p-6 md:p-8",
        className
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {image?.id ? (
          <div className="size-16 shrink-0 overflow-hidden rounded-2xl border border-foreground/15 shadow-md md:size-20">
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
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-foreground/15 bg-foreground font-bold text-background text-xl shadow-md md:size-20">
            {name.charAt(0)}
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground text-lg">{name}</h3>
              {position ? (
                <span className="text-muted-foreground text-xs">
                  · {position}
                </span>
              ) : null}
            </div>
            {tagline ? (
              <p className="text-foreground/80 text-sm leading-relaxed">
                {tagline}
              </p>
            ) : null}
          </div>

          {bio ? (
            <p className="text-muted-foreground text-xs leading-relaxed">
              {bio}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {location ? (
              <span className="recessed-well inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-muted-foreground">
                <MapPin className="size-3" />
                {location}
              </span>
            ) : null}
            {status ? (
              <span className="recessed-well inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-emerald-400">
                <Sparkles className="size-3 text-amber-400" />
                {status}
              </span>
            ) : null}
          </div>

          {socialLinks && (
            <div className="mt-2 flex flex-wrap items-center gap-2 pt-2 text-sm">
              {socialLinks.github && (
                <Link
                  className="popout-btn-inactive inline-flex items-center rounded-lg px-2.5 py-1 text-xs transition-colors hover:text-foreground"
                  href={socialLinks.github}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  GitHub
                </Link>
              )}
              {socialLinks.twitter && (
                <Link
                  className="popout-btn-inactive inline-flex items-center rounded-lg px-2.5 py-1 text-xs transition-colors hover:text-foreground"
                  href={socialLinks.twitter}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Twitter/X
                </Link>
              )}
              {socialLinks.bluesky && (
                <Link
                  className="popout-btn-inactive inline-flex items-center rounded-lg px-2.5 py-1 text-xs transition-colors hover:text-foreground"
                  href={socialLinks.bluesky}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Bluesky
                </Link>
              )}
              {socialLinks.linkedin && (
                <Link
                  className="popout-btn-inactive inline-flex items-center rounded-lg px-2.5 py-1 text-xs transition-colors hover:text-foreground"
                  href={socialLinks.linkedin}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  LinkedIn
                </Link>
              )}
              {socialLinks.website && (
                <Link
                  className="popout-btn-inactive inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors hover:text-foreground"
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
                  className="popout-btn-inactive inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors hover:text-foreground"
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
