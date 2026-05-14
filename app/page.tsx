import Image from "next/image";
import type { Metadata } from "next";
import { fetchCurrentClient } from "@/modules/clients/clients.api";
import { PublicSiteHeader } from "@/modules/catalog/components/public-site-header";
import type { CatalogItem } from "@/modules/catalog/catalog.types";
import { CATALOG_SITE_CATEGORIES } from "@/modules/catalog/catalog.types";
import { backendGetOptional } from "@/shared/api/backend";

export const metadata: Metadata = {
  title: "FoodLike | Доставка еды",
  description:
    "FoodLike: доставка пиццы, роллов и горячих блюд. Меню, условия доставки и контакты.",
};

type PublicMenuItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  priceCents: number;
  imageUrl: string;
};

const FALLBACK_MENU_ITEMS: PublicMenuItem[] = [
  {
    id: "signature-pizza",
    name: "Маргарита с базиликом",
    category: "Пицца",
    description: "Тонкое тесто, томаты, моцарелла и свежий базилик.",
    priceCents: 59000,
    imageUrl:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "salmon-roll",
    name: "Ролл с лососем",
    category: "Роллы",
    description: "Лосось, сливочный сыр, рис и хрустящий огурец.",
    priceCents: 52000,
    imageUrl:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "warm-bowl",
    name: "Боул с курицей",
    category: "Горячее",
    description: "Курица, овощи, рис, соус и зелень для плотного обеда.",
    priceCents: 64000,
    imageUrl:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
  },
];

const FALLBACK_MENU_IMAGES = [
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=900&q=80",
];

const DELIVERY_STEPS = [
  ["01", "Выбираете блюда", "Собираете заказ из меню или звоните нам."],
  ["02", "Готовим свежим", "Кухня получает заказ в CRM и готовит по техкартам."],
  ["03", "Привозим горячим", "Курьер доставляет аккуратно и вовремя."],
] as const;

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

async function getPublicMenuItems(): Promise<PublicMenuItem[]> {
  const catalogItems = await backendGetOptional<CatalogItem[]>("/api/v1/catalog");
  const publicItems = catalogItems
    ?.filter((item) => item.priceListType === "CLIENT")
    .slice(0, 6)
    .map((item, index) => ({
      id: String(item.id),
      name: item.name,
      category: item.category ?? "Меню",
      description:
        item.description ??
        `Позиция из клиентского прайса${item.pizzaSize ? `, размер ${item.pizzaSize}` : ""}.`,
      priceCents: item.priceCents,
      imageUrl: item.imageUrl ?? FALLBACK_MENU_IMAGES[index % FALLBACK_MENU_IMAGES.length],
    }));

  return publicItems?.length ? publicItems : FALLBACK_MENU_ITEMS;
}

export default async function Home() {
  const [menuItems, currentClient] = await Promise.all([
    getPublicMenuItems(),
    fetchCurrentClient(),
  ]);
  const categories = Array.from(new Set(menuItems.map((item) => item.category)));

  return (
    <>
      <PublicSiteHeader
        categories={CATALOG_SITE_CATEGORIES}
        currentClient={currentClient}
      />
      <main className="min-h-screen bg-white text-[#211316]">
      <section className="relative min-h-[92vh] overflow-hidden bg-[#d50014] text-white">
        <Image
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2200&q=82"
          alt="Горячие блюда FoodLike на столе"
          className="absolute inset-0 h-full w-full object-cover opacity-58"
          fill
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(170,0,18,0.98)_0%,rgba(213,0,20,0.78)_48%,rgba(213,0,20,0.22)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl items-end px-5 pb-14 pt-28 sm:px-8 lg:pb-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/86">
              Доставка еды
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-[0.96] sm:text-7xl lg:text-8xl">
              FoodLike
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/84 sm:text-xl">
              Пицца, роллы и горячие блюда для обеда, вечера и больших заказов.
              Готовим свежим, упаковываем аккуратно, привозим без лишней суеты.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#menu"
                className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#c90013] shadow-sm shadow-black/12 transition hover:bg-[#ffe8ea]"
              >
                Смотреть меню
              </a>
              <a
                href="tel:+79990000000"
                className="inline-flex justify-center rounded-full border border-white/42 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#c90013]"
              >
                Позвонить
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d50014]">
                Меню FoodLike
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[#241316] sm:text-5xl">
                Популярное сегодня
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-[#ffd7dc] bg-[#fff5f6] px-4 py-2 text-sm font-semibold text-[#b00012]"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {menuItems.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-[8px] border border-[#ffe0e3] bg-white shadow-sm shadow-[#d50014]/8"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#fff1f2]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d50014]">
                        {item.category}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-[#241316]">
                        {item.name}
                      </h3>
                    </div>
                    <p className="shrink-0 text-lg font-semibold text-[#c90013]">
                      {formatMoney(item.priceCents)}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#6b5960]">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="delivery" className="bg-[#fff5f6] py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d50014]">
              Как работаем
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[#241316] sm:text-5xl">
              Быстро от кухни до двери
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {DELIVERY_STEPS.map(([number, title, text]) => (
              <article key={number} className="rounded-[8px] border border-[#ffe0e3] bg-white p-5 shadow-sm shadow-[#d50014]/8">
                <p className="text-sm font-semibold text-[#d50014]">{number}</p>
                <h3 className="mt-4 text-lg font-semibold text-[#241316]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6b5960]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="bg-[#d50014] py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-5 sm:px-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/82">
              Контакты
            </p>
            <h2 className="mt-3 text-3xl font-semibold">FoodLike на связи</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
              Здесь поставим реальные телефон, адрес и мессенджеры, когда
              финализируем клиентскую витрину и онлайн-заказы.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="tel:+79990000000"
              className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-[#c90013] transition hover:bg-[#ffe8ea]"
            >
              +7 999 000-00-00
            </a>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
