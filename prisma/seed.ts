import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });

  if (existingUser) {
    console.log("Админ уже существует");
    return;
  }

  const user = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: "123456",
      role: "admin",
    },
  });

  console.log("Создан пользователь:", user.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error("Ошибка seed:", error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });