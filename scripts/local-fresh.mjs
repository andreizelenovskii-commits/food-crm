import { run } from "./local-utils.mjs";

async function main() {
  await run("node", ["scripts/local-backup.mjs"]);
  await run("node", ["scripts/local-reset.mjs", "--yes", "--no-backup"]);
  await run("node", ["scripts/local-start.mjs", "--open"]);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
