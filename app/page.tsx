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

function TelegramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M21.82 4.14a1.35 1.35 0 0 0-1.38-.22L3.12 10.6c-.62.24-1.02.65-1.08 1.14-.07.56.34 1.05 1.05 1.27l4.43 1.38 1.7 5.12c.18.55.54.9 1 .95.43.05.85-.19 1.17-.67l2.3-3.47 4.58 3.37c.49.36.98.48 1.39.32.42-.16.72-.57.84-1.17l2.39-13.23c.1-.59-.02-1.09-.36-1.38a1.2 1.2 0 0 0-.71-.09ZM18.7 7.44l-8.14 7.18-.32 3.12-1.07-3.22 7.8-6.22-9.47 5.13-3.33-1.04 14.53-4.95Z"
      />
    </svg>
  );
}

function MaxIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M12 2.75c5.11 0 9.25 3.76 9.25 8.4s-4.14 8.4-9.25 8.4c-.96 0-1.9-.13-2.77-.38L4.6 21.1a.76.76 0 0 1-1.03-.9l1.17-4.02a7.96 7.96 0 0 1-2-5.03c0-4.64 4.15-8.4 9.26-8.4Zm-4.1 11.4c.54 0 .95-.34 1.16-.94l.7-1.98 1.22 2.08c.24.41.58.62 1.02.62.45 0 .8-.21 1.03-.62l1.22-2.08.7 1.98c.21.6.62.94 1.16.94.7 0 1.12-.55.91-1.2l-1.55-4.7c-.19-.58-.58-.9-1.1-.9-.43 0-.76.2-1.02.63L12 10.34l-1.34-2.36c-.26-.43-.6-.63-1.02-.63-.53 0-.92.32-1.11.9l-1.55 4.7c-.21.65.22 1.2.92 1.2Z"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M12.04 3.25a8.48 8.48 0 0 0-7.2 12.95l-1.1 4.04 4.13-1.08a8.48 8.48 0 1 0 4.17-15.91Zm0 1.52a6.96 6.96 0 1 1-3.56 12.94l-.25-.15-2.45.64.65-2.39-.16-.25a6.96 6.96 0 0 1 5.77-10.79Zm-2.28 3.7c-.16-.36-.33-.37-.49-.38h-.42c-.15 0-.38.06-.58.28-.2.22-.76.74-.76 1.82 0 1.07.78 2.1.89 2.25.1.15 1.52 2.44 3.76 3.32 1.86.73 2.24.59 2.64.55.4-.04 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.15-.4-.26-.22-.1-1.3-.64-1.5-.71-.2-.08-.35-.11-.5.1-.14.22-.57.72-.7.87-.13.15-.26.17-.48.06-.21-.1-.9-.33-1.72-1.06-.64-.57-1.06-1.27-1.19-1.48-.12-.22-.01-.34.1-.44.1-.1.22-.26.33-.38.1-.13.14-.22.21-.37.07-.15.04-.28-.02-.39l-.68-1.7Z"
      />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { href: PUBLIC_SITE_CONTACTS.telegramUrl, label: "Telegram", icon: <TelegramIcon /> },
  { href: PUBLIC_SITE_CONTACTS.maxUrl, label: "MAX", icon: <MaxIcon /> },
  { href: PUBLIC_SITE_CONTACTS.whatsappUrl, label: "WhatsApp", icon: <WhatsAppIcon /> },
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {PUBLIC_SITE_CONTACTS.phoneHref && PUBLIC_SITE_CONTACTS.phoneLabel ? (
              <a
                href={PUBLIC_SITE_CONTACTS.phoneHref}
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-[#c90013] transition hover:bg-[#ffe8ea]"
              >
                {PUBLIC_SITE_CONTACTS.phoneLabel}
              </a>
            ) : null}
            <div className="flex justify-center gap-2 sm:justify-start">
              {SOCIAL_LINKS.map(({ href, label, icon }) =>
                href ? (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    title={label}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/38 text-white transition hover:bg-white hover:text-[#c90013] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#d50014]"
                  >
                    {icon}
                  </a>
                ) : null,
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
