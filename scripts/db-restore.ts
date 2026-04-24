import "dotenv/config";
import { pool } from "../shared/db/pool";
import { getLatestBackupPath, readBackup } from "../shared/db/backup";

function quoteIdentifier(value: string) {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

async function main() {
  const targetPath = process.argv[2] ?? (await getLatestBackupPath());

  if (!targetPath) {
    throw new Error("No backup file found. Pass a file path or create a backup first.");
  }

  const backup = await readBackup(targetPath);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SET session_replication_role = replica");

    const tableNames = backup.meta.tables;

    if (tableNames.length > 0) {
      await client.query(
        `TRUNCATE ${tableNames.map(quoteIdentifier).join(", ")} RESTART IDENTITY CASCADE`,
      );
    }

    for (const tableName of tableNames) {
      const rows = backup.tables[tableName] ?? [];

      for (const row of rows) {
        const entries = Object.entries(row as Record<string, unknown>);

        if (entries.length === 0) {
          continue;
        }

        const columns = entries.map(([key]) => quoteIdentifier(key));
        const values = entries.map(([, value]) => value);
        const placeholders = entries.map((_, index) => `$${index + 1}`);

        await client.query(
          `INSERT INTO ${quoteIdentifier(tableName)} (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`,
          values,
        );
      }
    }

    await client.query("SET session_replication_role = origin");
    await client.query("COMMIT");
    console.log(`Database restored from backup: ${targetPath}`);
  } catch (error) {
    try {
      await client.query("SET session_replication_role = origin");
    } catch {
      // ignore restore cleanup errors
    }

    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

main()
  .then(async () => {
    await pool.end();
  })
  .catch(async (error) => {
    console.error("Restore failed:", error);
    await pool.end();
    process.exit(1);
  });
