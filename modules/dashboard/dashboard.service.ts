import { pool } from "@/shared/db/pool";

export type DashboardMetric = {
  label: string;
  value: number;
};

export async function getDashboardMetrics(): Promise<DashboardMetric[]> {
  const result = await Promise.all([
    pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM "Order"`),
    pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM "Client"`),
    pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM "Product"`),
    pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM "Employee"`),
  ]);

  return [
    { label: "Заказы", value: Number(result[0].rows[0]?.count ?? 0) },
    { label: "Клиенты", value: Number(result[1].rows[0]?.count ?? 0) },
    { label: "Товары", value: Number(result[2].rows[0]?.count ?? 0) },
    { label: "Сотрудники", value: Number(result[3].rows[0]?.count ?? 0) },
  ];
}
