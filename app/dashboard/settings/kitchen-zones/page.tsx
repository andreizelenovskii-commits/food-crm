import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { GlassPanel } from "@/modules/dashboard/components/dashboard-widgets";
import { KITCHEN_ZONE_LABELS, KITCHEN_ZONES } from "@/modules/inventory/inventory.types";

const ZONE_HINTS = {
  pizza: "Пиццы и пиццерийная упаковка.",
  rolls: "Роллы, онигири, суши-доги и упаковка суши-зоны.",
  fastfood: "Фастфуд и горячие блюда с отдельной упаковкой.",
} as const;

export default async function KitchenZonesSettingsPage() {
  const user = await requirePermission("view_settings");

  return (
    <PageShell
      title="Кухонные зоны"
      description="Зоны помогают показывать сотруднику только подходящую упаковку при отдаче блюда."
      backHref="/dashboard/settings"
      action={<SessionUserActions user={user} />}
    >
      <GlassPanel className="p-4 sm:p-5">
        <p className="foodlike-kicker">Кухня</p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Зоны приготовления</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {KITCHEN_ZONES.map((zone) => (
            <div
              key={zone}
              className="rounded-[16px] border border-red-950/10 bg-white/75 p-4"
            >
              <h3 className="text-sm font-semibold text-zinc-950">{KITCHEN_ZONE_LABELS[zone]}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{ZONE_HINTS[zone]}</p>
            </div>
          ))}
        </div>
      </GlassPanel>
    </PageShell>
  );
}
