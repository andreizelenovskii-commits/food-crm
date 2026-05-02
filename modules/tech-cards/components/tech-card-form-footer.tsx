"use client";

export function TechCardFormFooter({
  description,
  isPending,
  isEditMode,
  onDescriptionChange,
}: {
  description: string;
  isPending: boolean;
  isEditMode: boolean;
  onDescriptionChange: (value: string) => void;
}) {
  return (
    <>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Описание</span>
        <textarea
          name="description"
          rows={4}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="Комментарий по техкарте, составу и приготовлению"
          className="w-full rounded-[12px] border border-zinc-300 px-5 py-4 text-[15px] text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-[12px] bg-zinc-950 px-4 py-3.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
      >
        {isPending ? "Сохраняем..." : isEditMode ? "Сохранить изменения" : "Добавить техкарту"}
      </button>
    </>
  );
}
