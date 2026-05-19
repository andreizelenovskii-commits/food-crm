"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { PublicClientProfile } from "@/modules/clients/clients.types";
import { PublicHeaderInfoActions } from "@/modules/catalog/components/public-header-info-actions";
import {
  type AuthMode,
  PublicAuthModal,
} from "@/modules/catalog/components/public-auth-modal";
import {
  ChevronIcon,
  GridIcon,
  PhoneIcon,
  SearchIcon,
  UserIcon,
} from "@/modules/catalog/components/public-icons";
import { PublicProfileModal } from "@/modules/catalog/components/public-profile-modal";
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

function ContactIconLinks({ className }: { className: string }) {
  return (
    <div className={className}>
      {PUBLIC_SITE_CONTACTS.phoneHref ? (
        <a
          href={PUBLIC_SITE_CONTACTS.phoneHref}
          aria-label="Позвонить"
          title={PUBLIC_SITE_CONTACTS.phoneLabel}
          className={contactButtonClass}
        >
          <PhoneIcon className="size-4.5" />
        </a>
      ) : null}
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
          <Image
            src="/max-logo.png"
            alt=""
            width={22}
            height={22}
            unoptimized
            className="size-[22px] rounded-[7px] object-contain opacity-80 grayscale contrast-125 saturate-0 transition group-hover:opacity-100"
          />
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

export function PublicSiteHeader({
  categories,
  currentClient,
}: {
  categories: readonly string[];
  currentClient: PublicClientProfile | null;
}) {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isCategoriesOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!categoriesRef.current?.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isCategoriesOpen]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("search") ?? "").trim();
    const menu = document.getElementById("menu");

    if (menu) {
      menu.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (query) {
      window.history.replaceState(null, "", "#menu");
    }
  }

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 px-3 py-3 sm:px-6">
        <div className="mx-auto flex min-h-[58px] max-w-7xl items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-2 shadow-[0_14px_44px_rgba(143,0,16,0.13)] backdrop-blur-2xl sm:gap-3 sm:px-4">
          <Link
            href="/"
            className="flex min-w-0 shrink-0 items-center gap-3 rounded-full pr-1 transition hover:bg-[#fff5f6] sm:pr-3"
            aria-label="FoodLike"
          >
            <span className="relative inline-flex size-10 shrink-0 overflow-hidden rounded-full shadow-sm shadow-black/12 ring-1 ring-white">
              <Image
                src="/foodlike-app-icon-v3.png"
                alt=""
                fill
                unoptimized
                sizes="40px"
                className="scale-[1.1] object-cover object-[50%_58%]"
              />
            </span>
            <span className="hidden text-[1rem] font-bold uppercase tracking-[0.14em] text-[#241316] sm:inline">
              FoodLike
            </span>
          </Link>

          <form
            onSubmit={submitSearch}
            className="relative min-w-[118px] flex-1"
            role="search"
          >
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#9b7d83]" />
            <input
              name="search"
              type="search"
              placeholder="Поиск по меню"
              className="h-10 w-full rounded-full border border-[#f0d9dc] bg-[#fff8f8] pl-10 pr-4 text-sm font-medium text-[#241316] outline-none transition placeholder:text-[#a98f95] focus:border-[#d50014] focus:bg-white focus:ring-2 focus:ring-[#d50014]/12"
            />
          </form>

          <PublicHeaderInfoActions
            currentClient={currentClient}
            onAuthOpen={openAuth}
          />

          <ContactIconLinks className="hidden shrink-0 items-center gap-1.5 sm:flex" />

          <div ref={categoriesRef} className="relative hidden shrink-0 md:block">
            <button
              type="button"
              onClick={() => setIsCategoriesOpen((current) => !current)}
              className={`flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
                isCategoriesOpen
                  ? "border-[#d50014] bg-[#d50014] text-white shadow-sm shadow-[#d50014]/20"
                  : "border-[#f0d9dc] bg-white text-[#5c464b] hover:border-[#ffc3ca] hover:bg-[#fff1f2] hover:text-[#d50014]"
              }`}
              aria-expanded={isCategoriesOpen}
              aria-haspopup="menu"
            >
              <GridIcon className="size-4" />
              <span className="hidden lg:inline">Все категории</span>
              <span className="lg:hidden">Категории</span>
              <ChevronIcon
                className={`size-4 transition ${isCategoriesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isCategoriesOpen ? (
              <div
                className="absolute right-0 top-[calc(100%+12px)] w-[min(430px,calc(100vw-32px))] overflow-hidden rounded-[22px] border border-[#f3dadd] bg-white/96 p-3 shadow-[0_22px_60px_rgba(90,12,20,0.18)] backdrop-blur-xl"
                role="menu"
              >
                <div className="flex items-center justify-between gap-4 px-2 pb-3 pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d50014]">
                    Все категории
                  </p>
                  <span className="rounded-full bg-[#fff1f2] px-2.5 py-1 text-xs font-semibold text-[#b00012]">
                    {categories.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <a
                      key={category}
                      href="#menu"
                      role="menuitem"
                      onClick={() => setIsCategoriesOpen(false)}
                      className="group flex min-h-[48px] items-center gap-2 rounded-[14px] border border-transparent bg-[#fffafa] px-3.5 py-2.5 text-sm font-semibold leading-snug text-[#3a292d] transition hover:border-[#ffc3ca] hover:bg-[#fff1f2] hover:text-[#d50014]"
                    >
                      <span className="size-1.5 shrink-0 rounded-full bg-[#f0cfd3] transition group-hover:bg-[#d50014]" />
                      {category}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {currentClient ? (
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-[#fff1f2] px-3 text-sm font-semibold text-[#b00012] transition hover:bg-[#ffe3e6]"
            >
              <UserIcon className="size-5" />
              <span className="hidden max-w-[150px] truncate sm:inline">
                {currentClient.name || "Профиль"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="min-h-10 shrink-0 rounded-full bg-[#d50014] px-4 text-sm font-semibold text-white shadow-sm shadow-[#d50014]/18 transition hover:bg-[#b90012]"
            >
              <span className="hidden sm:inline">Войти или зарегистрироваться</span>
              <span className="sm:hidden">Войти</span>
            </button>
          )}
        </div>
        <ContactIconLinks className="mx-auto mt-2 flex w-fit items-center gap-1.5 rounded-full border border-white/80 bg-white/90 p-1.5 shadow-[0_10px_32px_rgba(143,0,16,0.12)] backdrop-blur-2xl sm:hidden" />
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
