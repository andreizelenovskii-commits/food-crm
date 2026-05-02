# Food CRM

## Локальная разработка («зеркало» до выкладки на домен)

Поднимаются **два** процесса: API (бэкенд) и этот фронт (Next.js).

| Что | URL |
| --- | --- |
| Интерфейс CRM | [http://localhost:3000](http://localhost:3000) (`npm run dev` в этом репозитории) |
| Backend API | [http://localhost:4000](http://localhost:4000) (репозиторий `food-crm-backend`, свой `DATABASE_URL`) |

По умолчанию фронт проксирует `/api/v1/*` на `http://127.0.0.1:4000`, а в браузере на `localhost` клиентские запросы тоже уходят на порт **4000** — отдельно задавать URL не обязательно, если бэкенд слушает 4000.

1. В корне репозитория: `cp .env.local.example .env.local`, в `.env.local` задай **`SESSION_SECRET`** (длинная случайная строка).
2. `npm install` и `npm run dev`.
3. Параллельно запусти бэкенд на **4000** с рабочей БД и CORS для `http://localhost:3000` (см. документацию бэкенда).
4. Пользователя в БД создаёт скрипт `npm run admin:create` **в каталоге бэкенда** (как на сервере).

Пример переменных: [.env.local.example](.env.local.example).

Черновой деплой без прода: ветка **`dev`** и staging — [docs/STAGING.md](docs/STAGING.md).

---

Production docs:

- [Deployment guide](docs/DEPLOYMENT.md)
- [Production runbook](docs/PRODUCTION_RUNBOOK.md)
