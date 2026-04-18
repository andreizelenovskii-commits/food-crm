import { pool } from "@/shared/db/pool";
import { ValidationError } from "@/shared/errors/app-error";
import type {
  TechCardIngredientItem,
  TechCardItem,
  TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";
import type { TechCardInput } from "@/modules/tech-cards/tech-cards.validation";

type TechCardRow = {
  id: number;
  name: string;
  outputQuantity: number;
  outputUnit: string;
  description: string | null;
  createdAt: Date;
};

function mapTechCardRow(row: TechCardRow, ingredients: TechCardIngredientItem[]): TechCardItem {
  return {
    id: row.id,
    name: row.name,
    outputQuantity: row.outputQuantity,
    outputUnit: row.outputUnit,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
    ingredients,
  };
}

export async function getTechCardProductOptions(): Promise<TechCardProductOption[]> {
  const result = await pool.query<{ id: number; name: string; unit: string }>(
    `
      SELECT "id", "name", "unit"
      FROM "Product"
      ORDER BY "name" ASC
    `,
  );

  return result.rows;
}

export async function getTechCards(): Promise<TechCardItem[]> {
  const cardsResult = await pool.query<TechCardRow>(
    `
      SELECT "id", "name", "outputQuantity", "outputUnit", "description", "createdAt"
      FROM "TechnologicalCard"
      ORDER BY "createdAt" DESC, "id" DESC
    `,
  );

  if (!cardsResult.rowCount) {
    return [];
  }

  const ingredientsResult = await pool.query<{
    id: number;
    technologicalCardId: number;
    productId: number;
    productName: string;
    productUnit: string;
    quantity: number;
  }>(
    `
      SELECT
        i."id",
        i."technologicalCardId",
        i."productId",
        p."name" AS "productName",
        p."unit" AS "productUnit",
        i."quantity"
      FROM "TechCardIngredient" i
      INNER JOIN "Product" p ON p."id" = i."productId"
      ORDER BY i."id" ASC
    `,
  );

  const ingredientsByCard = ingredientsResult.rows.reduce<Record<number, TechCardIngredientItem[]>>(
    (acc, row) => {
      const current = acc[row.technologicalCardId] ?? [];
      current.push({
        id: row.id,
        productId: row.productId,
        productName: row.productName,
        productUnit: row.productUnit,
        quantity: row.quantity,
      });
      acc[row.technologicalCardId] = current;
      return acc;
    },
    {},
  );

  return cardsResult.rows.map((row) => mapTechCardRow(row, ingredientsByCard[row.id] ?? []));
}

export async function getTechCardOptions(): Promise<Array<{ id: number; name: string }>> {
  const result = await pool.query<{ id: number; name: string }>(
    `
      SELECT "id", "name"
      FROM "TechnologicalCard"
      ORDER BY "name" ASC
    `,
  );

  return result.rows;
}

export async function createTechCard(input: TechCardInput): Promise<TechCardItem> {
  await pool.query("BEGIN");

  try {
    const existing = await pool.query<{ id: number }>(
      `
        SELECT "id"
        FROM "TechnologicalCard"
        WHERE LOWER("name") = LOWER($1)
        LIMIT 1
      `,
      [input.name],
    );

    if (existing.rowCount) {
      throw new ValidationError("Технологическая карта с таким названием уже существует");
    }

    const cardResult = await pool.query<TechCardRow>(
      `
        INSERT INTO "TechnologicalCard" ("name", "outputQuantity", "outputUnit", "description")
        VALUES ($1, $2, $3, $4)
        RETURNING "id", "name", "outputQuantity", "outputUnit", "description", "createdAt"
      `,
      [input.name, input.outputQuantity, input.outputUnit, input.description],
    );

    const card = cardResult.rows[0];
    const ingredients: TechCardIngredientItem[] = [];

    for (const ingredient of input.ingredients) {
      const ingredientResult = await pool.query<{
        id: number;
        productId: number;
        productName: string;
        productUnit: string;
        quantity: number;
      }>(
        `
          INSERT INTO "TechCardIngredient" ("technologicalCardId", "productId", "quantity")
          VALUES ($1, $2, $3)
          RETURNING
            "id",
            "productId",
            (SELECT "name" FROM "Product" WHERE "id" = $2) AS "productName",
            (SELECT "unit" FROM "Product" WHERE "id" = $2) AS "productUnit",
            "quantity"
        `,
        [card.id, ingredient.productId, ingredient.quantity],
      );

      const createdIngredient = ingredientResult.rows[0];

      ingredients.push({
        id: createdIngredient.id,
        productId: createdIngredient.productId,
        productName: createdIngredient.productName,
        productUnit: createdIngredient.productUnit,
        quantity: createdIngredient.quantity,
      });
    }

    await pool.query("COMMIT");
    return mapTechCardRow(card, ingredients);
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
}
