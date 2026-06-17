import { redirect } from "next/navigation";
import { LoginForm } from "@/modules/auth/components/login-form";
import { getSessionUser } from "@/modules/auth/auth.session";
import { getUserHomePath } from "@/modules/auth/auth.redirect";

export default async function LoginPage(props: {
  searchParams?: Promise<{ error?: string; message?: string; reason?: string; returnTo?: string }>;
}) {
  const user = await getSessionUser();
  if (user) {
    redirect(getUserHomePath(user));
  }

  const searchParams = await props.searchParams;
  const error = searchParams?.error?.trim() || searchParams?.message?.trim() || "";
  const reason = searchParams?.reason?.trim() ?? "";
  const returnTo = searchParams?.returnTo?.trim() ?? "";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff4f4_0%,#fffafa_38%,#f6f1f1_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <LoginForm returnTo={returnTo} initialError={error} initialReason={reason} />
      </div>
    </main>
  );
}
