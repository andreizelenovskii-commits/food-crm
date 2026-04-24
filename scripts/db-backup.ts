import "dotenv/config";
import { pool } from "../shared/db/pool";
import { createDatabaseBackup } from "../shared/db/backup";

async function main() {
  const reason = process.argv[2] ?? "manual";
  const filePath = await createDatabaseBackup(reason);

  if (!filePath) {
    console.log("DB backup is disabled.");
    return;
  }

  console.log(`Database backup created: ${filePath}`);
}

main()
  .then(async () => {
    await pool.end();
  })
  .catch(async (error) => {
    console.error("Backup failed:", error);
    await pool.end();
    process.exit(1);
  });
