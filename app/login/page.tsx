import { PageShell } from "@/components/ui/page-shell";
import { LoginForm } from "@/modules/auth/components/login-form";

export default async function LoginPage(props: {
  searchParams?: Promise<{ returnTo?: string }>;
}) {
  const searchParams = await props.searchParams;
  const returnTo = searchParams?.returnTo?.trim() ?? "";

  return (
    <PageShell
      title="Доступ в систему"
      description="Авторизация вынесена в отдельный модуль: маршрут отвечает только за экран, а не за бизнес-логику."
      align="center"
      backHref="/"
    >
      <LoginForm returnTo={returnTo} />
    </PageShell>
  );
}
