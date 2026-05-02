import {
  CRM_DEV_URL,
  CRM_PRODUCTION_URL,
  GITHUB_DEPLOY_STACK_WORKFLOW_URL,
} from "@/shared/deploy-public-urls";

const baseClass =
  "inline-flex items-center justify-center rounded-full border px-3 py-2 text-center text-xs font-semibold transition sm:text-sm";

const prodClass =
  `${baseClass} border-red-200 bg-red-800 text-white hover:border-red-300 hover:bg-red-900`;

const devClass =
  `${baseClass} border-red-200 bg-white text-red-800 hover:border-red-300 hover:bg-red-50/80`;

const deployClass =
  `${baseClass} border-zinc-300 bg-zinc-50 text-zinc-900 hover:border-zinc-400 hover:bg-zinc-100`;

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
      <a
        href={GITHUB_DEPLOY_STACK_WORKFLOW_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={deployClass}
        title="GitHub Actions: сначала backend, потом frontend"
      >
        Деплой прод (бэк→фронт)
      </a>
    </div>
  );
}
