function parseYouTube(parsed: URL, autoPlayParam: string): string | null {
  const isStandard =
    parsed.hostname === "www.youtube.com" ||
    parsed.hostname === "youtube.com" ||
    parsed.hostname === "m.youtube.com";

  if (isStandard) {
    let videoId = parsed.searchParams.get("v");
    if (!videoId && parsed.pathname.startsWith("/shorts/")) {
      videoId = parsed.pathname.replace("/shorts/", "").split("/")[0] ?? null;
    } else if (!videoId && parsed.pathname.startsWith("/embed/")) {
      videoId = parsed.pathname.replace("/embed/", "").split("/")[0] ?? null;
    }
    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1${autoPlayParam}`;
    }
  }

  if (parsed.hostname === "youtu.be") {
    const videoId = parsed.pathname.replace(/^\//, "").split("/")[0];
    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1${autoPlayParam}`;
    }
  }

  return null;
}

function parseVimeo(
  parsed: URL,
  trimmed: string,
  autoPlayParam: string
): string | null {
  if (parsed.hostname === "vimeo.com" || parsed.hostname === "www.vimeo.com") {
    const idMatch = parsed.pathname.match(/\/(\d+)/);
    const vimeoId = idMatch?.[1];
    if (vimeoId) {
      const vimeoAutoPlay = autoPlayParam ? "?autoplay=1&muted=1" : "";
      return `https://player.vimeo.com/video/${vimeoId}${vimeoAutoPlay}`;
    }
  }

  if (parsed.hostname === "player.vimeo.com") {
    return trimmed;
  }

  return null;
}

/**
 * Normalizes YouTube and Vimeo URLs into safe embed URLs suitable for iframes.
 */
export function getVideoEmbedUrl(
  url?: string | null,
  options?: { autoPlay?: boolean }
): string | null {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    const autoPlayParam = options?.autoPlay ? "&autoplay=1&mute=1" : "";

    const yt = parseYouTube(parsed, autoPlayParam);
    if (yt) {
      return yt;
    }

    const vm = parseVimeo(parsed, trimmed, autoPlayParam);
    if (vm) {
      return vm;
    }

    return null;
  } catch {
    return null;
  }
}
