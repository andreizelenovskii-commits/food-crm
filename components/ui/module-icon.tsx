import type { ReactNode } from "react";

export type ModuleIconName =
  | "grid"
  | "chart"
  | "report"
  | "receipt"
  | "users"
  | "book"
  | "box"
  | "badge"
  | "star"
  | "message"
  | "globe"
  | "settings"
  | "user";

export function ModuleIcon({
  name,
  className = "h-5 w-5",
}: {
  name: ModuleIconName;
  className?: string;
}) {
  const commonProps = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  const paths: Record<ModuleIconName, ReactNode> = {
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19h16" />
        <path d="M7 16V9" />
        <path d="M12 16V5" />
        <path d="M17 16v-4" />
        <path d="M6 9l4-4 4 5 4-3" />
      </>
    ),
    report: (
      <>
        <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
        <path d="M9 9h2" />
      </>
    ),
    receipt: (
      <>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h3" />
      </>
    ),
    users: (
      <>
        <path d="M16 20v-1.5a3.5 3.5 0 0 0-7 0V20" />
        <circle cx="12.5" cy="9" r="3" />
        <path d="M4 18v-1a3 3 0 0 1 3-3" />
        <path d="M20 18v-1a3 3 0 0 0-3-3" />
      </>
    ),
    book: (
      <>
        <path d="M5 4h10a4 4 0 0 1 4 4v12H8a3 3 0 0 0-3 3V4Z" />
        <path d="M5 19a3 3 0 0 1 3-3h11" />
      </>
    ),
    box: (
      <>
        <path d="M12 3 4.5 7.2 12 11.5l7.5-4.3L12 3Z" />
        <path d="M4.5 7.2v9L12 21l7.5-4.8v-9" />
        <path d="M12 11.5V21" />
      </>
    ),
    badge: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
      </>
    ),
    star: <path d="m12 3 2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3Z" />,
    message: (
      <>
        <path d="M5 5h14v10H8l-3 3V5Z" />
        <path d="M8 9h8" />
        <path d="M8 12h5" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17" />
        <path d="M12 3.5a13 13 0 0 1 0 17" />
        <path d="M12 3.5a13 13 0 0 0 0 17" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 3.1a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 3.1h5l.3-3.1a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </>
    ),
  };

  return <svg {...commonProps}>{paths[name]}</svg>;
}
