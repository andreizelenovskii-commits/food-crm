import "dotenv/config";
import { hashPassword } from "../modules/auth/auth.password";
import { pool } from "../shared/db/pool";

async function main() {
  const existingUser = await pool.query<{ id: number }>(
    `
      SELECT "id"
      FROM "User"
      WHERE "email" = $1
      LIMIT 1
    `,
    ["admin@example.com"],
  );

  if (existingUser.rowCount) {
    console.log("Админ уже существует");
    return;
  }

  const user = await pool.query<{ email: string }>(
    `
      INSERT INTO "User" ("email", "password", "role")
      VALUES ($1, $2, $3)
      RETURNING "email"
    `,
    ["admin@example.com", hashPassword("123456"), "admin"],
  );

  console.log("Создан пользователь:", user.rows[0]?.email);
}

main()
  .then(async () => {
    await pool.end();
  })
  .catch(async (error) => {
    console.error("Ошибка seed:", error);
    await pool.end();
    process.exit(1);
  });
