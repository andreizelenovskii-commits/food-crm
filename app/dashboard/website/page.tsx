import { PageShell } from "@/components/ui/page-shell";
import { WebsiteControlCenter } from "@/modules/website/components/website-control-center";
import { PUBLIC_SITE_CONTACTS } from "@/shared/config/public-site";
import { PUBLIC_SITE_URL } from "@/shared/deploy-public-urls";

export default async function WebsitePage() {
  return (
    <PageShell
      title="Сайт и приложение"
      description="Управление публичным сайтом, будущим мобильным приложением, розыгрышами и техническими режимами."
      backHref="/dashboard"
    >
      <WebsiteControlCenter
        orderPhoneHref={PUBLIC_SITE_CONTACTS.phoneHref}
        orderPhoneLabel={PUBLIC_SITE_CONTACTS.phoneLabel}
        publicSiteUrl={PUBLIC_SITE_URL}
      />
    </PageShell>
  );
}
