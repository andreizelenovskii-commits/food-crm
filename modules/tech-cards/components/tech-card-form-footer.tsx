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
        <span className="text-xs font-semibold text-zinc-700">Описание</span>
        <textarea
          name="description"
          rows={4}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="Комментарий по техкарте, составу и приготовлению"
          className="w-full rounded-[14px] border border-red-950/10 bg-white/90 px-4 py-3 text-sm leading-5 text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-[14px] bg-red-800 px-4 text-sm font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-300"
      >
        {isPending ? "Сохраняем..." : isEditMode ? "Сохранить изменения" : "Добавить техкарту"}
      </button>
    </>
  );
}
