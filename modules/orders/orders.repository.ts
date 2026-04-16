import { pool } from "@/shared/db/pool";
import type { OrderListItem, OrderStatus } from "@/modules/orders/orders.types";

type OrderRow = {
  id: number;
  status: OrderStatus;
  clientId: number;
  clientName: string;
  clientType: "CLIENT" | "ORGANIZATION";
  employeeId: number;
  employeeName: string;
  totalCents: number;
  createdAt: Date;
};

function mapRowToOrder(row: OrderRow): OrderListItem {
  return {
    id: row.id,
    status: row.status,
    clientId: row.clientId,
    clientName: row.clientName,
    clientType: row.clientType,
    employeeId: row.employeeId,
    employeeName: row.employeeName,
    totalCents: row.totalCents,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getOrders(): Promise<OrderListItem[]> {
  const result = await pool.query<OrderRow>(
    `
      SELECT
        o."id",
        o."status",
        o."totalCents",
        o."createdAt",
        c."id" AS "clientId",
        c."name" AS "clientName",
        c."type" AS "clientType",
        e."id" AS "employeeId",
        e."name" AS "employeeName"
      FROM "Order" o
      INNER JOIN "Client" c ON c."id" = o."clientId"
      INNER JOIN "Employee" e ON e."id" = o."employeeId"
      ORDER BY o."createdAt" DESC, o."id" DESC
    `,
  );

  return result.rows.map(mapRowToOrder);
}
