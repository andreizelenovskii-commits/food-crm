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
      className={`foodlike-card p-4 sm:p-5 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
