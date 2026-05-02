import { CRM_DEV_URL, CRM_PRODUCTION_URL } from "@/shared/deploy-public-urls";

const baseClass =
  "inline-flex items-center justify-center rounded-full border px-3 py-2 text-center text-xs font-semibold transition sm:text-sm";

const prodClass =
  `${baseClass} border-red-200 bg-red-800 text-white hover:border-red-300 hover:bg-red-900`;

const devClass =
  `${baseClass} border-red-200 bg-white text-red-800 hover:border-red-300 hover:bg-red-50/80`;

type CrmEnvironmentLinksProps = {
  layout?: "row" | "column";
  className?: string;
};

export function CrmEnvironmentLinks({
  layout = "row",
  className = "",
}: CrmEnvironmentLinksProps) {
  const flex =
    layout === "column" ? "flex flex-col gap-2" : "flex flex-wrap gap-2";

  return (
    <div className={`${flex} ${className}`.trim()}>
      <a href={CRM_PRODUCTION_URL} target="_blank" rel="noopener noreferrer" className={prodClass}>
        CRM (прод)
      </a>
      <a href={CRM_DEV_URL} target="_blank" rel="noopener noreferrer" className={devClass}>
        CRM (dev)
      </a>
    </div>
  );
}
