import Link from "next/link";
import { PaginatedList } from "@/components/ui/paginated-list";
import { TechCardForm } from "@/modules/tech-cards/components/tech-card-form";
import type {
  ProductItem,
} from "@/modules/inventory/inventory.types";
import type {
  TechCardCategory,
  TechCardItem,
  TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";

export function InventoryRecipesTab({
  products,
  techCards,
  techCardProducts,
  filteredTechCards,
  recipeCategorySummaries,
  selectedRecipeCategory,
  clearRecipeDraft,
  canManageInventory,
}: {
  products: ProductItem[];
  techCards: TechCardItem[];
  techCardProducts: TechCardProductOption[];
  filteredTechCards: TechCardItem[];
  recipeCategorySummaries: Array<{ category: TechCardCategory; count: number }>;
  selectedRecipeCategory: string;
  clearRecipeDraft: boolean;
  canManageInventory: boolean;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] xl:items-start">
      <div className="space-y-4">
        <RecipesHero techCardsCount={techCards.length} productsCount={products.length} />
        <RecipesList
          techCards={techCards}
          filteredTechCards={filteredTechCards}
          recipeCategorySummaries={recipeCategorySummaries}
          selectedRecipeCategory={selectedRecipeCategory}
          canManageInventory={canManageInventory}
        />
      </div>

      {canManageInventory ? (
        <TechCardForm products={techCardProducts} clearDraft={clearRecipeDraft} />
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
    </div>
  );
}

function RecipesHero({
  techCardsCount,
  productsCount,
}: {
  techCardsCount: number;
  productsCount: number;
}) {
  return (
    <section className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
        Технологические карты
      </p>
      <h2 className="mt-1 max-w-[18rem] text-[1.35rem] font-semibold leading-tight text-zinc-950">
        Состав и нормы расхода
      </h2>
      <p className="mt-2 max-w-md text-xs leading-5 text-zinc-600">
        Здесь будем связывать продаваемые позиции с ингредиентами и автоматически считать расход склада.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <RecipesHeroStat label="Техкарт" value={techCardsCount} hint="Создано для каталога и кухни" />
        <RecipesHeroStat label="Ингредиенты" value={productsCount} hint="Доступно позиций для состава" />
        <div className="rounded-[18px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">Автосписание</p>
          <p className="mt-3 text-lg font-semibold leading-tight text-zinc-950">В планах</p>
          <p className="mt-2 max-w-48 text-[11px] leading-4 text-zinc-500">
            Следующий этап после настройки техкарт
          </p>
        </div>
      </div>
    </section>
  );
}

function RecipesHeroStat({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-[18px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">{label}</p>
      <p className="mt-3 text-2xl font-semibold leading-none text-zinc-950">{value}</p>
      <p className="mt-2 max-w-48 text-[11px] leading-4 text-zinc-500">{hint}</p>
    </div>
  );
}

function RecipesList({
  techCards,
  filteredTechCards,
  recipeCategorySummaries,
  selectedRecipeCategory,
  canManageInventory,
}: {
  techCards: TechCardItem[];
  filteredTechCards: TechCardItem[];
  recipeCategorySummaries: Array<{ category: TechCardCategory; count: number }>;
  selectedRecipeCategory: string;
  canManageInventory: boolean;
}) {
  return (
    <section className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
      <h2 className="text-base font-semibold text-zinc-950">Список технологических карт</h2>
      <p className="mt-2 text-xs leading-5 text-zinc-600">
        Здесь хранятся реальные технологические карты, которые можно будет связывать с каталогом сайта.
      </p>
      <RecipeCategoryLinks
        recipeCategorySummaries={recipeCategorySummaries}
        selectedRecipeCategory={selectedRecipeCategory}
      />
      <div className="mt-4 space-y-4">
        {filteredTechCards.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-red-950/10 bg-white/70 p-4 text-xs leading-5 text-zinc-500 sm:p-5">
            {techCards.length === 0
              ? "Пока технологических карт ещё нет."
              : "В этой категории технологических карт пока нет."}
          </div>
        ) : (
          <PaginatedList itemLabel="техкарт">
            {filteredTechCards.map((card) => (
              <RecipeCard key={card.id} card={card} canManageInventory={canManageInventory} />
            ))}
          </PaginatedList>
        )}
      </div>
    </section>
  );
}

function RecipeCategoryLinks({
  recipeCategorySummaries,
  selectedRecipeCategory,
}: {
  recipeCategorySummaries: Array<{ category: TechCardCategory; count: number }>;
  selectedRecipeCategory: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Link href="/dashboard/inventory?tab=recipes" scroll={false} className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold transition ${
        !selectedRecipeCategory
          ? "bg-red-800 text-white shadow-sm shadow-red-950/20"
          : "border border-red-100 bg-white/80 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
      }`}>
        Все категории
      </Link>
      {recipeCategorySummaries.map((item) => {
        const isActive = selectedRecipeCategory === item.category;

        return (
          <Link
            key={item.category}
            href={`/dashboard/inventory?tab=recipes&recipeCategory=${encodeURIComponent(item.category)}`}
            scroll={false}
            className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold transition ${
              isActive
                ? "bg-red-800 text-white shadow-sm shadow-red-950/20"
                : "border border-red-100 bg-white/80 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
            }`}
          >
            {item.category} {item.count}
          </Link>
        );
      })}
    </div>
  );
}

function RecipeCard({ card, canManageInventory }: { card: TechCardItem; canManageInventory: boolean }) {
  return (
    <article className="rounded-[18px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-950">{card.name}</h3>
            <p className="text-xs font-semibold text-red-800">{card.category}</p>
            {card.pizzaSize ? <p className="text-xs text-zinc-500">Размер: {card.pizzaSize}</p> : null}
            <p className="text-xs text-zinc-500">Выход: {card.outputQuantity} {card.outputUnit}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-500 ring-1 ring-red-950/10">
              Ингредиентов: {card.ingredients.length}
            </span>
            {canManageInventory ? (
              <Link href={`/dashboard/inventory/tech-cards/${card.id}`} className="rounded-full border border-red-100 bg-white px-3 py-1 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
                Редактировать
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2 text-xs text-zinc-600 sm:grid-cols-2">
          {card.ingredients.map((ingredient) => (
            <p key={ingredient.id} className="rounded-2xl bg-white px-3 py-2 ring-1 ring-red-950/10">
              {ingredient.productName}: {ingredient.quantity} {ingredient.unit}
            </p>
          ))}
        </div>

        {card.description ? <p className="text-xs leading-5 text-zinc-600">{card.description}</p> : null}
      </div>
    </article>
  );
}
