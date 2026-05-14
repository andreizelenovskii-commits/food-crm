"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/modules/auth/auth.types";
import type { Client } from "@/modules/clients/clients.types";
import { PublicHeaderInfoActions } from "@/modules/catalog/components/public-header-info-actions";
import {
  type AuthMode,
  PublicAuthModal,
} from "@/modules/catalog/components/public-auth-modal";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function PublicSiteHeader({
  categories,
  currentClient,
  user,
}: {
  categories: readonly string[];
  currentClient: Client | null;
  user: SessionUser | null;
}) {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
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
            user={user}
            onAuthOpen={openAuth}
          />

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

          {user ? (
            <Link
              href="/dashboard/profile"
              className="flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-[#fff1f2] px-3 text-sm font-semibold text-[#b00012] transition hover:bg-[#ffe3e6]"
            >
              <UserIcon className="size-5" />
              <span className="hidden max-w-[150px] truncate sm:inline">
                {user.displayName || "Профиль"}
              </span>
            </Link>
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
      </header>

      {isAuthOpen ? (
        <PublicAuthModal
          mode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onModeChange={setAuthMode}
        />
      ) : null}
    </>
  );
}
