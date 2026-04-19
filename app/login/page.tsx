import { redirect } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { LoginForm } from "@/modules/auth/components/login-form";
import { getSessionUser } from "@/modules/auth/auth.session";

export default async function LoginPage(props: {
  searchParams?: Promise<{ returnTo?: string }>;
}) {
  const currentUser = await getSessionUser();
  const searchParams = await props.searchParams;
  const returnTo = searchParams?.returnTo?.trim() ?? "";

  if (currentUser) {
    redirect(returnTo.startsWith("/") ? returnTo : "/dashboard");
  }

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
