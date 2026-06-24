import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { resolve } from "node:path";
import {
  assertLocalDatabaseUrl,
  findBackendDir,
  readEnvFile,
  removeIfExists,
  run,
  waitForPostgres,
} from "./local-utils.mjs";
import { stopApps } from "./local-process-manager.mjs";

async function confirm() {
  if (process.argv.includes("--yes")) {
    return;
  }

  const rl = createInterface({ input, output });
  const answer = await rl.question("Type RESET LOCAL DATABASE to continue: ");
  rl.close();

  if (answer !== "RESET LOCAL DATABASE") {
    throw new Error("Reset cancelled.");
  }
}

async function main() {
  const backendDir = findBackendDir();
  const backendEnv = readEnvFile(resolve(backendDir, ".env"));
  assertLocalDatabaseUrl(backendEnv.get("DATABASE_URL") ?? "");
  await confirm();

  await stopApps();
  if (!process.argv.includes("--no-backup")) {
    await run("node", ["scripts/local-backup.mjs"]);
  }
  await run("docker", ["compose", "down", "-v"]);
  await run("docker", ["compose", "up", "-d", "postgres"]);
  await waitForPostgres();
  await run("npm", ["ci"], { cwd: backendDir });
  await run("npx", ["prisma", "generate"], { cwd: backendDir });
  await run("npm", ["run", "db:deploy"], { cwd: backendDir });
  await run("npm", ["run", "db:seed:dev"], { cwd: backendDir });
  removeIfExists(resolve(backendDir, ".local-dev-clock.json"));

  console.log("");
  console.log("Local database reset complete.");
  console.log("Demo users:");
  console.log("Управляющий: +7 900 100-00-01");
  console.log("Диспетчер:   +7 900 100-00-02");
  console.log("Повар:       +7 900 100-00-03");
  console.log("Курьер:      +7 900 100-00-04");
  console.log("Password:    FoodLikeDev1! (local only)");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
