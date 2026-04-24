import { pool } from "@/shared/db/pool";
import { ensureRecentDatabaseBackup } from "@/shared/db/backup";
import { ValidationError } from "@/shared/errors/app-error";
import type { CatalogItem } from "@/modules/catalog/catalog.types";
import type { CatalogItemInput } from "@/modules/catalog/catalog.validation";

type CatalogRow = {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  priceCents: number;
  isPublished: boolean;
  displayOrder: number;
  createdAt: Date;
  technologicalCardId: number;
  technologicalCardName: string;
};

function mapRowToCatalogItem(row: CatalogRow): CatalogItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description,
    priceCents: row.priceCents,
    isPublished: row.isPublished,
    displayOrder: row.displayOrder,
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
        c."displayOrder",
        c."createdAt",
        c."technologicalCardId",
        t."name" AS "technologicalCardName"
      FROM "CatalogItem" c
      INNER JOIN "TechnologicalCard" t ON t."id" = c."technologicalCardId"
      ORDER BY c."displayOrder" ASC, c."createdAt" DESC
    `,
  );

  return result.rows.map(mapRowToCatalogItem);
}

export async function createCatalogItem(input: CatalogItemInput): Promise<CatalogItem> {
  const existing = await pool.query<{ id: number }>(
    `
      SELECT "id"
      FROM "CatalogItem"
      WHERE "slug" = $1
      LIMIT 1
    `,
    [input.slug],
  );

  if (existing.rowCount) {
    throw new ValidationError("Позиция каталога с таким slug уже существует");
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
        "displayOrder",
        "technologicalCardId"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        "id",
        "name",
        "slug",
        "category",
        "description",
        "priceCents",
        "isPublished",
        "displayOrder",
        "createdAt",
        "technologicalCardId",
        (SELECT "name" FROM "TechnologicalCard" WHERE "id" = $8) AS "technologicalCardName"
    `,
    [
      input.name,
      input.slug,
      input.category,
      input.description,
      input.priceCents,
      input.isPublished,
      input.displayOrder,
      input.technologicalCardId,
    ],
  );

  return mapRowToCatalogItem(result.rows[0]);
}
