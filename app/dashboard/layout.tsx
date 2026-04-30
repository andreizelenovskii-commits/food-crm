import { getSessionUser } from "@/modules/auth/auth.session";
import { AuthRedirect } from "@/modules/auth/components/auth-redirect";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  if (!user) {
    return <AuthRedirect href="/login" />;
  }

  return children;
}
