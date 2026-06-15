# Food CRM

## Run

```bash
npm ci
cp .env.local.example .env.local
npm run lint
npm test
npm run build
npm run dev
```

Check:

```bash
http://localhost:3000
http://localhost:3000/login
```

The frontend requires `SESSION_SECRET` in `.env.local`. By default it sends API
requests to `http://127.0.0.1:4000`; override that with
`NEXT_PUBLIC_BACKEND_API_URL` and/or `BACKEND_API_URL` when the backend runs
elsewhere.

## Зеркало перед доменом (рекомендуется)

Редактируешь и проверяешь на **staging**, на продовый домен выкатываешь **после**:

| Среда | CRM | Ветка в git |
| --- | --- | --- |
| **Зеркало (черновик)** | внутренний порт VPS `127.0.0.1:3100` | `dev` + workflows **Deploy … staging** |
| **Прод** | [crm.crmandromeda.ru](https://crm.crmandromeda.ru) | `main` + обычный деплой |

Короткая пошаговая схема: **[docs/mirror-workflow.md](docs/mirror-workflow.md)**. Инфраструктура staging: **[docs/STAGING.md](docs/STAGING.md)**.

Модель веток и чеклист перед `main`: **[docs/RELEASE_WORKFLOW.md](docs/RELEASE_WORKFLOW.md)**.

---

## Локально на Mac (`localhost`)

Нужно только если хочешь гонять фронт у себя без staging. Тогда поднимаешь API и Postgres — **[docs/LOCAL_BACKEND.md](docs/LOCAL_BACKEND.md)**. Переменные фронта: **[.env.local.example](.env.local.example)** (`SESSION_SECRET`, при необходимости URL API).

---

## Прод и сервер

- [Deployment guide](docs/DEPLOYMENT.md)
- [Production runbook](docs/PRODUCTION_RUNBOOK.md)
