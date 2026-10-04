import type { RichTextValue } from "@workspace/sanity-blocks/internal/rich-text";
import { RichText } from "@workspace/sanity-blocks/internal/rich-text";
import type { ButtonProps } from "@workspace/sanity-blocks/internal/sanity-buttons";
import { SanityButtons } from "@workspace/sanity-blocks/internal/sanity-buttons";
import type { SanityImageData } from "@workspace/sanity-blocks/internal/sanity-image";
import { SanityImage } from "@workspace/sanity-blocks/internal/sanity-image";
import { cn } from "@workspace/tailwind-config/utils";

export interface PersonalHeroProps {
  avatar?: SanityImageData | null;
  bio?: RichTextValue;
  buttons?: ButtonProps[] | null;
  className?: string;
  dataSanity?: string;
  greeting?: string | null;
  statusPill?: string | null;
  tagline?: string | null;
}

export function PersonalHero({
  statusPill,
  greeting,
  tagline,
  avatar,
  bio,
  buttons,
  className,
  dataSanity,
}: Readonly<PersonalHeroProps>) {
  return (
    <section
      className={cn(
        "border-border/60 border-b bg-background py-16 md:py-24",
        className
      )}
      data-sanity={dataSanity}
    >
      <div className="container max-w-4xl">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-12">
          {avatar?.id ? (
            <div className="relative shrink-0">
              <div className="size-24 overflow-hidden rounded-full border-2 border-border shadow-sm md:size-28">
                <SanityImage
                  alt={greeting ?? "Author avatar"}
                  className="size-full object-cover"
                  height={112}
                  image={avatar}
                  loading="eager"
                  sizes="112px"
                  width={112}
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-1 flex-col gap-4">
            {statusPill ? (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1 font-mono text-muted-foreground text-xs">
                <span>{statusPill}</span>
              </div>
            ) : null}

            <div className="space-y-2">
              <h1 className="font-normal font-sans text-3xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
                {greeting}
              </h1>
              {tagline ? (
                <p className="font-light text-lg text-muted-foreground leading-relaxed md:text-xl">
                  {tagline}
                </p>
              ) : null}
            </div>

            {bio ? (
              <div className="mt-2 text-base text-foreground/80 leading-relaxed">
                <RichText richText={bio} />
              </div>
            ) : null}

            {buttons && buttons.length > 0 ? (
              <div className="pt-2">
                <SanityButtons
                  buttons={buttons}
                  className="flex flex-wrap gap-3"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
