import "dotenv/config";
import { assertStrongPassword, hashPassword } from "../modules/auth/auth.password";
import { pool } from "../shared/db/pool";
import { getRequiredEnv } from "../shared/config/env";

async function main() {
  const adminSeedPassword = getRequiredEnv("ADMIN_SEED_PASSWORD");
  assertStrongPassword(adminSeedPassword);
  const existingUser = await pool.query<{ id: number }>(
    `
      SELECT "id"
      FROM "User"
      WHERE "email" = $1
      LIMIT 1
    `,
    ["admin@example.com"],
  );

  if (!existingUser.rowCount) {
    await pool.query(
      `
      INSERT INTO "User" ("email", "password", "role")
      VALUES ($1, $2, $3)
      `,
      ["admin@example.com", hashPassword(adminSeedPassword, { validateStrength: true }), "admin"],
    );
    console.log("Создан пользователь: admin@example.com");
  }

  const existingClient = await pool.query<{ id: number }>(
    `SELECT "id" FROM "Client" WHERE "email" = $1 LIMIT 1`,
    ["client@example.com"],
  );

  if (!existingClient.rowCount) {
    await pool.query(
      `INSERT INTO "Client" ("name", "email", "phone", "address", "notes") VALUES ($1, $2, $3, $4, $5)`,
      ["ООО Ресторан", "client@example.com", "+7 900 123 45 67", "г. Москва, ул. Пушкина, 10", "VIP-клиент"],
    );
  }

  const existingEmployee = await pool.query<{ id: number }>(
    `SELECT "id" FROM "Employee" WHERE "email" = $1 LIMIT 1`,
    ["manager@example.com"],
  );

  if (!existingEmployee.rowCount) {
    await pool.query(
      `INSERT INTO "Employee" ("name", "email", "role", "phone") VALUES ($1, $2, $3, $4)`,
      ["Наталья Иванова", "manager@example.com", "Менеджер", "+7 901 234 56 78"],
    );
  }

  const existingProduct = await pool.query<{ id: number }>(
    `SELECT "id" FROM "Product" WHERE "name" = $1 LIMIT 1`,
    ["Сыр"],
  );

  if (!existingProduct.rowCount) {
    await pool.query(
      `INSERT INTO "Product" ("name", "unit", "priceCents", "description") VALUES ($1, $2, $3, $4)`,
      ["Сыр", "кг", 800, "Твердый сыр"],
    );
  }

  const orderExists = await pool.query<{ id: number }>(
    `SELECT "id" FROM "Order" LIMIT 1`,
  );

  if (!orderExists.rowCount) {
    await pool.query(
      `
      INSERT INTO "Order" ("clientId", "employeeId", "totalCents", "status")
      VALUES (
        (SELECT "id" FROM "Client" WHERE "email" = $1 LIMIT 1),
        (SELECT "id" FROM "Employee" WHERE "email" = $2 LIMIT 1),
        $3,
        $4
      )
      `,
      ["client@example.com", "manager@example.com", 1600, "PENDING"],
    );

    await pool.query(
      `
      INSERT INTO "OrderItem" ("orderId", "productId", "quantity", "unitPriceCents", "totalPriceCents")
      VALUES (
        (SELECT "id" FROM "Order" LIMIT 1),
        (SELECT "id" FROM "Product" WHERE "name" = $1 LIMIT 1),
        $2,
        $3,
        $4
      )
      `,
      ["Сыр", 2, 800, 1600],
    );
  }

  console.log("Seed завершён.");
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
