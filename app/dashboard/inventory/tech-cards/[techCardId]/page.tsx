import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { TechCardForm } from "@/modules/tech-cards/components/tech-card-form";
import {
  fetchTechCardById,
  fetchTechCardProductOptions,
} from "@/modules/tech-cards/tech-cards.api";

export default async function TechCardDetailsPage(props: {
  params?: Promise<{ techCardId: string }>;
}) {
  const user = await requirePermission("view_inventory");
  const params = await props.params;
  const techCardId = Number(params?.techCardId);

  if (!params?.techCardId || !Number.isInteger(techCardId) || techCardId <= 0) {
    notFound();
  }

  const [techCard, products] = await Promise.all([
    fetchTechCardById(techCardId),
    fetchTechCardProductOptions(),
  ]);

  if (!techCard) {
    notFound();
  }

  const canManageInventory = hasPermission(user, "manage_inventory");

  return (
    <PageShell
      title={techCard.name}
      description="Карточка технологической карты: здесь можно проверить состав и обновить данные."
      backHref="/dashboard/inventory?tab=recipes"
      action={<SessionUserActions user={user} />}
    >
      <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="space-y-6">
          <article className="rounded-[32px] border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f1f6ff_100%)] p-6 shadow-sm shadow-zinc-950/5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Технологическая карта
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-950">{techCard.name}</h2>
                <p className="mt-2 text-sm font-medium text-emerald-700">{techCard.category}</p>
                {techCard.pizzaSize ? (
                  <p className="mt-1 text-sm text-zinc-500">Размер: {techCard.pizzaSize}</p>
                ) : null}
              </div>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-600 ring-1 ring-zinc-200">
                Ингредиентов: {techCard.ingredients.length}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/90 bg-white/90 p-4">
                <p className="text-sm font-medium text-zinc-500">Выход</p>
                <p className="mt-3 text-xl font-semibold text-zinc-950">
                  {techCard.outputQuantity} {techCard.outputUnit}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/90 bg-white/90 p-4">
                <p className="text-sm font-medium text-zinc-500">Создана</p>
                <p className="mt-3 text-xl font-semibold text-zinc-950">
                  {new Intl.DateTimeFormat("ru-RU").format(new Date(techCard.createdAt))}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[32px] border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">Состав техкарты</h2>
            <div className="mt-5 space-y-3">
              {techCard.ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="rounded-[24px] border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600"
                >
                  <p className="font-medium text-zinc-950">{ingredient.productName}</p>
                  <p className="mt-1">
                    {ingredient.quantity} {ingredient.unit}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[24px] border border-zinc-100 bg-zinc-50 p-4">
              <p className="text-sm font-medium text-zinc-700">Описание</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {techCard.description || "Описание для этой технологической карты пока не заполнено."}
              </p>
            </div>
          </article>
        </section>

        {canManageInventory ? (
          <TechCardForm products={products} initialTechCard={techCard} />
        ) : null}
      </div>
    </PageShell>
  );
}
