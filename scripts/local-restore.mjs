import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { existsSync, readdirSync } from "node:fs";
import { basename, resolve } from "node:path";
import {
  assertBackendEnvIsLocal,
  findBackendDir,
  localBackupsDir,
  run,
  waitForPostgres,
} from "./local-utils.mjs";
import { stopApps } from "./local-process-manager.mjs";

function latestBackup() {
  if (!existsSync(localBackupsDir)) return null;
  const files = readdirSync(localBackupsDir)
    .filter((name) => /^food-crm-local-\d{8}-\d{6}\.dump$/.test(name))
    .sort();
  return files.length ? resolve(localBackupsDir, files.at(-1)) : null;
}

async function confirm(file) {
  if (process.argv.includes("--yes")) return;
  const rl = createInterface({ input, output });
  const answer = await rl.question(`Type RESTORE LOCAL DATABASE to restore ${basename(file)}: `);
  rl.close();
  if (answer !== "RESTORE LOCAL DATABASE") {
    throw new Error("Restore cancelled.");
  }
}

async function main() {
  assertBackendEnvIsLocal(findBackendDir());
  const file = process.argv.includes("--last") ? latestBackup() : null;
  if (!file) {
    throw new Error("No local backup found. Run npm run local:backup first.");
  }

  console.log(`Restoring local backup: ${file}`);
  await confirm(file);
  await stopApps();
  await run("docker", ["compose", "up", "-d", "postgres"]);
  await waitForPostgres();
  await run("docker", ["compose", "cp", file, `postgres:/tmp/${basename(file)}`]);
  await run("docker", ["compose", "exec", "-T", "postgres", "dropdb", "-U", "food_crm_local", "--if-exists", "food_crm_local"]);
  await run("docker", ["compose", "exec", "-T", "postgres", "createdb", "-U", "food_crm_local", "food_crm_local"]);
  await run("docker", ["compose", "exec", "-T", "postgres", "pg_restore", "-U", "food_crm_local", "-d", "food_crm_local", `/tmp/${basename(file)}`]);
  await run("node", ["scripts/local-start.mjs"]);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
