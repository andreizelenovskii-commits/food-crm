import { redirect } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { LoginForm } from "@/modules/auth/components/login-form";
import { getSessionUser } from "@/modules/auth/auth.session";

export default async function LoginPage() {
  const currentUser = await getSessionUser();

  if (currentUser) {
    redirect("/dashboard");
  }

  return (
    <PageShell
      title="Доступ в систему"
      description="Авторизация вынесена в отдельный модуль: маршрут отвечает только за экран, а не за бизнес-логику."
      align="center"
      backHref="/"
    >
      <LoginForm />
    </PageShell>
  );
}
