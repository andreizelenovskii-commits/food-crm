import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { SurfaceCard } from "@/components/ui/surface-card";

export default function Home() {
  return (
    <PageShell
      title="CRM для доставки еды"
      description="Проект приведён к модульной структуре: страницы стали тонкими, а бизнес-логика и инфраструктура вынесены в отдельные слои."
      align="center"
    >
      <SurfaceCard className="mx-auto max-w-2xl">
        <div className="space-y-6 text-center">
          <p className="text-base leading-7 text-zinc-600">
            Сейчас в проекте уже отделены авторизация, сессии, доступ к базе и
            переиспользуемые UI-компоненты.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Открыть логин
            </Link>
            <Link
              href="/dashboard"
              className="rounded-2xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
            >
              Перейти в dashboard
            </Link>
          </div>
        </div>
      </SurfaceCard>
    </PageShell>
  );
}
