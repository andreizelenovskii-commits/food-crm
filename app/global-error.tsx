"use client";

import { useEffect } from "react";

function isRedirectDigest(error: Error & { digest?: string }) {
  return error.digest?.includes("NEXT_REDIRECT") || error.message.includes("NEXT_REDIRECT");
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isRedirect = isRedirectDigest(error);

  useEffect(() => {
    if (isRedirect) {
      window.location.replace("/login");
    }
  }, [isRedirect]);

  return (
    <html lang="ru">
      <body>
        <main className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="max-w-md rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm shadow-zinc-950/5">
            <h1 className="text-2xl font-semibold text-zinc-950">
              {isRedirect ? "Переходим ко входу" : "Страница временно недоступна"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {isRedirect
                ? "Если переход не сработал автоматически, откройте экран входа."
                : "Обновите страницу или попробуйте ещё раз через минуту."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {isRedirect ? (
                <a
                  href="/login"
                  className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white"
                >
                  Открыть вход
                </a>
              ) : (
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white"
                >
                  Обновить
                </button>
              )}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
