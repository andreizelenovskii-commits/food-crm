import Image from "next/image";
import type { CatalogItem } from "@/modules/catalog/catalog.types";
import { PublicCatalogImage } from "@/modules/catalog/components/public-catalog-image";
import { PUBLIC_SITE_CONTACTS } from "@/shared/config/public-site";

const CUSTOMER_REVIEWS = [
  ["Анна", "Пицца приехала горячей, роллы аккуратные, а заказ на сайте собрался за минуту."],
  ["Игорь", "Понравилось, что можно выбрать размер и сразу убрать лишние ингредиенты."],
  ["Марина", "Доставка без суеты: всё подписано, упаковано чисто, дети довольны десертами."],
] as const;

const RELEASE_UPDATES = [
  "Свежая навигация по категориям и быстрый поиск по меню.",
  "Личный кабинет, бонусы и акции в одном месте.",
  "Удобная корзина с выбором вариантов, добавок и исключений.",
  "Более чистая подача блюд, цен и состава на сайте.",
] as const;

const HERO_PROMISES = [
  ["30-60 мин", "ориентир по доставке"],
  ["свежо", "готовим после заказа"],
  ["аккуратно", "подписываем и упаковываем"],
] as const;

const BRAND_FEATURES = [
  ["Для ужина", "Пицца, роллы, горячие блюда и напитки без долгих поисков."],
  ["Для компании", "Сеты, комбо и большие заказы, которые легко собрать на сайте."],
  ["Для себя", "Можно выбрать вариант блюда и убрать лишние ингредиенты."],
] as const;

type PublicMenuCategoryLink = {
  value: string;
  label: string;
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "RUB",
  }).format(cents / 100);
}

export function PublicHomeHero({
  heroItems,
  menuItemsCount,
}: {
  heroItems: CatalogItem[];
  menuItemsCount: number;
}) {
  return (
    <section className="relative overflow-hidden bg-[#fff9f4] pt-32 text-[#211316] sm:pt-36">
      <div className="absolute inset-x-0 top-0 h-36 bg-[linear-gradient(180deg,#fff1f2_0%,rgba(255,249,244,0)_100%)]" />
      <div className="absolute inset-y-0 right-0 hidden w-[44vw] bg-[#d50014] lg:block" />
      <div className="absolute right-[6vw] top-28 hidden h-[68vh] w-[34vw] overflow-hidden rounded-l-[8px] lg:block">
        <Image
          src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1600&q=86"
          alt="Готовые блюда FoodLike"
          className="h-full w-full object-cover"
          fill
          priority
          sizes="42vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(213,0,20,0.10),rgba(83,0,8,0.28))]" />
      </div>

      <div className="relative mx-auto grid min-h-[78vh] max-w-7xl gap-10 px-5 pb-12 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end lg:pb-16">
        <div className="max-w-3xl pb-4 lg:pb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f4d3d6] bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#b00012] shadow-sm">
            <span className="size-2 rounded-full bg-[#d50014]" />
            Доставка еды FoodLike
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-[#241316] sm:text-7xl lg:text-8xl">
            Большой вкус на каждый день
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6b5960] sm:text-xl">
            Пицца, роллы, горячие блюда, комбо и напитки в цельном меню.
            Выбирайте любимое, собирайте заказ без лишних шагов, а мы
            приготовим свежим и привезём аккуратно.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#menu" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d50014] px-7 text-sm font-black text-white shadow-[0_16px_34px_rgba(213,0,20,0.24)] transition hover:bg-[#b90012]">
              Смотреть меню
            </a>
            <a href="#reviews" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#f0d4d7] bg-white px-7 text-sm font-black text-[#8f0010] transition hover:border-[#d50014] hover:bg-[#fff1f2]">
              Отзывы клиентов
            </a>
          </div>
          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {HERO_PROMISES.map(([value, label]) => (
              <div key={value} className="rounded-lg border border-[#f3ded8] bg-white/82 p-4 shadow-[0_12px_30px_rgba(86,24,31,0.06)]">
                <p className="text-xl font-black text-[#241316]">{value}</p>
                <p className="mt-1 text-sm leading-5 text-[#7a6268]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative lg:pb-8">
          <div className="rounded-lg border border-white/65 bg-white/86 p-3 shadow-[0_28px_70px_rgba(70,10,16,0.20)] backdrop-blur-xl">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {heroItems.length ? (
                heroItems.map((item, index) => (
                  <a key={item.id} href="#menu" className="group grid grid-cols-[92px_1fr] items-center gap-4 rounded-lg border border-[#f4e0de] bg-white p-3 transition hover:border-[#d50014]/45 hover:shadow-[0_14px_34px_rgba(213,0,20,0.12)]">
                    <PublicCatalogImage
                      item={item}
                      className="aspect-square rounded-lg bg-[#fff5f6]"
                      imageClassName="transition duration-300 group-hover:scale-105"
                    />
                    <span className="min-w-0">
                      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#d50014]">
                        Выбор #{index + 1}
                      </span>
                      <span className="mt-1 block truncate text-base font-black text-[#241316]">
                        {item.name}
                      </span>
                      <span className="mt-1 block text-sm font-bold text-[#7a6268]">
                        от {formatPrice(item.priceCents)}
                      </span>
                    </span>
                  </a>
                ))
              ) : (
                <div className="rounded-lg border border-[#f4e0de] bg-white p-5">
                  <p className="text-sm font-bold text-[#6b5960]">
                    Меню скоро появится на сайте. Мы уже готовим витрину.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="absolute -bottom-4 right-5 hidden rounded-lg bg-[#241316] px-5 py-4 text-white shadow-[0_18px_44px_rgba(36,19,22,0.22)] sm:block">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/62">
              Сегодня в меню
            </p>
            <p className="mt-1 text-3xl font-black">{menuItemsCount}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PublicHomeFeatureStrip() {
  return (
    <section className="bg-[#fff9f4] py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {BRAND_FEATURES.map(([title, text]) => (
            <article key={title} className="rounded-lg border border-[#f4ded9] bg-white p-5 shadow-[0_16px_36px_rgba(86,24,31,0.06)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d50014]">
                {title}
              </p>
              <p className="mt-3 text-base font-semibold leading-6 text-[#4f3f43]">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PublicHomeCategoryLinks({
  categories,
}: {
  categories: PublicMenuCategoryLink[];
}) {
  if (!categories.length) {
    return null;
  }

  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#9b7b72]">
            Быстрый выбор
          </span>
          {categories.map((category) => (
            <a key={category.value} href="#menu-categories" className="rounded-full border border-[#f1d9d5] bg-[#fff9f4] px-4 py-2 text-sm font-bold text-[#5f4a50] transition hover:border-[#d50014] hover:bg-[#fff1f2] hover:text-[#b00012]">
              {category.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PublicHomeUpdatePanel() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="overflow-hidden rounded-lg border border-[#ffd8dd] bg-[#fff7f8] shadow-[0_18px_50px_rgba(143,0,16,0.08)]">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d50014]">
                Новый FoodLike
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#241316] sm:text-4xl">
                Сайт стал похож на хорошую витрину: проще выбрать, приятнее заказать.
              </h2>
              <p className="mt-4 text-base leading-7 text-[#6b5960]">
                Мы собрали меню, лояльность, акции, поиск и оформление заказа
                в один аккуратный сценарий, чтобы путь от желания до доставки
                был коротким и понятным.
              </p>
            </div>
            <div className="rounded-lg border border-white bg-white p-5 shadow-sm shadow-[#d50014]/8">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#b00012]">
                Что внутри
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
  );
}

export function PublicHomeReviews() {
  return (
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
            <article key={name} className="rounded-lg border border-[#ffe0e3] bg-white p-5 shadow-[0_14px_34px_rgba(86,24,31,0.07)]">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#d50014] text-sm font-semibold text-white">
                {name.slice(0, 1)}
              </div>
              <p className="mt-5 text-sm leading-6 text-[#6b5960]">{text}</p>
              <p className="mt-4 text-sm font-semibold text-[#241316]">{name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PublicHomeContacts() {
  return (
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
            <a href={PUBLIC_SITE_CONTACTS.phoneHref} className="transition hover:text-white/78">
              {PUBLIC_SITE_CONTACTS.phoneLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
