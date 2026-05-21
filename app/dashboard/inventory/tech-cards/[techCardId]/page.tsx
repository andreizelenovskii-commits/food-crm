import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { TechCardForm } from "@/modules/tech-cards/components/tech-card-form";
import {
  fetchTechCardById,
  fetchTechCards,
  fetchTechCardProductOptions,
} from "@/modules/tech-cards/tech-cards.api";

function formatQuantity(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 4,
  }).format(value);
}

export default async function TechCardDetailsPage(props: {
  params?: Promise<{ techCardId: string }>;
}) {
  const user = await requirePermission("view_inventory");
  const params = await props.params;
  const techCardId = Number(params?.techCardId);

  if (!params?.techCardId || !Number.isInteger(techCardId) || techCardId <= 0) {
    notFound();
  }

  const [techCard, products, allTechCards] = await Promise.all([
    fetchTechCardById(techCardId),
    fetchTechCardProductOptions(),
    fetchTechCards(),
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
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(390px,0.82fr)] xl:items-start">
        <section className="space-y-4">
          <article className="rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                  Технологическая карта
                </p>
                <h2 className="mt-1 text-[1.45rem] font-semibold leading-tight text-zinc-950">{techCard.name}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-800 ring-1 ring-red-100">
                    {techCard.category}
                  </span>
                  {techCard.pizzaSize ? (
                    <span className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-500 ring-1 ring-zinc-200">
                      {techCard.pizzaSize}
                    </span>
                  ) : null}
                  {techCard.rollSize ? (
                    <span className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-500 ring-1 ring-zinc-200">
                      {techCard.rollSize}
                    </span>
                  ) : null}
                </div>
              </div>
              <span className="rounded-full border border-red-100 bg-white/84 px-4 py-2 text-xs font-semibold text-red-800">
                Ингредиентов: {techCard.ingredients.length}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[16px] border border-red-950/10 bg-white/84 p-4 shadow-sm shadow-red-950/5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Выход</p>
                <p className="mt-2 text-xl font-semibold text-zinc-950">
                  {formatQuantity(techCard.outputQuantity)} {techCard.outputUnit}
                </p>
              </div>
              <div className="rounded-[16px] border border-red-950/10 bg-white/84 p-4 shadow-sm shadow-red-950/5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Создана</p>
                <p className="mt-2 text-xl font-semibold text-zinc-950">
                  {new Intl.DateTimeFormat("ru-RU").format(new Date(techCard.createdAt))}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
            <h2 className="text-base font-semibold text-zinc-950">Состав техкарты</h2>
            <div className="mt-4 space-y-2">
              {techCard.components.map((component) => (
                <div
                  key={`component-${component.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-red-950/10 bg-white/84 px-4 py-3 text-sm text-zinc-600 shadow-sm shadow-red-950/5"
                >
                  <div>
                    <p className="font-semibold text-zinc-950">{component.techCardName}</p>
                    <p className="mt-0.5 text-xs font-semibold text-zinc-500">
                      {component.techCardCategory}
                      {component.pizzaSize ? ` · ${component.pizzaSize}` : ""}
                      {component.rollSize ? ` · ${component.rollSize}` : ""}
                    </p>
                  </div>
                  <p className="font-semibold text-red-800">
                    {formatQuantity(component.quantity)} {component.outputUnit}
                  </p>
                </div>
              ))}
              {techCard.ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-red-950/10 bg-white/84 px-4 py-3 text-sm text-zinc-600 shadow-sm shadow-red-950/5"
                >
                  <p className="font-semibold text-zinc-950">{ingredient.productName}</p>
                  <div className="text-right">
                    <p className="font-semibold text-red-800">
                      {formatQuantity(ingredient.quantity)} {ingredient.unit}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-zinc-500">
                      На 1 {techCard.outputUnit}:{" "}
                      {formatQuantity(ingredient.quantity / techCard.outputQuantity)} {ingredient.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[16px] border border-red-950/10 bg-red-50/35 p-4">
              <p className="text-xs font-semibold text-zinc-700">Описание</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {techCard.description || "Описание для этой технологической карты пока не заполнено."}
              </p>
            </div>
          </article>
        </section>

        {canManageInventory ? (
          <div className="xl:sticky xl:top-4">
            <TechCardForm
              products={products}
              componentOptions={allTechCards.filter((card) => card.id !== techCard.id)}
              initialTechCard={techCard}
            />
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
