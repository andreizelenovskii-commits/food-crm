"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type ConfirmDeleteButtonProps = {
  action: (formData: FormData) => Promise<{ redirectTo?: string } | void>;
  ariaLabel: string;
  entityLabel: string;
  entityName: string;
  disabled?: boolean;
  disabledMessage?: string;
  warningMessage?: string;
  hiddenFields?: Array<{
    name: string;
    value: string | number;
  }>;
  buttonClassName?: string;
};

const DEFAULT_BUTTON_CLASS_NAME =
  "relative z-10 rounded-2xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400";

export function ConfirmDeleteButton({
  action,
  ariaLabel,
  entityLabel,
  entityName,
  disabled = false,
  disabledMessage,
  warningMessage,
  hiddenFields = [],
  buttonClassName = DEFAULT_BUTTON_CLASS_NAME,
}: ConfirmDeleteButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const formData = new FormData();

      hiddenFields.forEach((field) => {
        formData.set(field.name, String(field.value));
      });

      if (!formData.get("redirectTo")) {
        formData.set("redirectTo", currentUrl);
      }

      const result = await action(formData);
      const redirectTo = result?.redirectTo?.trim() || currentUrl;

      setIsConfirmOpen(false);

      if (redirectTo === currentUrl) {
        router.refresh();
        return;
      }

      router.replace(redirectTo, { scroll: false });
    });
  };

  return (
    <>
      <div className="relative z-10 shrink-0">
        {hiddenFields.map((field) => (
          <input
            key={field.name}
            type="hidden"
            name={field.name}
            value={field.value}
          />
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsConfirmOpen(true);
            }
          }}
            className={buttonClassName}
          >
            Удалить
          </button>
      </div>

      {isConfirmOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/45 px-4 py-4 sm:py-5 backdrop-blur-sm"
          onClick={() => setIsConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            className="w-full max-w-md rounded-[14px] border border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#fff8f8_100%)] p-4 sm:p-5 shadow-2xl shadow-zinc-950/25"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-2">
              <div className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-800">
                Подтверждение удаления
              </div>
              <h2 className="text-xl font-semibold text-zinc-950">
                Удалить {entityLabel.toLowerCase()}?
              </h2>
              <p className="text-sm leading-6 text-zinc-600">
                {entityLabel}{" "}
                <span className="font-medium text-zinc-950">
                  &quot;{entityName}&quot;
                </span>{" "}
                будет удален(а) без возможности восстановления.
              </p>
              {disabledMessage ? (
                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {disabledMessage}
                </p>
              ) : null}
              {warningMessage ? (
                <p className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                  {warningMessage}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={handleConfirmDelete}
                className="rounded-2xl bg-red-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {isPending ? "Удаляем..." : "Да, удалить"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
