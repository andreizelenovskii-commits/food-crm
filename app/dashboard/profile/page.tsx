import { ProfileRouteClient } from "@/modules/profile/components/profile-route-client";
import { normalizeProfileMonth } from "@/modules/profile/profile.page-model";

export default async function ProfilePage(props: {
  searchParams?: Promise<{ month?: string }>;
}) {
  const searchParams = await props.searchParams;
  const month = normalizeProfileMonth(searchParams?.month);

  return <ProfileRouteClient month={month} />;
}
