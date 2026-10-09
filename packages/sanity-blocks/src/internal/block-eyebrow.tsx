export function BlockEyebrow({
  eyebrow,
}: Readonly<{ eyebrow?: string | null }>) {
  if (!eyebrow) {
    return null;
  }

  return (
    <span
      className="recessed-well inline-flex w-fit items-center self-start justify-self-start rounded-full border border-white/[0.08] px-3 py-1 font-mono text-muted-foreground text-xs uppercase tracking-wider"
      data-inline-edit
    >
      {eyebrow}
    </span>
  );
}
