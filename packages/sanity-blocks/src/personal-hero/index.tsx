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
        "relative overflow-hidden border-border/40 border-b py-16 md:py-24",
        className
      )}
      data-sanity={dataSanity}
    >
      <div className="container max-w-4xl">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-12">
          {avatar?.id ? (
            <div className="relative shrink-0">
              <div className="relative size-24 overflow-hidden rounded-full border border-white/[0.16] bg-[#151515] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_32px_rgba(0,0,0,0.5)] md:size-28">
                <div className="size-full overflow-hidden rounded-full">
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
            </div>
          ) : null}

          <div className="flex flex-1 flex-col gap-4">
            {statusPill ? (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 font-medium text-emerald-400 text-xs shadow-[inset_0_1px_2px_rgba(16,185,129,0.15)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>{statusPill}</span>
              </div>
            ) : null}

            <div className="space-y-2">
              <h1 className="font-sans font-semibold text-3xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
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
