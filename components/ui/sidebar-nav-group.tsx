"use client";

import Link from "next/link";
import { ModuleIcon, type ModuleIconName } from "@/components/ui/module-icon";

type SidebarSubItem = {
  href: string;
  label: string;
  isActive: boolean;
};

type SidebarNavGroupProps = {
  href: string;
  label: string;
  icon: ModuleIconName;
  isActive: boolean;
  isOpen: boolean;
  expandLabel: string;
  collapseLabel: string;
  subItems: SidebarSubItem[];
  onOpen: () => void;
  onToggle: () => void;
  onCloseMobile: () => void;
};

export function SidebarNavGroup({
  href,
  label,
  icon,
  isActive,
  isOpen,
  expandLabel,
  collapseLabel,
  subItems,
  onOpen,
  onToggle,
  onCloseMobile,
}: SidebarNavGroupProps) {
  return (
    <div className="space-y-1">
      <div
        className={[
          "flex h-10 items-center gap-1 rounded-[12px] transition",
          isActive
            ? "bg-red-800 text-white shadow-md shadow-red-950/10 hover:bg-red-800 hover:text-white"
            : "text-zinc-600 hover:bg-red-50/80 hover:text-red-900 hover:shadow-sm hover:shadow-red-950/5",
        ].join(" ")}
      >
        <Link
          href={href}
          onClick={onOpen}
          className="flex h-full min-w-0 flex-1 items-center gap-2.5 rounded-l-[12px] pl-2 text-sm font-medium"
        >
          <span
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px]",
              isActive ? "bg-white/16 text-white" : "bg-red-50 text-red-800",
            ].join(" ")}
          >
            <ModuleIcon name={icon} />
          </span>
          <span className="whitespace-nowrap">{label}</span>
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className={[
            "mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition",
            isActive
              ? "text-white hover:bg-white/14 hover:text-white"
              : "text-red-800 hover:bg-red-50 hover:text-red-900",
          ].join(" ")}
          aria-label={isOpen ? collapseLabel : expandLabel}
          aria-expanded={isOpen}
        >
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
          >
            <path
              d="M7.5 4.75 12.25 10 7.5 15.25"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>

      {isOpen ? (
        <div className="ml-[22px] mt-1.5 space-y-0.5 border-l border-red-800/18 py-1 pl-5 pr-1">
          {subItems.map((subItem) => (
            <Link
              key={subItem.href}
              href={subItem.href}
              onClick={onCloseMobile}
              className={[
                "group relative flex h-8 items-center rounded-[9px] px-3 text-[13px] font-semibold transition",
                subItem.isActive
                  ? "bg-red-50/85 text-red-800"
                  : "text-zinc-500 hover:bg-red-50/55 hover:text-red-900",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute -left-[25px] h-1.5 w-1.5 rounded-full border border-[#fffdfc] transition",
                  subItem.isActive ? "bg-red-800" : "bg-red-800/24 group-hover:bg-red-800/50",
                ].join(" ")}
                aria-hidden="true"
              />
              <span className="truncate">{subItem.label}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
