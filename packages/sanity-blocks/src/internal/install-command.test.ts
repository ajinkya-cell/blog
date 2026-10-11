import {
  formatInstallCommand,
  type InstallCommand,
  parseInstallCommand,
} from "./install-command";

function all(command: InstallCommand) {
  return {
    pnpm: formatInstallCommand(command, "pnpm"),
    npm: formatInstallCommand(command, "npm"),
    yarn: formatInstallCommand(command, "yarn"),
    bun: formatInstallCommand(command, "bun"),
  };
}

describe("parseInstallCommand", () => {
  test("translates a plain add across managers", () => {
    const command = parseInstallCommand(
      "npm i next-sanity @sanity/image-url",
      "bash"
    );
    expect(command?.authored).toBe("npm");
    expect(command && all(command)).toEqual({
      pnpm: "pnpm add next-sanity @sanity/image-url",
      npm: "npm install next-sanity @sanity/image-url",
      yarn: "yarn add next-sanity @sanity/image-url",
      bun: "bun add next-sanity @sanity/image-url",
    });
  });

  test("keeps dev installs dev, with bun's own flag", () => {
    const command = parseInstallCommand("$ pnpm add -D vitest@^3", "zsh");
    expect(command && all(command)).toEqual({
      pnpm: "pnpm add -D vitest@^3",
      npm: "npm install -D vitest@^3",
      yarn: "yarn add -D vitest@^3",
      bun: "bun add -d vitest@^3",
    });
  });

  test("a bare install becomes each manager's install", () => {
    const command = parseInstallCommand("npm install", "sh");
    expect(command && all(command)).toEqual({
      pnpm: "pnpm install",
      npm: "npm install",
      yarn: "yarn install",
      bun: "bun install",
    });
  });

  test("leaves anything it can't translate faithfully alone", () => {
    expect(parseInstallCommand("npm i next", "tsx")).toBeNull();
    expect(parseInstallCommand("npm i next\nnpm run dev", "bash")).toBeNull();
    expect(parseInstallCommand("npm i -g vercel", "bash")).toBeNull();
    expect(parseInstallCommand("npm i -d next", "bash")).toBeNull();
    expect(parseInstallCommand("npm i next && npm run dev", "bash")).toBeNull();
    expect(parseInstallCommand("yarn add", "bash")).toBeNull();
    expect(parseInstallCommand("npx create-next-app", "bash")).toBeNull();
  });
});
