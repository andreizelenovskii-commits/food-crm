/** Публичные URL окружений (переопределяются через NEXT_PUBLIC_*). */
export const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.trim() || "https://crmandromeda.ru";

export const CRM_PRODUCTION_URL =
  process.env.NEXT_PUBLIC_CRM_PRODUCTION_URL?.trim() || "https://crm.crmandromeda.ru";

export const CRM_DEV_URL =
  process.env.NEXT_PUBLIC_CRM_DEV_URL?.trim() || "https://dev.crm.crmandromeda.ru";

/** Страница GitHub Actions: ручной запуск «Deploy full stack» (бэкенд, затем фронт). */
export const GITHUB_DEPLOY_STACK_WORKFLOW_URL =
  process.env.NEXT_PUBLIC_GITHUB_DEPLOY_STACK_URL?.trim() ||
  "https://github.com/andreizelenovskii-commits/food-crm/actions/workflows/deploy-stack.yml";
