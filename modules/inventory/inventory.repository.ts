import { pool } from "@/shared/db/pool";
import { ValidationError } from "@/shared/errors/app-error";
import type { ProductItem, ProductCategory } from "@/modules/inventory/inventory.types";
import type { ProductInput } from "@/modules/inventory/inventory.validation";

type ProductRow = {
  id: number;
  name: string;
  sku: string | null;
  category: ProductCategory | null;
  unit: string;
  stockQuantity: number;
  priceCents: number;
  description: string | null;
  orderItemsCount?: string;
  createdAt: Date;
};

const PRODUCT_SKU_SQL = `COALESCE(p."sku", CONCAT('PRD-', LPAD(p."id"::text, 5, '0')))` as const;

function mapRowToProduct(row: ProductRow): ProductItem {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
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
    throw new ValidationError("Товар с таким названием уже существует");
  }

  throw error;
}

async function ensureUniqueProductName(name: string, excludeProductId?: number) {
  const result = await pool.query<{ id: number }>(
    `
      SELECT "id"
      FROM "Product"
      WHERE LOWER("name") = LOWER($1)
        AND ($2::int IS NULL OR "id" <> $2)
      LIMIT 1
    `,
    [name, excludeProductId ?? null],
  );

  if (result.rows[0]) {
    throw new ValidationError("Товар с таким названием уже существует");
  }
}

export async function getProducts(): Promise<ProductItem[]> {
  const result = await pool.query<ProductRow>(
    `
      SELECT
        p."id",
        p."name",
        ${PRODUCT_SKU_SQL} AS "sku",
        p."category",
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
        p."category",
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
        ${PRODUCT_SKU_SQL} AS "sku",
        p."category",
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
        p."category",
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
  await ensureUniqueProductName(input.name);
  await pool.query("BEGIN");

  try {
    const insertedProduct = await pool.query<{ id: number }>(
      `
        INSERT INTO "Product" ("name", "category", "unit", "stockQuantity", "priceCents", "description")
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING "id"
      `,
      [
        input.name,
        input.category,
        input.unit,
        input.stockQuantity,
        input.priceCents,
        input.description,
      ],
    );

    const createdProductId = insertedProduct.rows[0]?.id;

    if (!createdProductId) {
      throw new ValidationError("Не удалось создать товар. Попробуйте ещё раз.");
    }

    const result = await pool.query<ProductRow>(
      `
        UPDATE "Product"
        SET "sku" = CONCAT('PRD-', LPAD($2::text, 5, '0'))
        WHERE "id" = $1
        RETURNING "id", "name", "sku", "category", "unit", "stockQuantity", "priceCents", "description", "createdAt"
      `,
      [createdProductId, createdProductId],
    );

    const createdProduct = result.rows[0];

    if (!createdProduct) {
      throw new ValidationError("Не удалось сохранить внутренний код товара.");
    }

    await pool.query("COMMIT");
    return mapRowToProduct(createdProduct);
  } catch (error) {
    await pool.query("ROLLBACK");
    mapProductConflict(error);
  }
}

export async function updateProduct(productId: number, input: ProductInput): Promise<ProductItem | null> {
  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }

  try {
    await ensureUniqueProductName(input.name, productId);
    const result = await pool.query<ProductRow>(
      `
        UPDATE "Product"
        SET
          "name" = $2,
          "category" = $3,
          "unit" = $4,
          "stockQuantity" = $5,
          "priceCents" = $6,
          "description" = $7
        WHERE "id" = $1
        RETURNING "id", "name", "sku", "category", "unit", "stockQuantity", "priceCents", "description", "createdAt"
      `,
      [
        productId,
        input.name,
        input.category,
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
