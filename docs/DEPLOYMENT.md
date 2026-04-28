# Deployment Guide

Короткая инструкция по деплою CRM Andromeda. Большой operational runbook лежит в
[PRODUCTION_RUNBOOK.md](PRODUCTION_RUNBOOK.md).

## Production Layout

```text
VPS:      163.5.29.68, Ubuntu 24.04
SSH:      deploy@163.5.29.68
Proxy:    Caddy
Runtime:  PM2 + Node.js 22
DB:       PostgreSQL на этой же VPS
```

Домены:

```text
crm.crmandromeda.ru       -> frontend, port 3000
api.crmandromeda.ru       -> backend, port 4000
crmandromeda.ru, www      -> public site, frontend, port 3000
```

Директории на сервере:

```text
/home/deploy/apps/food-crm
/home/deploy/apps/food-crm-backend
```

Внутри каждой:

```text
current/        активный release
releases/       последние releases
shared/.env     production env, не хранится в git
```

## Repositories

Frontend:

```text
andreizelenovskii-commits/food-crm
```

Backend:

```text
andreizelenovskii-commits/food-crm-backend
```

## Required GitHub Secrets

В обоих репозиториях нужен secret:

```text
DEPLOY_SSH_KEY_B64
```

Это base64 от private SSH key, которым GitHub Actions заходит на VPS под пользователем `deploy`.

Проверить, что public key есть на сервере:

```bash
ssh deploy@163.5.29.68
cat ~/.ssh/authorized_keys
```

## Frontend Deploy

Workflow:

```text
.github/workflows/deploy.yml
```

Запускается автоматически при push в `main` или вручную через GitHub Actions.

Что делает workflow:

1. `npm ci`
2. `npm run lint`
3. `npm run build`
4. загружает release в `/home/deploy/apps/food-crm/releases/<commit-sha>`
5. подключает `/home/deploy/apps/food-crm/shared/.env`
6. собирает проект на сервере
7. переключает symlink `current`
8. перезапускает PM2 процесс `food-crm-frontend`
9. сохраняет PM2 process list
10. оставляет последние 5 releases

Ручная проверка после frontend deploy:

```bash
curl -I https://crm.crmandromeda.ru
```

Ожидаемо:

```text
HTTP/2 200
```

## Backend Deploy

Backend деплоится из отдельного репозитория `food-crm-backend`.

Workflow:

```text
.github/workflows/deploy.yml
```

Что делает workflow:

1. `npm ci`
2. `npm run typecheck`
3. загружает release в `/home/deploy/apps/food-crm-backend/releases/<commit-sha>`
4. подключает `/home/deploy/apps/food-crm-backend/shared/.env`
5. выполняет `npm run db:deploy`
6. переключает symlink `current`
7. перезапускает PM2 процесс `food-crm-backend`
8. сохраняет PM2 process list
9. оставляет последние 5 releases

Ручная проверка после backend deploy:

```bash
curl https://api.crmandromeda.ru/api/v1/health
```

Ожидаемо:

```json
{"data":{"status":"ok"}}
```

## Manual Health Check

На локальной машине:

```bash
curl https://api.crmandromeda.ru/api/v1/health
curl -I https://crm.crmandromeda.ru
```

На сервере:

```bash
ssh deploy@163.5.29.68
pm2 status
systemctl is-active caddy postgresql cron
curl -fsS http://127.0.0.1:4000/api/v1/health
curl -I -sS http://127.0.0.1:3000 | head -n 1
```

Ожидаемые PM2 процессы:

```text
food-crm-backend     online
food-crm-frontend    online
pm2-logrotate        online
```

## Caddy Public Site Route

Чтобы публичный сайт был виден на `crmandromeda.ru`, Caddy должен проксировать
основной домен в тот же frontend-процесс, что и CRM:

```caddyfile
crmandromeda.ru, www.crmandromeda.ru {
  reverse_proxy 127.0.0.1:3000
}

crm.crmandromeda.ru {
  reverse_proxy 127.0.0.1:3000
}

api.crmandromeda.ru {
  reverse_proxy 127.0.0.1:4000
}
```

Проверить и применить:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## Manual Restart

```bash
ssh deploy@163.5.29.68
pm2 restart food-crm-backend
pm2 restart food-crm-frontend
pm2 save
```

## Logs

```bash
ssh deploy@163.5.29.68
pm2 logs food-crm-backend --lines 100
pm2 logs food-crm-frontend --lines 100
journalctl -u caddy -n 100 --no-pager
```

## Rollback

Frontend:

```bash
ssh deploy@163.5.29.68
ls -1dt ~/apps/food-crm/releases/*
PREVIOUS_RELEASE=/home/deploy/apps/food-crm/releases/PASTE_RELEASE_DIR
ln -sfn "$PREVIOUS_RELEASE" ~/apps/food-crm/current
cd ~/apps/food-crm/current
pm2 startOrReload ecosystem.config.cjs --only food-crm-frontend --update-env
pm2 save
```

Backend:

```bash
ssh deploy@163.5.29.68
ls -1dt ~/apps/food-crm-backend/releases/*
PREVIOUS_RELEASE=/home/deploy/apps/food-crm-backend/releases/PASTE_RELEASE_DIR
ln -sfn "$PREVIOUS_RELEASE" ~/apps/food-crm-backend/current
cd ~/apps/food-crm-backend/current
pm2 startOrReload ecosystem.config.cjs --only food-crm-backend --update-env
pm2 save
curl https://api.crmandromeda.ru/api/v1/health
```

Backend rollback не откатывает миграции базы. Если проблема связана с миграцией, сначала смотри раздел restore в
[PRODUCTION_RUNBOOK.md](PRODUCTION_RUNBOOK.md#database-restore).

## Before Risky Deploy

```bash
ssh deploy@163.5.29.68
~/scripts/backup-food-crm-db.sh
ls -lh ~/backups/postgres | tail
```

Для крупных изменений дополнительно сделать snapshot VPS в HOSTKEY.

## Common Failures

502 на `crm.crmandromeda.ru`:

```bash
pm2 status
pm2 logs food-crm-frontend --lines 100
curl -I http://127.0.0.1:3000
```

502 или ошибка API:

```bash
pm2 status
pm2 logs food-crm-backend --lines 100
curl http://127.0.0.1:4000/api/v1/health
```

GitHub Actions упал на SSH:

```text
проверить DEPLOY_SSH_KEY_B64
проверить ~/.ssh/authorized_keys на сервере
проверить ssh deploy@163.5.29.68 вручную
```

GitHub Actions упал на backend migration:

```bash
ssh deploy@163.5.29.68
cd ~/apps/food-crm-backend/current
pm2 logs food-crm-backend --lines 100
```

Не печатать env-файлы в чат и не показывать секреты на скринах.
