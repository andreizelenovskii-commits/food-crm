# Staging CRM

Staging is the draft mirror for development changes before production deploy.

## Domains

Create DNS A records:

```text
dev.crm.crmandromeda.ru      163.5.29.68
dev-api.crmandromeda.ru      163.5.29.68
```

## Runtime

```text
Frontend staging: /home/deploy/apps/food-crm-staging          port 3100
Backend staging:  /home/deploy/apps/food-crm-backend-staging  port 4100
Database:         food_crm_staging
Branch:           dev
```

Production stays on:

```text
Frontend production: /home/deploy/apps/food-crm          port 3000
Backend production:  /home/deploy/apps/food-crm-backend  port 4000
Branch:              main
```

## First Setup

After DNS records exist, run the GitHub Actions workflow:

```text
Setup staging infrastructure
```

It prepares:

- staging `.env` files
- `food_crm_staging` database
- Caddy routes for `dev.crm.crmandromeda.ru` and `dev-api.crmandromeda.ru`

The setup requires passwordless `sudo` for the `deploy` user on the VPS.

## Deploy Flow

Push draft work to `dev`:

```bash
git push origin dev
```

Staging deploy workflows:

```text
Deploy frontend staging
Deploy backend staging
```

When staging is approved, merge `dev` into `main` and push `main` to deploy production.

## Если «Deploy backend staging» падает с exit code 1

1. В GitHub открой упавший run → job **deploy** → шаг **Migrate and activate release** и прочитай лог на сервере (последние строки после SSH).

2. Workflow **Deploy backend staging** при каждом запуске сам подставляет **`DATABASE_URL`** для **`food_crm_staging`**, вычисляя его из продового **`/home/deploy/apps/food-crm-backend/shared/.env`** (та же `sed`-подстановка, что в **Setup staging**). Нужен корректный **`DATABASE_URL`** у **прода** с именем базы **`food_crm`** в пути. Если продовский URL другой — поправь **Setup staging** / логику в `deploy-staging.yml` под свой формат.

3. Другие варианты: неверный **`DEPLOY_SSH_KEY_B64`** в Secrets репозитория, падение **`npm run typecheck`** на раннем шаге (тогда красный будет **Typecheck**), ошибка **`npm run db:deploy`** или health-check после PM2 — смотри тот шаг, который красный в UI.

Предупреждения GitHub про Node 20 в `actions/checkout` — это **warning**, не причина падения, пока job не помечен как failed из‑за них.
