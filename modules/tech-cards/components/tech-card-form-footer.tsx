"use client";

export function TechCardFormFooter({
  isPending,
  isEditMode,
}: {
  isPending: boolean;
  isEditMode: boolean;
}) {
  return (
    <>
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
