import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { WebsiteControlCenter } from "@/modules/website/components/website-control-center";
import { PUBLIC_SITE_CONTACTS } from "@/shared/config/public-site";
import { PUBLIC_SITE_URL } from "@/shared/deploy-public-urls";

export default async function WebsitePage() {
  const user = await requirePermission("view_dashboard");

  return (
    <PageShell
      title="Сайт и приложение"
      description="Управление публичным сайтом, будущим мобильным приложением, розыгрышами и техническими режимами."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <WebsiteControlCenter
        orderPhoneHref={PUBLIC_SITE_CONTACTS.phoneHref}
        orderPhoneLabel={PUBLIC_SITE_CONTACTS.phoneLabel}
        publicSiteUrl={PUBLIC_SITE_URL}
      />
    </PageShell>
  );
}
