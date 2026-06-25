import { resolve } from "node:path";
import {
  assertLocalDatabaseUrl,
  findBackendDir,
  frontendDir,
  readEnvFile,
  repairLocalAuthEnv,
  run,
  waitForPostgres,
  writeBackendEnvIfMissing,
  writeFrontendEnvIfMissing,
} from "./local-utils.mjs";

async function main() {
  const backendDir = findBackendDir();
  console.log(`Frontend: ${frontendDir}`);
  console.log(`Backend:  ${backendDir}`);

  await run("node", ["--version"], { stdio: "inherit" });
  await run("npm", ["--version"], { stdio: "inherit" });
  await run("docker", ["--version"], { stdio: "inherit" });
  await run("docker", ["compose", "up", "-d", "postgres"]);
  await waitForPostgres();

  const frontendEnvCreated = writeFrontendEnvIfMissing();
  const backendEnvCreated = writeBackendEnvIfMissing(backendDir);
  const envRepair = repairLocalAuthEnv(backendDir);
  const backendEnv = readEnvFile(resolve(backendDir, ".env"));
  assertLocalDatabaseUrl(backendEnv.get("DATABASE_URL") ?? "");

  await run("npm", ["ci"], { cwd: backendDir });
  await run("npx", ["prisma", "generate"], { cwd: backendDir });
  await run("npm", ["run", "db:deploy"], { cwd: backendDir });
  await run("npm", ["run", "db:seed:dev"], { cwd: backendDir });
  await run("npm", ["ci"], { cwd: frontendDir });

  console.log("");
  console.log("Local setup complete.");
  console.log(`Frontend .env.local: ${frontendEnvCreated ? "created" : "kept existing"}`);
  console.log(`Backend .env: ${backendEnvCreated ? "created" : "kept existing"}`);
  if (envRepair.frontendChanged || envRepair.backendChanged) {
    console.log("Local auth env was repaired. Restart local services before logging in.");
  }
  console.log("Database: food_crm_local on localhost");
  console.log("Demo password: FoodLikeDev1! (local only)");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
