import { findBackendDir, run } from "./local-utils.mjs";

async function main() {
  const backendDir = findBackendDir();
  const command = process.argv[2] ?? "show";
  const value = process.argv.slice(3);
  const scriptByCommand = {
    set: "local:time:set",
    reset: "local:time:reset",
    show: "local:time:show",
  };
  const script = scriptByCommand[command];

  if (!script) {
    throw new Error("Use set, reset or show.");
  }

  await run("npm", ["run", script, "--", ...value], { cwd: backendDir });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
