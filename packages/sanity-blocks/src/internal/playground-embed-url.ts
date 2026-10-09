function parseCodeSandbox(
  parsed: URL,
  provider?: string | null
): string | null {
  if (
    provider !== "codesandbox" &&
    !parsed.hostname.includes("codesandbox.io")
  ) {
    return null;
  }
  if (parsed.pathname.includes("/embed/")) {
    return parsed.href;
  }
  const sandboxId =
    parsed.pathname.replace(/^\/(s|p\/sandbox)\//, "").split("/")[0] ||
    parsed.pathname.split("/").filter(Boolean).pop();

  return sandboxId
    ? `https://codesandbox.io/embed/${sandboxId}?fontsize=14&hidenavigation=1&theme=dark`
    : null;
}

function parseStackBlitz(parsed: URL, provider?: string | null): string | null {
  if (
    provider !== "stackblitz" &&
    !parsed.hostname.includes("stackblitz.com")
  ) {
    return null;
  }
  if (parsed.searchParams.has("embed")) {
    return parsed.href;
  }
  const editId = parsed.pathname.replace(/^\/edit\//, "").split("/")[0];
  return editId
    ? `https://stackblitz.com/edit/${editId}?embed=1&view=preview`
    : null;
}

function parseCodePen(parsed: URL, provider?: string | null): string | null {
  if (provider !== "codepen" && !parsed.hostname.includes("codepen.io")) {
    return null;
  }
  if (parsed.pathname.includes("/embed/")) {
    return parsed.href;
  }
  const parts = parsed.pathname.split("/").filter(Boolean);
  const user = parts[0];
  const slug = parts[2] || parts[1];
  return user && slug
    ? `https://codepen.io/${user}/embed/${slug}?default-tab=html,result&theme-id=dark`
    : null;
}

/**
 * Converts public sandbox URLs into responsive embed iframe URLs for
 * CodeSandbox, StackBlitz, and CodePen.
 */
export function getPlaygroundEmbedUrl(
  url?: string | null,
  provider?: string | null
): string | null {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);

    const cs = parseCodeSandbox(parsed, provider);
    if (cs) {
      return cs;
    }

    const sb = parseStackBlitz(parsed, provider);
    if (sb) {
      return sb;
    }

    const cp = parseCodePen(parsed, provider);
    if (cp) {
      return cp;
    }

    return trimmed;
  } catch {
    return null;
  }
}
