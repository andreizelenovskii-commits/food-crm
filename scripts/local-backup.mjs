import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";
import {
  assertBackendEnvIsLocal,
  ensureDockerReady,
  ensureLocalDirs,
  findBackendDir,
  localBackupsDir,
  run,
} from "./local-utils.mjs";

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
}

function backupFiles() {
  if (!existsSync(localBackupsDir)) return [];
  return readdirSync(localBackupsDir)
    .filter((name) => /^food-crm-local-\d{8}-\d{6}\.dump$/.test(name))
    .map((name) => resolve(localBackupsDir, name))
    .sort();
}

function pruneOldBackups(keep = 10) {
  const files = backupFiles();
  for (const file of files.slice(0, Math.max(0, files.length - keep))) {
    rmSync(file, { force: true });
  }
}

async function main() {
  ensureLocalDirs();
  assertBackendEnvIsLocal(findBackendDir());
  await ensureDockerReady();
  const target = resolve(localBackupsDir, `food-crm-local-${stamp()}.dump`);
  await run("docker", [
    "compose",
    "exec",
    "-T",
    "postgres",
    "pg_dump",
    "-U",
    "food_crm_local",
    "-Fc",
    "-d",
    "food_crm_local",
    "-f",
    `/tmp/${basename(target)}`,
  ]);
  await run("docker", ["compose", "cp", `postgres:/tmp/${basename(target)}`, target]);
  pruneOldBackups();
  const sizeKb = Math.ceil(statSync(target).size / 1024);
  console.log(`Backup created: ${target} (${sizeKb} KB)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
