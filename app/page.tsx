import Image from "next/image";
import type { Metadata } from "next";
import { fetchCurrentClient } from "@/modules/clients/clients.api";
import { PublicAccountSection } from "@/modules/catalog/components/public-account-section";
import { PublicMenuSection } from "@/modules/catalog/components/public-menu-section";
import { PublicSiteHeader } from "@/modules/catalog/components/public-site-header";
import { fetchPublicCatalogItems } from "@/modules/catalog/catalog.api";
import { PUBLIC_MENU_CATEGORY_LINKS, type CatalogItem } from "@/modules/catalog/catalog.types";
import { matchesMenuCategory } from "@/modules/catalog/components/public-menu-category-utils";
import { PUBLIC_SITE_CONTACTS } from "@/shared/config/public-site";

export const metadata: Metadata = {
  title: "FoodLike | Доставка еды",
  description:
    "FoodLike: доставка пиццы, роллов и горячих блюд. Меню, условия доставки и контакты.",
};

const CUSTOMER_REVIEWS = [
  ["Анна", "Пицца приехала горячей, роллы аккуратные, а заказ на сайте собрался за минуту."],
  ["Игорь", "Понравилось, что можно выбрать размер и сразу убрать лишние ингредиенты."],
  ["Марина", "Доставка без суеты: всё подписано, упаковано чисто, дети довольны десертами."],
] as const;

const RELEASE_UPDATES = [
  "Полностью обновлённое меню и интерфейс сайта.",
  "Улучшенная система лояльности.",
  "Еженедельные розыгрыши и специальные акции.",
  "Более быстрая и удобная система доставки.",
  "Улучшенная обратная связь и поддержка пользователей.",
  "Повышенная стабильность и производительность сервиса.",
] as const;

function scoreFeaturedItem(item: CatalogItem, seed: number) {
  const source = `${item.id}:${item.name}:${seed}`;
  return Array.from(source).reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 9973, 7);
}

function getFeaturedMenuItems(items: CatalogItem[]) {
  const daySeed = Math.floor(Date.now() / 86_400_000);
  return [...items]
    .sort((left, right) => scoreFeaturedItem(left, daySeed) - scoreFeaturedItem(right, daySeed))
    .slice(0, 6);
}

export default async function Home() {
  const [menuItems, currentClient] = await Promise.all([
    fetchPublicCatalogItems().catch(() => []),
    fetchCurrentClient(),
  ]);
  const headerCategories = PUBLIC_MENU_CATEGORY_LINKS.filter((category) =>
    menuItems.some((item) => matchesMenuCategory(item.category, category)),
  );
  const featuredItems = getFeaturedMenuItems(menuItems);

  return (
    <>
      <PublicSiteHeader
        categories={headerCategories}
        currentClient={currentClient}
        searchableItems={menuItems}
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
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(110,0,12,0.98)_0%,rgba(188,0,18,0.82)_48%,rgba(213,0,20,0.20)_100%)]" />

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
                href="#reviews"
                className="inline-flex justify-center rounded-full border border-white/34 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
              >
                Отзывы
              </a>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-10 right-[max(1.25rem,calc((100vw-80rem)/2+2rem))] hidden rounded-[24px] border border-white/28 bg-white/14 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Сегодня в меню</p>
          <p className="mt-2 text-3xl font-semibold">{menuItems.length}</p>
          <p className="mt-1 text-sm text-white/76">позиций на сайте</p>
        </div>
      </section>

      <PublicAccountSection currentClient={currentClient} />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="overflow-hidden rounded-[18px] border border-[#ffd8dd] bg-[#fff7f8] shadow-[0_18px_50px_rgba(143,0,16,0.08)]">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d50014]">
                  Крупное обновление
                </p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#241316] sm:text-4xl">
                  Мы рады представить вам глобальное обновление нашего сервиса!
                </h2>
                <p className="mt-4 text-base leading-7 text-[#6b5960]">
                  Спасибо, что остаётесь с нами. Рады видеть вас и надеемся, что обновление сделает ваш опыт ещё лучше!
                </p>
              </div>
              <div className="rounded-[14px] border border-white bg-white p-5 shadow-sm shadow-[#d50014]/8">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#b00012]">
                  Что нового
                </p>
                <ul className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-[#5f4a50] sm:grid-cols-2">
                  {RELEASE_UPDATES.map((update) => (
                    <li key={update} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#d50014]" />
                      <span>{update}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicMenuSection
        currentClient={currentClient}
        featuredItems={featuredItems}
        items={menuItems}
      />

      <section id="reviews" className="bg-[#fff5f6] py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d50014]">
              Отзывы
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[#241316] sm:text-5xl">
              Клиенты возвращаются за вкусом
            </h2>
            <p className="mt-4 text-base leading-7 text-[#6b5960]">
              Собрали короткие впечатления о доставке, упаковке и удобстве заказа.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {CUSTOMER_REVIEWS.map(([name, text]) => (
              <article key={name} className="rounded-[18px] border border-[#ffe0e3] bg-white p-5 shadow-[0_14px_34px_rgba(86,24,31,0.07)]">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#d50014] text-sm font-semibold text-white">
                  {name.slice(0, 1)}
                </div>
                <p className="mt-5 text-sm leading-6 text-[#6b5960]">“{text}”</p>
                <p className="mt-4 text-sm font-semibold text-[#241316]">{name}</p>
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
              Оформляйте заказ на сайте, а по телефону и в мессенджерах мы
              поможем уточнить доставку, состав блюд или детали оплаты.
              {PUBLIC_SITE_CONTACTS.address ? ` Адрес: ${PUBLIC_SITE_CONTACTS.address}.` : ""}
            </p>
          </div>
          <div className="text-sm font-semibold text-white">
            {PUBLIC_SITE_CONTACTS.phoneHref && PUBLIC_SITE_CONTACTS.phoneLabel ? (
              <a
                href={PUBLIC_SITE_CONTACTS.phoneHref}
                className="transition hover:text-white/78"
              >
                {PUBLIC_SITE_CONTACTS.phoneLabel}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
