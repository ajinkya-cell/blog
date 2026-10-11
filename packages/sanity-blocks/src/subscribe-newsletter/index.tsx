"use client";

import { BlockEyebrow } from "@workspace/sanity-blocks/internal/block-eyebrow";
import type { RichTextValue } from "@workspace/sanity-blocks/internal/rich-text";
import { RichText } from "@workspace/sanity-blocks/internal/rich-text";
import type { SanityImageData } from "@workspace/sanity-blocks/internal/sanity-image";
import { SanityImage } from "@workspace/sanity-blocks/internal/sanity-image";
import { cn } from "@workspace/tailwind-config/utils";
import { Button } from "@workspace/ui/components/button";
import { LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

export interface NewsletterTestimonial {
  authorImage?: SanityImageData | null;
  authorName?: string | null;
  authorRole?: string | null;
  eyebrow?: string | null;
  quote?: RichTextValue;
}

export interface SubscribeNewsletterProps {
  action?: ComponentProps<"form">["action"];
  helperText?: RichTextValue;
  method?: ComponentProps<"form">["method"];
  onSubmit?: ComponentProps<"form">["onSubmit"];
  subTitle?: RichTextValue;
  testimonial?: NewsletterTestimonial | null;
  title?: string | null;
}

function SubscribeNewsletterButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      aria-label={pending ? "Subscribing..." : "Subscribe to newsletter"}
      className="popout-btn-active shrink-0 rounded-xl px-5 py-2 text-xs font-semibold shadow-sm transition-transform active:scale-95"
      disabled={pending}
      size="sm"
      type="submit"
      variant="default"
    >
      {pending ? (
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin"
          size={16}
          strokeWidth={2}
        />
      ) : (
        "Subscribe"
      )}
      <span aria-live="polite" className="sr-only" role="status">
        {pending ? "Subscribing…" : ""}
      </span>
    </Button>
  );
}

function TestimonialPanel({
  testimonial,
}: Readonly<{ testimonial: NewsletterTestimonial }>) {
  const { eyebrow, quote, authorImage, authorName, authorRole } = testimonial;
  return (
    <div className="recessed-well relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 sm:p-8">
      <div className="flex flex-col gap-6">
        <BlockEyebrow eyebrow={eyebrow} />
        <RichText
          className="body-text text-muted-foreground [&_strong]:font-normal [&_strong]:text-foreground"
          richText={quote}
        />
        <div className="flex items-center gap-3.5 border-border/20 border-t pt-3">
          {authorImage?.id && (
            <div className="size-10 shrink-0 overflow-hidden rounded-full border border-white/[0.12] bg-[#151515] p-0.5 shadow-sm">
              <SanityImage
                className="size-full rounded-full object-cover"
                height={40}
                image={authorImage}
                loading="lazy"
                width={40}
              />
            </div>
          )}
          <div className="flex flex-col text-sm">
            {authorName && (
              <span className="font-semibold text-foreground" data-inline-edit>
                {authorName}
              </span>
            )}
            {authorRole && (
              <span className="text-muted-foreground text-xs" data-inline-edit>
                {authorRole}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SubscribeNewsletter({
  action,
  title,
  subTitle,
  helperText,
  method,
  onSubmit,
  testimonial,
}: Readonly<SubscribeNewsletterProps>) {
  // A cleared Sanity object is still truthy; only treat the testimonial as
  // present when it actually carries content.
  const hasTestimonialContent = Boolean(
    testimonial &&
      (testimonial.eyebrow ||
        testimonial.authorName ||
        testimonial.authorRole ||
        testimonial.authorImage?.id ||
        (Array.isArray(testimonial.quote) && testimonial.quote.length > 0))
  );

  return (
    <section
      className="border-border/40 border-b py-16 md:py-24"
      id="subscribe"
    >
      <div className="container max-w-5xl">
        <div
          className={cn(
            "site-chassis relative overflow-hidden rounded-3xl p-8 sm:p-12",
            hasTestimonialContent &&
              "grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16"
          )}
        >
          <div className="flex flex-col items-start gap-6">
            <div className="flex flex-col items-start gap-3">
              {title && (
                <h2
                  className="text-balance font-bold font-sans text-3xl text-foreground tracking-tight sm:text-4xl"
                  data-inline-edit
                >
                  {title}
                </h2>
              )}
              {subTitle && (
                <RichText
                  className="body-text text-muted-foreground text-sm leading-relaxed"
                  richText={subTitle}
                />
              )}
            </div>
            <div className="flex w-full flex-col items-start gap-3">
              <form
                action={action}
                className="void-input flex w-full max-w-md items-center gap-2 rounded-2xl p-1.5 pl-4 focus-within:ring-2 focus-within:ring-white/20"
                method={method ?? "post"}
                onSubmit={onSubmit}
              >
                <input
                  aria-label="Email address"
                  className="w-full min-w-0 flex-1 bg-transparent py-1.5 text-foreground text-xs outline-none placeholder:text-muted-foreground"
                  name="email"
                  placeholder="Enter your email address"
                  required
                  type="email"
                />
                <SubscribeNewsletterButton />
              </form>
              {helperText && (
                <RichText
                  className="text-muted-foreground text-xs leading-5 [&_a]:underline"
                  richText={helperText}
                />
              )}
            </div>
          </div>
          {hasTestimonialContent && testimonial && (
            <TestimonialPanel testimonial={testimonial} />
          )}
        </div>
      </div>
    </section>
  );
}
