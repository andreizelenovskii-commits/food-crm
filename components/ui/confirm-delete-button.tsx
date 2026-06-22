"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type ConfirmDeleteButtonProps = {
  action: (formData: FormData) => Promise<{ redirectTo?: string; errorMessage?: string } | void>;
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
  "foodlike-button-secondary relative z-10 min-h-9 px-4 text-red-800 disabled:cursor-not-allowed disabled:opacity-50";

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
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const handleConfirmDelete = () => {
    setSubmitError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();

        hiddenFields.forEach((field) => {
          formData.set(field.name, String(field.value));
        });

        if (!formData.get("redirectTo")) {
          formData.set("redirectTo", currentUrl);
        }

        const result = await action(formData);
        if (result?.errorMessage) {
          setSubmitError(result.errorMessage);
          return;
        }

        const redirectTo = result?.redirectTo?.trim() || currentUrl;

        setIsConfirmOpen(false);

        router.push(redirectTo);
        router.refresh();
      } catch (error) {
        const fallbackMessage = "Не удалось удалить запись. Попробуйте снова.";
        const errorMessage = error instanceof Error && error.message
          ? error.message
          : fallbackMessage;
        setSubmitError(errorMessage);
      }
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
              setSubmitError(null);
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
          className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/40 px-4 py-4 backdrop-blur-sm sm:py-5"
          onClick={() => setIsConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            className="foodlike-frame w-full max-w-md p-4 sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-2">
              <div className="foodlike-pill uppercase tracking-[0.14em]">
                Подтверждение удаления
              </div>
              <h2 className="foodlike-title-sm">
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
                <p className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {disabledMessage}
                </p>
              ) : null}
              {warningMessage ? (
                <p className="rounded-[18px] border border-red-950/10 bg-white/70 px-4 py-3 text-sm text-zinc-700">
                  {warningMessage}
                </p>
              ) : null}
              {submitError ? (
                <p className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {submitError}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="foodlike-button-secondary"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={handleConfirmDelete}
                className="foodlike-button-primary disabled:cursor-not-allowed disabled:opacity-50"
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
