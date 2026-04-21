import { pool } from "@/shared/db/pool";
import { ValidationError } from "@/shared/errors/app-error";
import type {
  InventoryResponsibleOption,
  InventorySession,
  InventorySessionItem,
  InventorySessionSummary,
  ProductItem,
  ProductCategory,
} from "@/modules/inventory/inventory.types";
import type {
  CreateInventorySessionInput,
  InventoryAuditEntryInput,
  ProductInput,
} from "@/modules/inventory/inventory.validation";

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

type InventorySessionRow = {
  id: number;
  responsibleEmployeeId: number;
  responsibleEmployeeName: string;
  responsibleEmployeeRole: string;
  notes: string | null;
  createdAt: Date;
  itemsCount?: string;
};

type InventorySessionItemRow = {
  id: number;
  inventorySessionId: number;
  productId: number;
  productName: string;
  productCategory: string | null;
  productUnit: string;
  stockQuantity: number;
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

export type InventoryAuditResult = {
  checkedCount: number;
  updatedCount: number;
  differenceCount: number;
};

function mapInventorySessionItem(row: InventorySessionItemRow): InventorySessionItem {
  return {
    id: row.id,
    productId: row.productId,
    productName: row.productName,
    productCategory: row.productCategory,
    productUnit: row.productUnit,
    stockQuantity: row.stockQuantity,
  };
}

function mapInventorySession(
  row: InventorySessionRow,
  items: InventorySessionItem[],
): InventorySession {
  return {
    id: row.id,
    responsibleEmployeeId: row.responsibleEmployeeId,
    responsibleEmployeeName: row.responsibleEmployeeName,
    responsibleEmployeeRole: row.responsibleEmployeeRole,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    items,
  };
}

async function getInventorySessionItemsBySessionIds(sessionIds: number[]) {
  if (sessionIds.length === 0) {
    return {} as Record<number, InventorySessionItem[]>;
  }

  const result = await pool.query<InventorySessionItemRow>(
    `
      SELECT
        i."id",
        i."inventorySessionId",
        i."productId",
        i."productName",
        i."productCategory",
        i."productUnit",
        i."stockQuantity"
      FROM "InventorySessionItem" i
      WHERE i."inventorySessionId" = ANY($1::int[])
      ORDER BY LOWER(i."productName") ASC, i."id" ASC
    `,
    [sessionIds],
  );

  return result.rows.reduce<Record<number, InventorySessionItem[]>>((acc, row) => {
    const current = acc[row.inventorySessionId] ?? [];
    current.push(mapInventorySessionItem(row));
    acc[row.inventorySessionId] = current;
    return acc;
  }, {});
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

export async function getInventoryResponsibleOptions(): Promise<InventoryResponsibleOption[]> {
  const result = await pool.query<{
    id: number;
    name: string;
    role: string;
  }>(
    `
      SELECT "id", "name", "role"
      FROM "Employee"
      ORDER BY LOWER("name") ASC, "id" ASC
    `,
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
  }));
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

export async function applyInventoryAudit(entries: InventoryAuditEntryInput[]): Promise<InventoryAuditResult> {
  if (entries.length === 0) {
    throw new ValidationError("Укажи фактический остаток хотя бы для одной позиции");
  }

  const productIds = entries.map((entry) => entry.productId);
  const currentProducts = await pool.query<Pick<ProductRow, "id" | "stockQuantity">>(
    `
      SELECT "id", "stockQuantity"
      FROM "Product"
      WHERE "id" = ANY($1::int[])
    `,
    [productIds],
  );

  if (currentProducts.rows.length !== entries.length) {
    throw new ValidationError("Часть товаров для инвентаризации уже недоступна. Обнови страницу и попробуй снова.");
  }

  const stockById = new Map(
    currentProducts.rows.map((row) => [row.id, row.stockQuantity]),
  );
  const changedEntries = entries.filter((entry) => stockById.get(entry.productId) !== entry.actualQuantity);

  await pool.query("BEGIN");

  try {
    for (const entry of changedEntries) {
      await pool.query(
        `
          UPDATE "Product"
          SET "stockQuantity" = $2
          WHERE "id" = $1
        `,
        [entry.productId, entry.actualQuantity],
      );
    }

    await pool.query("COMMIT");

    return {
      checkedCount: entries.length,
      updatedCount: changedEntries.length,
      differenceCount: changedEntries.length,
    };
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
}

export async function createInventorySession(input: CreateInventorySessionInput): Promise<InventorySession> {
  const responsibleResult = await pool.query<{ id: number; name: string; role: string }>(
    `
      SELECT "id", "name", "role"
      FROM "Employee"
      WHERE "id" = $1
      LIMIT 1
    `,
    [input.responsibleEmployeeId],
  );

  const responsible = responsibleResult.rows[0];

  if (!responsible) {
    throw new ValidationError("Ответственный сотрудник не найден");
  }

  const productsResult = await pool.query<ProductRow>(
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
        p."createdAt"
      FROM "Product" p
      WHERE p."id" = ANY($1::int[])
      ORDER BY LOWER(p."name") ASC, p."id" ASC
    `,
    [input.productIds],
  );

  if (productsResult.rows.length !== input.productIds.length) {
    throw new ValidationError("Часть выбранных товаров уже недоступна. Обнови страницу и собери лист заново.");
  }

  await pool.query("BEGIN");

  try {
    const sessionResult = await pool.query<InventorySessionRow>(
      `
        INSERT INTO "InventorySession" ("responsibleEmployeeId", "notes")
        VALUES ($1, $2)
        RETURNING
          "id",
          "responsibleEmployeeId",
          "notes",
          "createdAt"
      `,
      [input.responsibleEmployeeId, input.notes],
    );

    const session = sessionResult.rows[0];

    if (!session) {
      throw new ValidationError("Не удалось создать лист инвентаризации");
    }

    const items: InventorySessionItem[] = [];

    for (const productId of input.productIds) {
      const product = productsResult.rows.find((row) => row.id === productId);

      if (!product) {
        continue;
      }

      const itemResult = await pool.query<InventorySessionItemRow>(
        `
          INSERT INTO "InventorySessionItem" (
            "inventorySessionId",
            "productId",
            "productName",
            "productCategory",
            "productUnit",
            "stockQuantity"
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING
            "id",
            "inventorySessionId",
            "productId",
            "productName",
            "productCategory",
            "productUnit",
            "stockQuantity"
        `,
        [
          session.id,
          product.id,
          product.name,
          product.category,
          product.unit,
          product.stockQuantity,
        ],
      );

      const createdItem = itemResult.rows[0];

      if (createdItem) {
        items.push(mapInventorySessionItem(createdItem));
      }
    }

    await pool.query("COMMIT");

    return mapInventorySession(
      {
        ...session,
        responsibleEmployeeName: responsible.name,
        responsibleEmployeeRole: responsible.role,
      },
      items,
    );
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
}

export async function getInventorySessions(): Promise<InventorySessionSummary[]> {
  const sessionsResult = await pool.query<InventorySessionRow>(
    `
      SELECT
        s."id",
        s."responsibleEmployeeId",
        e."name" AS "responsibleEmployeeName",
        e."role" AS "responsibleEmployeeRole",
        s."notes",
        s."createdAt",
        COUNT(i."id") AS "itemsCount"
      FROM "InventorySession" s
      INNER JOIN "Employee" e ON e."id" = s."responsibleEmployeeId"
      LEFT JOIN "InventorySessionItem" i ON i."inventorySessionId" = s."id"
      GROUP BY
        s."id",
        s."responsibleEmployeeId",
        e."name",
        e."role",
        s."notes",
        s."createdAt"
      ORDER BY s."createdAt" DESC, s."id" DESC
    `,
  );

  const itemsBySessionId = await getInventorySessionItemsBySessionIds(
    sessionsResult.rows.map((row) => row.id),
  );

  return sessionsResult.rows.map((row) => {
    const items = itemsBySessionId[row.id] ?? [];

    return {
      id: row.id,
      responsibleEmployeeId: row.responsibleEmployeeId,
      responsibleEmployeeName: row.responsibleEmployeeName,
      responsibleEmployeeRole: row.responsibleEmployeeRole,
      notes: row.notes,
      createdAt: row.createdAt.toISOString(),
      itemsCount: Number(row.itemsCount ?? items.length),
      totalQuantity: items.reduce((sum, item) => sum + item.stockQuantity, 0),
      categories: Array.from(
        new Set(
          items
            .map((item) => item.productCategory)
            .filter((category): category is string => Boolean(category)),
        ),
      ),
      items,
    };
  });
}
