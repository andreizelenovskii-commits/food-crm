import { stopApps, stopPostgres } from "./local-process-manager.mjs";

async function main() {
  await stopApps();
  console.log("Stopped local backend/frontend processes.");

  if (process.argv.includes("--db")) {
    await stopPostgres();
    console.log("Stopped local PostgreSQL container.");
  } else {
    console.log("PostgreSQL left running. Use npm run local:stop -- --db to stop it.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
