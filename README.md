# Food CRM

## Run

```bash
npm ci
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

For permanent one-command local development use:

```bash
npm run local:setup
npm run local:dev
```

Full guide: **[docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md)**.

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

Постоянная локальная среда без SSH/VPS/Caddy: **[docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md)**.

Старый ручной backend-flow оставлен для справки: **[docs/LOCAL_BACKEND.md](docs/LOCAL_BACKEND.md)**.

---

## Прод и сервер

- [Deployment guide](docs/DEPLOYMENT.md)
- [Production runbook](docs/PRODUCTION_RUNBOOK.md)
