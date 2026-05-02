# Food CRM

## Зеркало перед доменом (рекомендуется)

Редактируешь и проверяешь на **staging**, на продовый домен выкатываешь **после**:

| Среда | CRM | Ветка в git |
| --- | --- | --- |
| **Зеркало (черновик)** | [dev.crm.crmandromeda.ru](https://dev.crm.crmandromeda.ru) | `dev` + workflows **Deploy … staging** |
| **Прод** | [crm.crmandromeda.ru](https://crm.crmandromeda.ru) | `main` + обычный деплой |

Короткая пошаговая схема: **[docs/mirror-workflow.md](docs/mirror-workflow.md)**. Инфраструктура и DNS: **[docs/STAGING.md](docs/STAGING.md)**.

---

## Локально на Mac (`localhost`)

Нужно только если хочешь гонять фронт у себя без staging. Тогда поднимаешь API и Postgres — **[docs/LOCAL_BACKEND.md](docs/LOCAL_BACKEND.md)**. Переменные фронта: **[.env.local.example](.env.local.example)** (`SESSION_SECRET`, при необходимости URL API).

---

## Прод и сервер

- [Deployment guide](docs/DEPLOYMENT.md)
- [Production runbook](docs/PRODUCTION_RUNBOOK.md)
