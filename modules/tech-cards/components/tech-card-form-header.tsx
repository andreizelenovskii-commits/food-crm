export function TechCardFormHeader({
  isEditMode,
  errorMessage,
}: {
  isEditMode: boolean;
  errorMessage: string | null;
}) {
  return (
    <>
      <div className="space-y-2">
        <h2 className="text-[1.85rem] font-semibold leading-[1.08] tracking-[-0.02em] text-zinc-950">
          {isEditMode ? "Редактирование техкарты" : "Новая техкарта"}
        </h2>
        <p className="max-w-2xl text-[15px] leading-7 text-zinc-600">
          {isEditMode
            ? "Обнови категорию, состав и нормы расхода по каждому ингредиенту."
            : "Создай техкарту, собери состав в диалоге и задай нормы расхода по каждому ингредиенту."}
        </p>
      </div>

      {errorMessage ? (
        <p className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}
