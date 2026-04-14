import type { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

export function SurfaceCard({
  children,
  className = "",
}: SurfaceCardProps) {
  return (
    <div
      className={`rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
