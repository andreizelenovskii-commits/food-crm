import type { TechCardItem } from "@/modules/tech-cards/tech-cards.types";

export function IngredientsPreview({
  card,
  compact = false,
}: {
  card: TechCardItem;
  compact?: boolean;
}) {
  return card.ingredients.length > 0 || card.components.length > 0 ? (
    <div className={`mt-3 grid gap-2 ${compact ? "md:grid-cols-3" : "sm:grid-cols-2"}`}>
      {card.components.map((component) => (
        <div
          key={`component-${component.id}`}
          className={`rounded-[12px] border border-red-950/10 bg-white/82 px-3 text-xs shadow-sm shadow-red-950/5 ${compact ? "py-1.5" : "py-2"}`}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold leading-5 text-zinc-800">{component.techCardName}</span>
            <span className="shrink-0 font-semibold text-red-800">
              {formatQuantity(component.quantity)} {component.outputUnit}
            </span>
          </div>
          <p className="mt-1 font-semibold text-zinc-400">
            {component.techCardCategory}
            {component.pizzaSize ? ` · ${component.pizzaSize}` : ""}
            {component.rollSize ? ` · ${component.rollSize}` : ""}
          </p>
        </div>
      ))}
      {card.ingredients.map((ingredient) => (
        <div
          key={ingredient.id}
          className={`rounded-[12px] border border-red-950/10 bg-white/82 px-3 text-xs shadow-sm shadow-red-950/5 ${compact ? "py-1.5" : "py-2"}`}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold leading-5 text-zinc-800">{ingredient.productName}</span>
            <span className="shrink-0 font-semibold text-red-800">
              {formatQuantity(ingredient.quantity)} {ingredient.unit}
            </span>
          </div>
          <p className="mt-1 font-semibold text-zinc-400">
            На 1 {card.outputUnit}: {formatQuantity(ingredient.quantity / card.outputQuantity)} {ingredient.unit}
          </p>
        </div>
      ))}
    </div>
  ) : (
    <div className="mt-3 rounded-[12px] border border-dashed border-red-950/14 bg-white/64 px-3 py-2 text-xs font-medium text-zinc-500">
      Состав не заполнен. Открой редактирование и добавь ингредиенты.
    </div>
  );
}

export function formatQuantity(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 4,
  }).format(value);
}
