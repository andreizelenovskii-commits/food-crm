import type { TechCardFormKind } from "@/modules/tech-cards/components/tech-card-form";

export function TechCardFormHeader({
  isEditMode,
  errorMessage,
  cardKind,
}: {
  isEditMode: boolean;
  errorMessage: string | null;
  cardKind: TechCardFormKind;
}) {
  const kindLabel = cardKind === "ingredient" ? "ингредиентная" : "прайсовая";

  return (
    <>
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
          {isEditMode ? "Изменение карты" : `Создание: ${kindLabel}`}
        </p>
        <h2 className="text-lg font-semibold leading-tight text-zinc-950">
          {isEditMode ? "Редактирование техкарты" : "Новая техкарта"}
        </h2>
        <p className="text-xs leading-5 text-zinc-600">
          {isEditMode
            ? "Обнови категорию, состав и нормы расхода по каждому ингредиенту."
            : cardKind === "ingredient"
              ? "Создай заготовку или соус, который потом можно использовать как складской ингредиент."
              : "Создай карту для позиции прайса: блюда, комбо, ролла или пиццы."}
        </p>
      </div>

      {errorMessage ? (
        <p className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}
