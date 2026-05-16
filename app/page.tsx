import Image from "next/image";
import type { Metadata } from "next";
import { fetchCurrentClient } from "@/modules/clients/clients.api";
import { PublicAccountSection } from "@/modules/catalog/components/public-account-section";
import { PublicMenuSection } from "@/modules/catalog/components/public-menu-section";
import { PublicSiteHeader } from "@/modules/catalog/components/public-site-header";
import { fetchPublicCatalogItems } from "@/modules/catalog/catalog.api";
import { CATALOG_SITE_CATEGORIES } from "@/modules/catalog/catalog.types";
import { PUBLIC_SITE_CONTACTS } from "@/shared/config/public-site";

export const metadata: Metadata = {
  title: "FoodLike | Доставка еды",
  description:
    "FoodLike: доставка пиццы, роллов и горячих блюд. Меню, условия доставки и контакты.",
};

const DELIVERY_STEPS = [
  ["01", "Выбираете блюда", "Собираете заказ из меню или звоните нам."],
  ["02", "Готовим свежим", "Кухня получает заказ в CRM и готовит по техкартам."],
  ["03", "Привозим горячим", "Курьер доставляет аккуратно и вовремя."],
] as const;

export default async function Home() {
  const [menuItems, currentClient] = await Promise.all([
    fetchPublicCatalogItems().catch(() => []),
    fetchCurrentClient(),
  ]);

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
              {PUBLIC_SITE_CONTACTS.phoneHref && PUBLIC_SITE_CONTACTS.phoneLabel ? (
                <a
                  href={PUBLIC_SITE_CONTACTS.phoneHref}
                  className="inline-flex justify-center rounded-full border border-white/42 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#c90013]"
                >
                  Позвонить
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <PublicAccountSection currentClient={currentClient} />

      <PublicMenuSection currentClient={currentClient} items={menuItems} />

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
              Заказы с сайта попадают в CRM, а по телефону и мессенджерам можно
              уточнить доставку или состав заказа.
              {PUBLIC_SITE_CONTACTS.address ? ` Адрес: ${PUBLIC_SITE_CONTACTS.address}.` : ""}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {PUBLIC_SITE_CONTACTS.phoneHref && PUBLIC_SITE_CONTACTS.phoneLabel ? (
              <a
                href={PUBLIC_SITE_CONTACTS.phoneHref}
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-[#c90013] transition hover:bg-[#ffe8ea]"
              >
                {PUBLIC_SITE_CONTACTS.phoneLabel}
              </a>
            ) : null}
            {PUBLIC_SITE_CONTACTS.telegramUrl ? (
              <a
                href={PUBLIC_SITE_CONTACTS.telegramUrl}
                className="rounded-full border border-white/38 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white hover:text-[#c90013]"
              >
                Telegram
              </a>
            ) : null}
            {PUBLIC_SITE_CONTACTS.whatsappUrl ? (
              <a
                href={PUBLIC_SITE_CONTACTS.whatsappUrl}
                className="rounded-full border border-white/38 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white hover:text-[#c90013]"
              >
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
