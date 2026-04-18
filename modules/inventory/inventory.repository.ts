import { pool } from "@/shared/db/pool";
import { ValidationError } from "@/shared/errors/app-error";
import type { ProductItem } from "@/modules/inventory/inventory.types";
import type { ProductInput } from "@/modules/inventory/inventory.validation";

type ProductRow = {
  id: number;
  name: string;
  sku: string | null;
  unit: string;
  stockQuantity: number;
  priceCents: number;
  description: string | null;
  orderItemsCount?: string;
  createdAt: Date;
};

function mapRowToProduct(row: ProductRow): ProductItem {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    unit: row.unit,
    stockQuantity: row.stockQuantity,
    priceCents: row.priceCents,
    description: row.description,
    orderItemsCount: Number(row.orderItemsCount ?? 0),
    createdAt: row.createdAt.toISOString(),
  };
}

function mapProductConflict(error: unknown): never {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    throw new ValidationError("Товар с таким SKU уже существует");
  }

  throw error;
}

export async function getProducts(): Promise<ProductItem[]> {
  const result = await pool.query<ProductRow>(
    `
      SELECT
        p."id",
        p."name",
        p."sku",
        p."unit",
        p."stockQuantity",
        p."priceCents",
        p."description",
        p."createdAt",
        COUNT(oi."id") AS "orderItemsCount"
      FROM "Product" p
      LEFT JOIN "OrderItem" oi ON oi."productId" = p."id"
      GROUP BY
        p."id",
        p."name",
        p."sku",
        p."unit",
        p."stockQuantity",
        p."priceCents",
        p."description",
        p."createdAt"
      ORDER BY p."createdAt" DESC, p."id" DESC
    `,
  );

  return result.rows.map(mapRowToProduct);
}

export async function getProductById(productId: number): Promise<ProductItem | null> {
  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }

  const result = await pool.query<ProductRow>(
    `
      SELECT
        p."id",
        p."name",
        p."sku",
        p."unit",
        p."stockQuantity",
        p."priceCents",
        p."description",
        p."createdAt",
        COUNT(oi."id") AS "orderItemsCount"
      FROM "Product" p
      LEFT JOIN "OrderItem" oi ON oi."productId" = p."id"
      WHERE p."id" = $1
      GROUP BY
        p."id",
        p."name",
        p."sku",
        p."unit",
        p."stockQuantity",
        p."priceCents",
        p."description",
        p."createdAt"
      LIMIT 1
    `,
    [productId],
  );

  return result.rows[0] ? mapRowToProduct(result.rows[0]) : null;
}

export async function createProduct(input: ProductInput): Promise<ProductItem> {
  try {
    const result = await pool.query<ProductRow>(
      `
        INSERT INTO "Product" ("name", "sku", "unit", "stockQuantity", "priceCents", "description")
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING "id", "name", "sku", "unit", "stockQuantity", "priceCents", "description", "createdAt"
      `,
      [
        input.name,
        input.sku,
        input.unit,
        input.stockQuantity,
        input.priceCents,
        input.description,
      ],
    );

    return mapRowToProduct(result.rows[0]);
  } catch (error) {
    mapProductConflict(error);
  }
}

export async function updateProduct(productId: number, input: ProductInput): Promise<ProductItem | null> {
  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }

  try {
    const result = await pool.query<ProductRow>(
      `
        UPDATE "Product"
        SET
          "name" = $2,
          "sku" = $3,
          "unit" = $4,
          "stockQuantity" = $5,
          "priceCents" = $6,
          "description" = $7
        WHERE "id" = $1
        RETURNING "id", "name", "sku", "unit", "stockQuantity", "priceCents", "description", "createdAt"
      `,
      [
        productId,
        input.name,
        input.sku,
        input.unit,
        input.stockQuantity,
        input.priceCents,
        input.description,
      ],
    );

    return result.rows[0] ? mapRowToProduct(result.rows[0]) : null;
  } catch (error) {
    mapProductConflict(error);
  }
}

export async function deleteProduct(productId: number): Promise<boolean> {
  if (!Number.isInteger(productId) || productId <= 0) {
    return false;
  }

  const usageResult = await pool.query<{ count: string }>(
    `
      SELECT COUNT(*) AS count
      FROM "OrderItem"
      WHERE "productId" = $1
    `,
    [productId],
  );

  if (Number(usageResult.rows[0]?.count ?? 0) > 0) {
    return false;
  }

  const result = await pool.query(
    `
      DELETE FROM "Product"
      WHERE "id" = $1
    `,
    [productId],
  );

  return (result.rowCount ?? 0) > 0;
}
