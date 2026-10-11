import { XIcon } from "./icons";

export interface TweetEmbedProps {
  url?: string | null;
  caption?: string | null;
}

export function TweetEmbed({ url, caption }: Readonly<TweetEmbedProps>) {
  if (!url) {
    return null;
  }

  return (
    <figure className="not-prose my-8 flex flex-col items-center">
      <div className="site-chassis w-full max-w-lg overflow-hidden rounded-2xl border border-border/40 p-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <XIcon className="size-4 text-foreground" />
            <span>Post on X</span>
          </div>
        </div>
        {caption ? (
          <p className="my-3 font-normal text-foreground text-sm italic">
            "{caption}"
          </p>
        ) : null}
        <a
          className="text-xs text-foreground/80 underline underline-offset-4 hover:text-foreground"
          href={url}
          rel="noopener noreferrer"
          target="_blank"
        >
          View discussion on X →
        </a>
      </div>
    </figure>
  );
}
