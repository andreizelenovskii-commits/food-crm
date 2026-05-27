"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { PublicClientProfile } from "@/modules/clients/clients.types";
import type { CatalogItem } from "@/modules/catalog/catalog.types";
import { PublicHeaderInfoActions } from "@/modules/catalog/components/public-header-info-actions";
import { PublicHeaderSearch } from "@/modules/catalog/components/public-header-search";
import {
  PublicAvatarBadge,
  usePublicAvatar,
} from "@/modules/catalog/components/public-avatar";
import {
  type AuthMode,
  PublicAuthModal,
} from "@/modules/catalog/components/public-auth-modal";
import {
  PhoneIcon,
  UserIcon,
} from "@/modules/catalog/components/public-icons";
import { PublicProfileModal } from "@/modules/catalog/components/public-profile-modal";
import { getMenuCategoryHref } from "@/modules/catalog/components/public-menu-category-utils";
import { PUBLIC_SITE_CONTACTS } from "@/shared/config/public-site";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M21.82 4.14a1.35 1.35 0 0 0-1.38-.22L3.12 10.6c-.62.24-1.02.65-1.08 1.14-.07.56.34 1.05 1.05 1.27l4.43 1.38 1.7 5.12c.18.55.54.9 1 .95.43.05.85-.19 1.17-.67l2.3-3.47 4.58 3.37c.49.36.98.48 1.39.32.42-.16.72-.57.84-1.17l2.39-13.23c.1-.59-.02-1.09-.36-1.38a1.2 1.2 0 0 0-.71-.09ZM18.7 7.44l-8.14 7.18-.32 3.12-1.07-3.22 7.8-6.22-9.47 5.13-3.33-1.04 14.53-4.95Z"
      />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M12.04 3.25a8.48 8.48 0 0 0-7.2 12.95l-1.1 4.04 4.13-1.08a8.48 8.48 0 1 0 4.17-15.91Zm0 1.52a6.96 6.96 0 1 1-3.56 12.94l-.25-.15-2.45.64.65-2.39-.16-.25a6.96 6.96 0 0 1 5.77-10.79Zm-2.28 3.7c-.16-.36-.33-.37-.49-.38h-.42c-.15 0-.38.06-.58.28-.2.22-.76.74-.76 1.82 0 1.07.78 2.1.89 2.25.1.15 1.52 2.44 3.76 3.32 1.86.73 2.24.59 2.64.55.4-.04 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.15-.4-.26-.22-.1-1.3-.64-1.5-.71-.2-.08-.35-.11-.5.1-.14.22-.57.72-.7.87-.13.15-.26.17-.48.06-.21-.1-.9-.33-1.72-1.06-.64-.57-1.06-1.27-1.19-1.48-.12-.22-.01-.34.1-.44.1-.1.22-.26.33-.38.1-.13.14-.22.21-.37.07-.15.04-.28-.02-.39l-.68-1.7Z"
      />
    </svg>
  );
}

const contactButtonClass =
  "group inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[#f0d9dc] bg-white text-[#5c464b] transition hover:border-[#ffc3ca] hover:bg-[#fff1f2] hover:text-[#d50014] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d50014]/25";

function SocialIconLinks({ className }: { className: string }) {
  return (
    <div className={className}>
      {PUBLIC_SITE_CONTACTS.telegramUrl ? (
        <a
          href={PUBLIC_SITE_CONTACTS.telegramUrl}
          aria-label="Telegram"
          title="Telegram"
          target="_blank"
          rel="noreferrer"
          className={contactButtonClass}
        >
          <TelegramIcon className="size-5" />
        </a>
      ) : null}
      {PUBLIC_SITE_CONTACTS.maxUrl ? (
        <a
          href={PUBLIC_SITE_CONTACTS.maxUrl}
          aria-label="MAX"
          title="MAX"
          target="_blank"
          rel="noreferrer"
          className={contactButtonClass}
        >
          <span className="flex size-6 items-center justify-center rounded-[8px] border border-current text-[9px] font-black leading-none tracking-[-0.02em]">
            MAX
          </span>
        </a>
      ) : null}
      {PUBLIC_SITE_CONTACTS.whatsappUrl ? (
        <a
          href={PUBLIC_SITE_CONTACTS.whatsappUrl}
          aria-label="WhatsApp"
          title="WhatsApp"
          target="_blank"
          rel="noreferrer"
          className={contactButtonClass}
        >
          <WhatsAppIcon className="size-5" />
        </a>
      ) : null}
    </div>
  );
}

function PhoneNumberLink() {
  if (!PUBLIC_SITE_CONTACTS.phoneHref || !PUBLIC_SITE_CONTACTS.phoneLabel) {
    return null;
  }

  return (
    <a
      href={PUBLIC_SITE_CONTACTS.phoneHref}
      className="hidden min-h-10 shrink-0 items-center gap-2 rounded-full border border-[#f0d9dc] bg-white px-3.5 text-sm font-bold text-[#241316] transition hover:border-[#ffc3ca] hover:bg-[#fff1f2] hover:text-[#d50014] xl:flex"
    >
      <PhoneIcon className="size-4 text-[#d50014]" />
      <span>{PUBLIC_SITE_CONTACTS.phoneLabel}</span>
    </a>
  );
}

function CategoryNavIcon({ category }: { category: string }) {
  if (category === "Пицца") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fff1f2] text-[#d50014] transition duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-[#d50014] group-hover:text-white">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4.2 20.1 11.5 3.7c.22-.5.86-.66 1.3-.34 4.08 2.93 6.48 7.03 7.3 12.24.08.53-.38.98-.91.89L4.2 20.1Zm7.78-13.96-4.9 11.02 10.43-2.52c-.82-3.5-2.63-6.33-5.53-8.5Z"
          />
          <circle cx="12.1" cy="12.1" r="1.25" fill="white" opacity="0.92" />
          <circle cx="14.8" cy="9.3" r="1.05" fill="white" opacity="0.9" />
          <circle cx="10.1" cy="15.2" r="0.95" fill="white" opacity="0.88" />
        </svg>
      </span>
    );
  }

  if (category === "Роллы") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fff1f2] text-[#d50014] transition duration-300 group-hover:scale-110 group-hover:bg-[#d50014] group-hover:text-white">
        <svg viewBox="0 0 24 24" className="size-5 transition duration-500 group-hover:rotate-180" aria-hidden="true">
          <circle cx="12" cy="12" r="8.2" fill="currentColor" />
          <circle cx="12" cy="12" r="5.6" fill="white" opacity="0.94" />
          <circle cx="12" cy="12" r="2.4" fill="currentColor" opacity="0.9" />
          <path d="M12 6.8v10.4M6.8 12h10.4" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" opacity="0.42" />
        </svg>
      </span>
    );
  }

  if (category === "Фастфуд") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fff1f2] text-[#d50014] transition duration-300 group-hover:scale-110 group-hover:bg-[#d50014] group-hover:text-white">
        <svg viewBox="0 0 24 24" className="size-5 transition duration-300 group-hover:-rotate-3" aria-hidden="true">
          <path
            d="M7.6 9.1 6.8 4.7h1.8l.8 4.4h1.3L10.4 4h1.9l.3 5.1H14l.8-4.4h1.8l-.8 4.4h1.1c.55 0 .98.47.91 1.02l-1.1 9.1a1 1 0 0 1-1 .88H8.3a1 1 0 0 1-1-.88l-1.1-9.1a.92.92 0 0 1 .91-1.02h.49Z"
            fill="currentColor"
          />
          <path
            d="M8.8 11.7h6.4l-.66 5.78a.6.6 0 0 1-.6.52H10.06a.6.6 0 0 1-.6-.52L8.8 11.7Z"
            fill="white"
            opacity="0.92"
          />
          <path
            d="M10.6 14h2.8M10.85 16h2.3"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.15"
            opacity="0.55"
          />
          <path
            d="M8.4 6h1.1l.65 3.1h-1.2L8.4 6Zm6.1 0h1.1l-.55 3.1h-1.2L14.5 6Z"
            fill="white"
            opacity="0.9"
          />
        </svg>
      </span>
    );
  }

  return null;
}

type PublicMenuCategoryLink = {
  value: string;
  label: string;
};

export function PublicSiteHeader({
  categories,
  currentClient,
  searchableItems = [],
}: {
  categories: readonly PublicMenuCategoryLink[];
  currentClient: PublicClientProfile | null;
  searchableItems?: CatalogItem[];
}) {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { avatarId } = usePublicAvatar();

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#f4dfe2] bg-white/95 shadow-[0_12px_38px_rgba(143,0,16,0.10)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6 xl:flex-nowrap">
          <Link
            href="/"
            className="flex min-w-[172px] shrink-0 items-center gap-3"
            aria-label="FoodLike"
          >
            <span className="relative inline-flex size-11 shrink-0 overflow-hidden rounded-full shadow-sm shadow-black/12 ring-1 ring-white">
              <Image
                src="/foodlike-app-icon-v3.png"
                alt=""
                fill
                unoptimized
                sizes="44px"
                className="scale-[1.1] object-cover object-[50%_58%]"
              />
            </span>
            <span className="text-[1rem] font-black uppercase tracking-[0.2em] text-[#241316]">
              FoodLike
            </span>
          </Link>

          <PublicHeaderInfoActions
            currentClient={currentClient}
            onAuthOpen={openAuth}
          />

          <SocialIconLinks className="hidden shrink-0 items-center gap-1.5 md:flex" />

          <PublicHeaderSearch items={searchableItems} />

          {currentClient ? (
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="ml-auto flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-[#fff1f2] py-1 pl-1 pr-4 text-sm font-semibold text-[#b00012] transition hover:bg-[#ffe3e6] md:ml-0"
            >
              <PublicAvatarBadge avatarId={avatarId} className="size-8 rounded-full text-base" />
              <UserIcon className="hidden size-5 sm:block" />
              <span className="hidden max-w-[150px] truncate sm:inline">
                Личный кабинет
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="ml-auto min-h-10 shrink-0 rounded-full bg-[#d50014] px-4 text-sm font-semibold text-white shadow-sm shadow-[#d50014]/18 transition hover:bg-[#b90012] md:ml-0"
            >
              <span className="hidden sm:inline">Войти / регистрация</span>
              <span className="sm:hidden">Войти</span>
            </button>
          )}

          <PhoneNumberLink />
        </div>

        {categories.length ? (
          <nav
            id="menu-categories"
            className="scroll-mt-28 border-t border-[#f7e5e7] bg-white"
            aria-label="Категории меню"
          >
            <div className="menu-category-strip mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
              {categories.map((category) => (
                <a
                  key={category.value}
                  href={getMenuCategoryHref(category.value)}
                  className="group flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-black text-[#5c464b] transition hover:bg-[#fff1f2] hover:text-[#d50014]"
                >
                  <CategoryNavIcon category={category.value} />
                  {category.label}
                </a>
              ))}
            </div>
          </nav>
        ) : null}
      </header>

      {isAuthOpen ? (
        <PublicAuthModal
          mode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onModeChange={setAuthMode}
        />
      ) : null}

      {isProfileOpen && currentClient ? (
        <PublicProfileModal
          client={currentClient}
          onClose={() => setIsProfileOpen(false)}
        />
      ) : null}
    </>
  );
}
