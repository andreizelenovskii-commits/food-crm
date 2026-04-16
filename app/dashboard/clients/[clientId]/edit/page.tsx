import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { ClientForm } from "@/modules/clients/components/client-form";
import { fetchClientById } from "@/modules/clients/clients.service";

export default async function ClientEditPage(props: {
  params?: Promise<{ clientId: string }>;
}) {
  const user = await requirePermission("manage_clients");
  const params = await props.params;
  const clientId = Number(params?.clientId);

  if (!params || !params.clientId || !Number.isInteger(clientId) || clientId <= 0) {
    notFound();
  }

  const client = await fetchClientById(clientId);

  if (!client) {
    notFound();
  }

  return (
    <PageShell
      title={client.type === "ORGANIZATION" ? "Редактирование организации" : "Редактирование клиента"}
      description={`Измени данные записи ${client.name}. После сохранения вернёшься в профиль.`}
      backHref={`/dashboard/clients/${client.id}`}
      action={<SessionUserActions user={user} />}
    >
      <div className="mx-auto max-w-2xl">
        <ClientForm type={client.type} initialClient={client} />
      </div>
    </PageShell>
  );
}
