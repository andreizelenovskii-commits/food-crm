"use client";

import Image from "next/image";
import { useEffect, useId } from "react";
import {
  type AuthMode,
  PublicAuthSmsForm,
} from "@/modules/catalog/components/public-auth-sms-form";

export type { AuthMode } from "@/modules/catalog/components/public-auth-sms-form";

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function PublicAuthModal({
  mode,
  onClose,
  onModeChange,
}: {
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
}) {
  const titleId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#211316]/58 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[920px] overflow-hidden rounded-[8px] bg-white shadow-2xl shadow-black/24">
        <div className="grid md:grid-cols-[0.86fr_1.14fr]">
          <div className="relative hidden min-h-[580px] overflow-hidden bg-[#d50014] text-white md:block">
            <Image
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1100&q=82"
              alt=""
              fill
              sizes="370px"
              className="object-cover opacity-72"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(190,0,18,0.28)_0%,rgba(116,12,20,0.92)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-7">
              <div className="flex items-center gap-3">
                <span className="relative inline-flex size-12 overflow-hidden rounded-[8px] bg-white shadow-sm">
                  <Image
                    src="/foodlike-app-icon-v3.png"
                    alt=""
                    fill
                    unoptimized
                    sizes="48px"
                    className="scale-[1.1] object-cover object-[50%_58%]"
                  />
                </span>
                <span className="text-lg font-bold uppercase tracking-[0.18em]">
                  FoodLike
                </span>
              </div>
              <p className="mt-5 max-w-xs text-2xl font-semibold leading-tight">
                Вход в профиль для заказов, адресов и любимых блюд.
              </p>
            </div>
          </div>

          <div className="relative px-5 py-5 sm:px-7 sm:py-6">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-[#f1d6d9] bg-white text-[#6b5960] transition hover:border-[#d50014] hover:text-[#d50014]"
              aria-label="Закрыть окно"
            >
              <CloseIcon className="size-5" />
            </button>

            <div className="pr-12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d50014]">
                Личный кабинет
              </p>
              <h2 id={titleId} className="mt-2 text-3xl font-semibold text-[#241316]">
                {mode === "login" ? "Войти в FoodLike" : "Создать аккаунт"}
              </h2>
            </div>

            <PublicAuthSmsForm key={mode} mode={mode} onModeChange={onModeChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
