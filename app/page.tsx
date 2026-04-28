import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { CatalogItem } from "@/modules/catalog/catalog.types";
import { backendGetOptional } from "@/shared/api/backend";

export const metadata: Metadata = {
  title: "CRM Andromeda | Доставка еды",
  description:
    "Публичный сайт CRM Andromeda: меню, доставка, контакты и быстрый переход для сотрудников.",
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
    description: "Нежный лосось, сливочный сыр, рис и хрустящий огурец.",
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

const MENU_IMAGES = [
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
];

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
      imageUrl: MENU_IMAGES[index % MENU_IMAGES.length],
    }));

  return publicItems?.length ? publicItems : FALLBACK_MENU_ITEMS;
}

export default async function Home() {
  const menuItems = await getPublicMenuItems();
  const categories = Array.from(new Set(menuItems.map((item) => item.category)));

  return (
    <main className="min-h-screen bg-[#f7faf5] text-[#121614]">
      <section className="relative min-h-[92vh] overflow-hidden bg-[#121614] text-white">
        <Image
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=2200&q=80"
          alt="Готовые блюда для доставки"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          fill
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,16,14,0.92)_0%,rgba(17,16,14,0.64)_48%,rgba(17,16,14,0.18)_100%)]" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="text-xl font-semibold tracking-[0.18em] uppercase">
            Andromeda
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-white/78 md:flex">
            <a href="#menu" className="transition hover:text-white">
              Меню
            </a>
            <a href="#delivery" className="transition hover:text-white">
              Доставка
            </a>
            <a href="#contacts" className="transition hover:text-white">
              Контакты
            </a>
          </nav>
          <Link
            href="/login"
            className="rounded-full border border-white/28 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#121614]"
          >
            CRM
          </Link>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(92vh-88px)] max-w-7xl items-end px-5 pb-14 pt-12 sm:px-8 lg:pb-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#f3c14b]">
              Доставка еды
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-[0.96] sm:text-7xl lg:text-8xl">
              Andromeda
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82 sm:text-xl">
              Горячие блюда, роллы и пицца для быстрых обедов, уютных вечеров и
              командных заказов. Готовим по техкартам, доставляем аккуратно.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#menu"
                className="inline-flex justify-center rounded-full bg-[#f3c14b] px-6 py-3 text-sm font-semibold text-[#121614] transition hover:bg-[#f7d674]"
              >
                Смотреть меню
              </a>
              <a
                href="tel:+79990000000"
                className="inline-flex justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#121614]"
              >
                Позвонить
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="bg-[#f7faf5] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0f7a5a]">
                Клиентский прайс
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[#121614] sm:text-5xl">
                Популярное в меню
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-[#cbded2] bg-white/70 px-4 py-2 text-sm font-semibold text-[#24463a]"
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
                className="overflow-hidden rounded-[8px] border border-[#d7e5dc] bg-white shadow-sm shadow-[#0f2a21]/6"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#e3efe8]">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    loading="lazy"
                    width={900}
                    height={675}
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f7a5a]">
                        {item.category}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-[#121614]">
                        {item.name}
                      </h3>
                    </div>
                    <p className="shrink-0 text-lg font-semibold text-[#121614]">
                      {formatMoney(item.priceCents)}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#596962]">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="delivery" className="bg-[#eef6ee] py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0f7a5a]">
              Как работаем
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[#121614] sm:text-5xl">
              Заказ без лишней суеты
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["01", "Принимаем заказ", "Уточняем блюда, адрес и удобное время."],
              ["02", "Готовим по карте", "Кухня видит состав, граммовки и статус заказа."],
              ["03", "Доставляем", "Передаём горячее и отмечаем заказ в CRM."],
            ].map(([number, title, text]) => (
              <article key={number} className="rounded-[8px] bg-white p-5 shadow-sm shadow-[#0f2a21]/6">
                <p className="text-sm font-semibold text-[#0f7a5a]">{number}</p>
                <h3 className="mt-4 text-lg font-semibold text-[#121614]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#596962]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="bg-[#121614] py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-5 sm:px-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f3c14b]">
              Контакты
            </p>
            <h2 className="mt-3 text-3xl font-semibold">Готовы принять заказ</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              Телефон и мессенджеры можно заменить на реальные контакты, когда
              финализируем публичную витрину и онлайн-заказы.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="tel:+79990000000"
              className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-[#121614] transition hover:bg-[#f3c14b]"
            >
              +7 999 000-00-00
            </a>
            <Link
              href="/login"
              className="rounded-full border border-white/25 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#121614]"
            >
              Вход для сотрудников
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
