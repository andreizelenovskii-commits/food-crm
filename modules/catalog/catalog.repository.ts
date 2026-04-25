import { pool } from "@/shared/db/pool";
import { ensureRecentDatabaseBackup } from "@/shared/db/backup";
import { ValidationError } from "@/shared/errors/app-error";
import type {
  CatalogItem,
  CatalogPriceListType,
} from "@/modules/catalog/catalog.types";
import type { CatalogItemInput } from "@/modules/catalog/catalog.validation";

type CatalogRow = {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  priceCents: number;
  isPublished: boolean;
  createdAt: Date;
  technologicalCardId: number;
  technologicalCardName: string;
};

function slugifyCatalogItemName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function buildCatalogSlug(input: Pick<CatalogItemInput, "name" | "priceListType" | "technologicalCardId">) {
  const baseSlug = slugifyCatalogItemName(input.name) || "catalog-item";

  return `${baseSlug}-${input.priceListType.toLowerCase()}-${input.technologicalCardId}`;
}

function mapPriceListType(isPublished: boolean): CatalogPriceListType {
  return isPublished ? "CLIENT" : "INTERNAL";
}

function mapRowToCatalogItem(row: CatalogRow): CatalogItem {
  return {
    id: row.id,
    name: row.name,
    priceListType: mapPriceListType(row.isPublished),
    category: row.category,
    description: row.description,
    priceCents: row.priceCents,
    createdAt: row.createdAt.toISOString(),
    technologicalCardId: row.technologicalCardId,
    technologicalCardName: row.technologicalCardName,
  };
}

export async function getCatalogItems(): Promise<CatalogItem[]> {
  const result = await pool.query<CatalogRow>(
    `
      SELECT
        c."id",
        c."name",
        c."slug",
        c."category",
        c."description",
        c."priceCents",
        c."isPublished",
        c."createdAt",
        c."technologicalCardId",
        t."name" AS "technologicalCardName"
      FROM "CatalogItem" c
      INNER JOIN "TechnologicalCard" t ON t."id" = c."technologicalCardId"
      ORDER BY c."category" ASC NULLS LAST, c."createdAt" DESC
    `,
  );

  return result.rows.map(mapRowToCatalogItem);
}

export async function getCatalogItemById(id: number): Promise<CatalogItem | null> {
  const result = await pool.query<CatalogRow>(
    `
      SELECT
        c."id",
        c."name",
        c."slug",
        c."category",
        c."description",
        c."priceCents",
        c."isPublished",
        c."createdAt",
        c."technologicalCardId",
        t."name" AS "technologicalCardName"
      FROM "CatalogItem" c
      INNER JOIN "TechnologicalCard" t ON t."id" = c."technologicalCardId"
      WHERE c."id" = $1
      LIMIT 1
    `,
    [id],
  );

  if (!result.rowCount) {
    return null;
  }

  return mapRowToCatalogItem(result.rows[0]);
}

export async function createCatalogItem(input: CatalogItemInput): Promise<CatalogItem> {
  const slug = buildCatalogSlug(input);
  const existing = await pool.query<{ id: number }>(
    `
      SELECT "id"
      FROM "CatalogItem"
      WHERE "technologicalCardId" = $1
        AND "isPublished" = $2
      LIMIT 1
    `,
    [input.technologicalCardId, input.priceListType === "CLIENT"],
  );

  if (existing.rowCount) {
    throw new ValidationError("Эта технологическая карта уже добавлена в выбранный прайс");
  }

  await ensureRecentDatabaseBackup("catalog-item-create");
  const result = await pool.query<CatalogRow>(
    `
      INSERT INTO "CatalogItem" (
        "name",
        "slug",
        "category",
        "description",
        "priceCents",
        "isPublished",
        "technologicalCardId"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        "id",
        "name",
        "slug",
        "category",
        "description",
        "priceCents",
        "isPublished",
        "createdAt",
        "technologicalCardId",
        (SELECT "name" FROM "TechnologicalCard" WHERE "id" = $7) AS "technologicalCardName"
    `,
    [
      input.name,
      slug,
      input.category,
      input.description,
      input.priceCents,
      input.priceListType === "CLIENT",
      input.technologicalCardId,
    ],
  );

  return mapRowToCatalogItem(result.rows[0]);
}

export async function updateCatalogItem(
  id: number,
  input: CatalogItemInput,
): Promise<CatalogItem | null> {
  const slug = buildCatalogSlug(input);
  const existing = await pool.query<{ id: number }>(
    `
      SELECT "id"
      FROM "CatalogItem"
      WHERE "technologicalCardId" = $1
        AND "isPublished" = $2
        AND "id" <> $3
      LIMIT 1
    `,
    [input.technologicalCardId, input.priceListType === "CLIENT", id],
  );

  if (existing.rowCount) {
    throw new ValidationError("Эта технологическая карта уже добавлена в выбранный прайс");
  }

  await ensureRecentDatabaseBackup("catalog-item-update");
  const result = await pool.query<CatalogRow>(
    `
      UPDATE "CatalogItem"
      SET
        "name" = $2,
        "slug" = $3,
        "category" = $4,
        "description" = $5,
        "priceCents" = $6,
        "isPublished" = $7,
        "technologicalCardId" = $8
      WHERE "id" = $1
      RETURNING
        "id",
        "name",
        "slug",
        "category",
        "description",
        "priceCents",
        "isPublished",
        "createdAt",
        "technologicalCardId",
        (SELECT "name" FROM "TechnologicalCard" WHERE "id" = $8) AS "technologicalCardName"
    `,
    [
      id,
      input.name,
      slug,
      input.category,
      input.description,
      input.priceCents,
      input.priceListType === "CLIENT",
      input.technologicalCardId,
    ],
  );

  if (!result.rowCount) {
    return null;
  }

  return mapRowToCatalogItem(result.rows[0]);
}

export async function deleteCatalogItem(id: number): Promise<boolean> {
  await ensureRecentDatabaseBackup("catalog-item-delete");
  const result = await pool.query(
    `
      DELETE FROM "CatalogItem"
      WHERE "id" = $1
    `,
    [id],
  );

  return (result.rowCount ?? 0) > 0;
}
