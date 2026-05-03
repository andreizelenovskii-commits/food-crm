# Production Runbook

Короткий operational entrypoint для production-контура CRM Andromeda.

Подробные процедуры вынесены в отдельные файлы:

- [PRODUCTION_DATABASE.md](PRODUCTION_DATABASE.md) — PostgreSQL, backup, restore, admin user.
- [PRODUCTION_OPERATIONS.md](PRODUCTION_OPERATIONS.md) — Caddy, firewall, logs, rollback, troubleshooting.
- [DEPLOYMENT.md](DEPLOYMENT.md) — порядок деплоя и GitHub Actions.

## Инфраструктура

- VPS: HOSTKEY, Ubuntu 24.04
- IP: `163.5.29.68`
- SSH-пользователь: `deploy`
- Reverse proxy и HTTPS: Caddy
- Process manager: PM2
- База данных: PostgreSQL на этой же VPS
- Frontend: `https://crm.crmandromeda.ru`
- Backend API: `https://api.crmandromeda.ru`
- Public site: `https://crmandromeda.ru`, `https://www.crmandromeda.ru`

## SSH

```bash
ssh deploy@163.5.29.68
```

## DNS

```text
@     -> 163.5.29.68
www   -> 163.5.29.68
crm   -> 163.5.29.68
api   -> 163.5.29.68
```

Проверка:

```bash
dig @8.8.8.8 +short crmandromeda.ru A
dig @8.8.8.8 +short www.crmandromeda.ru A
dig @8.8.8.8 +short crm.crmandromeda.ru A
dig @8.8.8.8 +short api.crmandromeda.ru A
```

## Production Health Check

```bash
curl https://api.crmandromeda.ru/api/v1/health
curl -I https://crm.crmandromeda.ru
curl -I https://crmandromeda.ru
curl -I https://www.crmandromeda.ru
```

Ожидаемый API-ответ:

```json
{"data":{"status":"ok"}}
```

## PM2

```bash
pm2 status
pm2 logs food-crm-backend --lines 100
pm2 logs food-crm-frontend --lines 100
```

Ожидаемые процессы:

```text
food-crm-backend    online
food-crm-frontend   online
pm2-logrotate       online
```

Перезапуск:

```bash
pm2 restart food-crm-backend
pm2 restart food-crm-frontend
pm2 save
```

PM2 autostart:

```bash
systemctl is-enabled pm2-deploy
systemctl status pm2-deploy --no-pager
```

`pm2-deploy.service` может быть `inactive (dead)`: это нормально для PM2 startup unit. Главное, чтобы unit был `enabled`, а процессы поднимались после reboot.

## Deploy Layout

Deploy идет через GitHub Actions по push в `main`.

Репозитории:

- Frontend: `andreizelenovskii-commits/food-crm`
- Backend: `andreizelenovskii-commits/food-crm-backend`

Нужный GitHub Actions secret в обоих репозиториях:

```text
DEPLOY_SSH_KEY_B64
```

Директории:

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

Проверить активные releases:

```bash
ls -lah ~/apps/food-crm/current
ls -lah ~/apps/food-crm-backend/current
```

## Environment Files

Production env-файлы находятся только на сервере:

```text
/home/deploy/apps/food-crm/shared/.env
/home/deploy/apps/food-crm-backend/shared/.env
```

Не коммитить, не отправлять в чат, не показывать на скринах.

Проверить наличие и права:

```bash
ls -la ~/apps/food-crm/shared/.env
ls -la ~/apps/food-crm-backend/shared/.env
chmod 600 ~/apps/food-crm/shared/.env ~/apps/food-crm-backend/shared/.env
```

## Daily Checklist

- открыть CRM
- проверить API health endpoint
- проверить `pm2 status`
- убедиться, что cron backup создал свежий файл

## Weekly Checklist

- `df -h`
- `ls -lh ~/backups/postgres`
- проверить GitHub Actions на красные деплои
- проверить `systemctl status caddy postgresql cron --no-pager`

## Before Risky Changes

- сделать ручной DB backup
- сделать snapshot VPS в HOSTKEY
- записать текущие commit SHA backend/frontend

## After Risky Changes

- `pm2 status`
- `curl https://api.crmandromeda.ru/api/v1/health`
- открыть `https://crm.crmandromeda.ru`
- сделать новый snapshot, если состояние стабильное
