export const PACKAGE_MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const;

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export type InstallCommand = {
  /** The manager the author wrote the command for — the default tab. */
  readonly authored: PackageManager;
  readonly packages: readonly string[];
  readonly dev: boolean;
};

const SHELL_LANGUAGES = new Set(["bash", "sh", "zsh"]);
const INSTALL_VERBS = new Set(["i", "install", "add"]);
const DEV_FLAGS = new Set(["-D", "--save-dev", "--dev"]);
// Only bun reads `-d` as dev — to npm it means verbose logging.
const BUN_DEV_FLAG = "-d";
// Package names and version specs only — anything else (a URL, a path, a
// second command) means this isn't a plain install we can translate.
// The name must start with a word character so a flag (`-g`) never passes.
const PACKAGE_SPEC = /^(@[\w.-]+\/)?\w[\w.-]*(@[\w.^~<>=*|-]+)?$/;

function isPackageManager(value: string | undefined): value is PackageManager {
  return PACKAGE_MANAGERS.includes(value as PackageManager);
}

// The words of a single-line shell block, without a leading `$` prompt.
function commandWords(
  code?: string | null,
  language?: string | null
): string[] | null {
  if (!(code && language && SHELL_LANGUAGES.has(language))) {
    return null;
  }
  const lines = code.trim().split("\n");
  if (lines.length !== 1) {
    return null;
  }
  return (lines[0] ?? "")
    .replace(/^\$\s*/, "")
    .trim()
    .split(/\s+/);
}

function isDevFlag(manager: PackageManager, word: string): boolean {
  return DEV_FLAGS.has(word) || (manager === "bun" && word === BUN_DEV_FLAG);
}

/**
 * Recognises a shell block that is exactly one package install — `npm i x`,
 * `pnpm add -D y`, `yarn add`, `bun add` — so it can render as a switcher.
 * Any flag besides a dev flag, or anything after the packages, returns `null`
 * and the block stays an ordinary code window: a wrong translation is worse
 * than none.
 */
export function parseInstallCommand(
  code?: string | null,
  language?: string | null
): InstallCommand | null {
  const [manager, verb, ...rest] = commandWords(code, language) ?? [];
  if (!(isPackageManager(manager) && verb && INSTALL_VERBS.has(verb))) {
    return null;
  }

  let dev = false;
  const packages: string[] = [];
  for (const word of rest) {
    if (isDevFlag(manager, word)) {
      dev = true;
    } else if (PACKAGE_SPEC.test(word)) {
      packages.push(word);
    } else {
      return null;
    }
  }
  // A bare `install` / `i` installs the project's dependencies, which every
  // manager spells `<manager> install`. `add`, or a dev flag, with nothing to
  // add is an error.
  if (packages.length === 0 && (dev || verb === "add")) {
    return null;
  }
  return { authored: manager, packages, dev };
}

export function formatInstallCommand(
  command: InstallCommand,
  manager: PackageManager
): string {
  if (command.packages.length === 0) {
    return `${manager} install`;
  }
  const verb = manager === "npm" ? "install" : "add";
  let flag = "";
  if (command.dev) {
    flag = manager === "bun" ? " -d" : " -D";
  }
  return `${manager} ${verb}${flag} ${command.packages.join(" ")}`;
}
