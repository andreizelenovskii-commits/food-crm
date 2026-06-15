import { PageShell } from "@/components/ui/page-shell";
import { LoginForm } from "@/modules/auth/components/login-form";
import { PUBLIC_SITE_URL } from "@/shared/deploy-public-urls";

export default async function LoginPage(props: {
  searchParams?: Promise<{ error?: string; returnTo?: string }>;
}) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error?.trim() ?? "";
  const returnTo = searchParams?.returnTo?.trim() ?? "";

  return (
    <PageShell
      title="Служебный вход FoodLike"
      description="Вход для команды ресторана и службы доставки."
      align="center"
      backHref="/"
    >
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <LoginForm returnTo={returnTo} initialError={error} />
        <div className="rounded-[14px] border border-red-100 bg-white/90 px-4 py-4 text-center shadow-sm shadow-red-950/5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
            Навигация
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <a
              href={PUBLIC_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-800 transition hover:bg-red-50/80 sm:text-sm"
            >
              Вернуться на сайт
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
