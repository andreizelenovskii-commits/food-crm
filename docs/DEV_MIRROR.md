# Dev Mirror

Dev-зеркало проекта — это внутренний staging-контур на ветке `dev`, отделённый от production по портам, PM2-процессам и базе. Публичные домены остаются только для production: `crmandromeda.ru`, `crm.crmandromeda.ru`, `api.crmandromeda.ru`.

## Контур

```text
Frontend:  http://127.0.0.1:3100      port 3100
Backend:   http://127.0.0.1:4100      port 4100
Database:  food_crm_staging
Branch:    dev
```

Production остаётся на:

```text
Frontend:  https://crm.crmandromeda.ru          port 3000
Backend:   https://api.crmandromeda.ru          port 4000
Database:  food_crm
Branch:    main
```

## Где Настроено

- Frontend deploy: `.github/workflows/deploy-staging.yml`
- Backend deploy: `backend/.github/workflows/deploy-staging.yml`
- Первичная подготовка VPS: `.github/workflows/setup-staging.yml`
- PM2 frontend: `ecosystem.staging.config.cjs`
- PM2 backend: `backend/ecosystem.staging.config.cjs`
- Подробная инструкция: [STAGING.md](STAGING.md)

## Проверка

```bash
npm run mirror:check
```

Проверка убеждается, что в проекте есть:

- workflow подготовки dev-инфраструктуры
- frontend/backend staging deploy workflows
- staging PM2-конфиги
- внутренние staging-порты
- dev-БД `food_crm_staging`

## Рабочий Поток

1. Вести разработку в ветке `dev`.
2. Push в `dev` запускает deploy на dev-зеркало.
3. Проверить на VPS `curl -I http://127.0.0.1:3100` и `curl -fsS http://127.0.0.1:4100/api/v1/health`.
4. После проверки merge `dev` в `main`.
5. Production deploy идёт отдельно по `main`.
