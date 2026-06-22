import { redirect } from "next/navigation";

export default async function EditTechCardPage(props: {
  params?: Promise<{ techCardId: string }>;
}) {
  const params = await props.params;
  const techCardId = Number(params?.techCardId);

  if (!params?.techCardId || !Number.isInteger(techCardId) || techCardId <= 0) {
    redirect("/dashboard/inventory?tab=recipes");
  }

  redirect(`/dashboard/inventory/tech-cards/${techCardId}`);
}
