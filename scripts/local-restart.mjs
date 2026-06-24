import { stopApps } from "./local-process-manager.mjs";
import { run } from "./local-utils.mjs";

async function main() {
  await stopApps();
  await run("node", ["scripts/local-start.mjs", ...process.argv.slice(2)]);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
