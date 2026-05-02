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
      className={`rounded-[14px] border border-red-950/10 bg-white/95 p-4 shadow-sm shadow-red-950/5 sm:p-5 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
