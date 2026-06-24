import { existsSync, rmSync } from "node:fs";
import { pidFile, readPids, run } from "./local-utils.mjs";

async function main() {
  const pids = readPids();

  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
      console.log(`Stopped local process ${pid}`);
    } catch {
      // Already stopped.
    }
  }

  if (existsSync(pidFile)) {
    rmSync(pidFile, { force: true });
  }

  if (process.argv.includes("--db")) {
    await run("docker", ["compose", "stop", "postgres"]);
    console.log("Stopped local PostgreSQL container.");
  } else {
    console.log("PostgreSQL left running. Use npm run local:stop -- --db to stop it.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
