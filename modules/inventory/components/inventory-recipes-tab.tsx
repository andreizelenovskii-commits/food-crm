import { InventoryRecipesActions } from "@/modules/inventory/components/inventory-recipes-actions";
import { RecipeKindLinks } from "@/modules/inventory/components/inventory-recipes-kind-links";
import type {
  TechCardItem,
  TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";
import { INGREDIENT_TECH_CARD_CATEGORY } from "@/modules/tech-cards/tech-cards.types";

export function InventoryRecipesTab({
  techCards,
  techCardProducts,
  clearRecipeDraft,
  canManageInventory,
}: {
  techCards: TechCardItem[];
  techCardProducts: TechCardProductOption[];
  clearRecipeDraft: boolean;
  canManageInventory: boolean;
}) {
  const priceTechCards = techCards.filter((card) => card.category !== INGREDIENT_TECH_CARD_CATEGORY);
  const ingredientTechCards = techCards.filter((card) => card.category === INGREDIENT_TECH_CARD_CATEGORY);

  return (
    <div className="space-y-4">
      <RecipesHero
        techCardsCount={techCards.length}
        priceTechCardsCount={priceTechCards.length}
        ingredientTechCardsCount={ingredientTechCards.length}
      />
      {canManageInventory ? (
        <InventoryRecipesActions products={techCardProducts} clearDraft={clearRecipeDraft} />
      ) : (
        <aside className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-950">Новая техкарта</h2>
            <p className="text-xs leading-5 text-zinc-600">
              Здесь можно будет создавать новые техкарты, если у роли есть право управления складом.
            </p>
          </div>
        </aside>
      )}
      <RecipesList
        techCards={techCards}
        priceTechCards={priceTechCards}
        ingredientTechCards={ingredientTechCards}
        canManageInventory={canManageInventory}
      />
    </div>
  );
}

function RecipesHero({
  techCardsCount,
  priceTechCardsCount,
  ingredientTechCardsCount,
}: {
  techCardsCount: number;
  priceTechCardsCount: number;
  ingredientTechCardsCount: number;
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-white/70 bg-white/78 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl">
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
            Производство
          </p>
          <h2 className="mt-1 text-[1.45rem] font-semibold leading-tight text-zinc-950">
            Технологические карты
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-5 text-zinc-600">
            Состав блюд, нормы расхода и выход готовой позиции для будущего списания со склада.
          </p>
        </div>

        <div className="grid grid-cols-3 overflow-hidden rounded-[18px] border border-red-950/10 bg-white/82 shadow-sm shadow-red-950/5">
          <RecipesHeroStat label="Техкарт" value={techCardsCount} />
          <RecipesHeroStat label="Прайсовых" value={priceTechCardsCount} />
          <RecipesHeroStat label="Ингредиентных" value={ingredientTechCardsCount} />
        </div>
      </div>
    </section>
  );
}

function RecipesHeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 border-l border-red-950/10 px-3 py-3 first:border-l-0 sm:px-4">
      <p className="truncate text-[9px] font-semibold uppercase tracking-[0.08em] text-red-800/55 sm:text-[10px]">{label}</p>
      <p className="mt-2 text-xl font-semibold leading-none text-zinc-950">{value}</p>
    </div>
  );
}

function RecipesList({
  techCards,
  priceTechCards,
  ingredientTechCards,
  canManageInventory,
}: {
  techCards: TechCardItem[];
  priceTechCards: TechCardItem[];
  ingredientTechCards: TechCardItem[];
  canManageInventory: boolean;
}) {
  return (
    <section className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-950">Карты производства</h2>
          <p className="mt-1 text-xs leading-5 text-zinc-600">
            Выбери категорию, проверь состав или открой карту для редактирования.
          </p>
        </div>
        <span className="inline-flex h-8 items-center self-start rounded-full border border-red-100 bg-white/84 px-3 text-xs font-semibold text-red-800">
          Всего: {techCards.length}
        </span>
      </div>
      <RecipeKindLinks
        priceTechCards={priceTechCards}
        ingredientTechCards={ingredientTechCards}
        canManageInventory={canManageInventory}
      />
      {techCards.length === 0 ? (
        <div className="mt-4 rounded-[18px] border border-dashed border-red-950/14 bg-white/70 p-5 text-sm leading-6 text-zinc-500">
          Пока технологических карт ещё нет.
        </div>
      ) : null}
    </section>
  );
}
