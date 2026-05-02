# Production Runbook

Рабочий контур CRM Andromeda.

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

## Домены

DNS A-записи:

```text
@     -> 163.5.29.68
www   -> 163.5.29.68
crm   -> 163.5.29.68
api   -> 163.5.29.68
```

Проверка DNS:

```bash
dig @8.8.8.8 +short crmandromeda.ru A
dig @8.8.8.8 +short www.crmandromeda.ru A
dig @8.8.8.8 +short crm.crmandromeda.ru A
dig @8.8.8.8 +short api.crmandromeda.ru A
```

## Проверка Production

Backend health:

```bash
curl https://api.crmandromeda.ru/api/v1/health
```

Ожидаемый ответ:

```json
{"data":{"status":"ok"}}
```

Frontend:

```text
https://crm.crmandromeda.ru
```

Публичный сайт:

```bash
curl https://crmandromeda.ru
curl https://www.crmandromeda.ru
```

## PM2

Проверить процессы:

```bash
pm2 status
```

Ожидаемые процессы:

```text
food-crm-backend    online
food-crm-frontend   online
pm2-logrotate       online
```

Сохранить текущий список процессов:

```bash
pm2 save
```

Перезапустить backend:

```bash
pm2 restart food-crm-backend
```

Перезапустить frontend:

```bash
pm2 restart food-crm-frontend
```

Перезапустить все:

```bash
pm2 restart all
```

Логи:

```bash
pm2 logs food-crm-backend --lines 100
pm2 logs food-crm-frontend --lines 100
```

Очистить PM2-логи:

```bash
pm2 flush
```

## PM2 Autostart

Проверить systemd unit:

```bash
systemctl is-enabled pm2-deploy
systemctl status pm2-deploy --no-pager
```

`pm2-deploy.service` может показывать `inactive (dead)`, это нормально для PM2 startup unit. Главное, чтобы unit был `enabled`, а процессы были `online` после reboot.

Проверка после перезагрузки:

```bash
sudo reboot
```

Через 40-60 секунд:

```bash
ssh deploy@163.5.29.68
pm2 status
curl https://api.crmandromeda.ru/api/v1/health
```

## Deploy

Деплой идет через GitHub Actions по push в `main`.

Репозитории:

- Frontend: `andreizelenovskii-commits/food-crm`
- Backend: `andreizelenovskii-commits/food-crm-backend`

Нужный GitHub Actions secret в обоих репозиториях:

```text
DEPLOY_SSH_KEY_B64
```

Backend деплоится в:

```text
/home/deploy/apps/food-crm-backend
```

Frontend деплоится в:

```text
/home/deploy/apps/food-crm
```

Текущие релизы:

```bash
ls -lah ~/apps/food-crm/current
ls -lah ~/apps/food-crm-backend/current
```

Последние релизы:

```bash
ls -lah ~/apps/food-crm/releases
ls -lah ~/apps/food-crm-backend/releases
```

После deploy проверить:

```bash
pm2 status
curl https://api.crmandromeda.ru/api/v1/health
curl -I https://crm.crmandromeda.ru
```

Если deploy упал в GitHub Actions, смотреть красный шаг в job logs. Самые частые причины:

- невалидный или старый `DEPLOY_SSH_KEY_B64`
- нет доступа по SSH для `deploy@163.5.29.68`
- сборка не проходит локально
- backend миграция Prisma не применяется к базе

## Environment Files

Production env-файлы находятся только на сервере:

```text
/home/deploy/apps/food-crm/shared/.env
/home/deploy/apps/food-crm-backend/shared/.env
```

Не коммитить, не отправлять в чат, не показывать на скринах.

Проверить наличие:

```bash
ls -la ~/apps/food-crm/shared/.env
ls -la ~/apps/food-crm-backend/shared/.env
```

Права:

```bash
chmod 600 ~/apps/food-crm/shared/.env ~/apps/food-crm-backend/shared/.env
```

## PostgreSQL

Проверить PostgreSQL:

```bash
systemctl status postgresql --no-pager
pg_isready
```

Подключение к базе через URL из backend env:

```bash
DATABASE_URL="$(grep -E '^DATABASE_URL=' ~/apps/food-crm-backend/shared/.env | cut -d '=' -f2-)"
psql "$DATABASE_URL" -c "SELECT current_database(), current_user;"
unset DATABASE_URL
```

## Admin User

Создать или обновить админа:

```bash
cd ~/apps/food-crm-backend/current
read -s -p "Admin password: " ADMIN_PASSWORD; echo
ADMIN_PHONE="+79001234567" ADMIN_PASSWORD="$ADMIN_PASSWORD" npm run admin:create
unset ADMIN_PASSWORD
```

Пароль должен быть минимум 12 символов и включать:

- uppercase
- lowercase
- number
- special character

## Database Backup

Скрипт:

```text
/home/deploy/scripts/backup-food-crm-db.sh
```

Папка backup:

```text
/home/deploy/backups/postgres
```

Ручной backup:

```bash
~/scripts/backup-food-crm-db.sh
```

Backup с записью в лог:

```bash
~/scripts/backup-food-crm-db.sh >> ~/backups/postgres/backup.log 2>&1
```

Проверить файлы:

```bash
ls -lh ~/backups/postgres
tail -n 50 ~/backups/postgres/backup.log
```

Cron:

```bash
crontab -l
systemctl status cron --no-pager
```

Текущее расписание:

```cron
30 3 * * * /home/deploy/scripts/backup-food-crm-db.sh >> /home/deploy/backups/postgres/backup.log 2>&1
```

Хранение backup: последние 14 дней.

## Database Restore

Осторожно: restore перезаписывает данные. Перед restore сделать свежий backup.

Пример восстановления в отдельную тестовую базу:

```bash
sudo -u postgres createdb food_crm_restore_test --owner=food_crm_user
BACKUP=~/backups/postgres/food_crm-YYYYMMDD-HHMMSS.dump.gz
gzip -dc "$BACKUP" | pg_restore --dbname=food_crm_restore_test --no-owner --no-privileges
```

Для production restore сначала остановить приложения:

```bash
pm2 stop food-crm-backend food-crm-frontend
```

Production restore делать только осознанно, потому что он заменяет текущие данные:

```bash
~/scripts/backup-food-crm-db.sh
sudo -u postgres dropdb food_crm
sudo -u postgres createdb food_crm --owner=food_crm_user
BACKUP=~/backups/postgres/food_crm-YYYYMMDD-HHMMSS.dump.gz
gzip -dc "$BACKUP" | pg_restore --dbname=food_crm --no-owner --no-privileges
```

После restore снова запустить приложения:

```bash
pm2 start food-crm-backend food-crm-frontend
curl https://api.crmandromeda.ru/api/v1/health
```

После тестового restore удалить временную базу:

```bash
sudo -u postgres dropdb food_crm_restore_test
```

## Caddy

Конфиг:

```text
/etc/caddy/Caddyfile
```

Ожидаемые production routes:

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

Проверить конфиг:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
```

Форматировать:

```bash
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
```

Перезагрузить:

```bash
sudo systemctl reload caddy
```

Статус:

```bash
systemctl status caddy --no-pager
```

Логи Caddy:

```bash
journalctl -u caddy -n 100 --no-pager
```

## Firewall

Статус:

```bash
sudo ufw status verbose
```

Ожидаемые открытые порты:

```text
22/tcp
80/tcp
443/tcp
```

## Logs And Disk

Диск:

```bash
df -h
du -sh ~/apps ~/backups ~/.pm2
```

RAM/CPU:

```bash
free -h
top
```

PM2 logrotate:

```bash
pm2 conf pm2-logrotate
pm2 status
```

Текущие настройки:

```text
max_size: 10M
retain: 14
compress: true
rotateInterval: 0 4 * * *
```

## Rollback Release

Rollback frontend на предыдущий release:

```bash
ls -1dt ~/apps/food-crm/releases/*
PREVIOUS_RELEASE=/home/deploy/apps/food-crm/releases/PASTE_RELEASE_DIR
ln -sfn "$PREVIOUS_RELEASE" ~/apps/food-crm/current
cd ~/apps/food-crm/current
pm2 startOrReload ecosystem.config.cjs --only food-crm-frontend --update-env
pm2 save
```

Rollback backend:

```bash
ls -1dt ~/apps/food-crm-backend/releases/*
PREVIOUS_RELEASE=/home/deploy/apps/food-crm-backend/releases/PASTE_RELEASE_DIR
ln -sfn "$PREVIOUS_RELEASE" ~/apps/food-crm-backend/current
cd ~/apps/food-crm-backend/current
pm2 startOrReload ecosystem.config.cjs --only food-crm-backend --update-env
pm2 save
curl https://api.crmandromeda.ru/api/v1/health
```

Важно: backend rollback не откатывает миграции базы. Если новая миграция уже изменила данные или схему, нужен отдельный план восстановления.

## Troubleshooting

Backend health не отвечает:

```bash
pm2 status
pm2 logs food-crm-backend --lines 100
curl http://127.0.0.1:4000/api/v1/health
journalctl -u caddy -n 100 --no-pager
```

Frontend дает 502:

```bash
pm2 status
pm2 logs food-crm-frontend --lines 100
curl -I http://127.0.0.1:3000
journalctl -u caddy -n 100 --no-pager
```

Проблемы с login/cookie:

```bash
grep -E 'BACKEND_SESSION|BACKEND_CORS|SESSION_SECRET' ~/apps/food-crm-backend/shared/.env | sed 's/=.*/=<hidden>/'
grep -E 'BACKEND_API_URL|NEXT_PUBLIC_BACKEND_API_URL|SESSION_SECRET' ~/apps/food-crm/shared/.env | sed 's/=.*/=<hidden>/'
```

Секреты не показывать на скринах.

Проблемы с GitHub Actions SSH:

- проверить `DEPLOY_SSH_KEY_B64` в GitHub secrets
- проверить public key в `/home/deploy/.ssh/authorized_keys`
- проверить, что SSH работает вручную:

```bash
ssh deploy@163.5.29.68
```

Проверить последние systemd ошибки:

```bash
journalctl -p err -n 100 --no-pager
```

Проверить открытые порты на сервере:

```bash
ss -ltnp
```

## Snapshot

После важных стабильных изменений делать snapshot в HOSTKEY.

Текущая стабильная точка:

```text
crm-initial-production
```

## Operational Checklist

Ежедневно:

- открыть CRM
- проверить health endpoint
- проверить, что cron backup создал свежий файл

Еженедельно:

- `pm2 status`
- `df -h`
- `ls -lh ~/backups/postgres`
- проверить GitHub Actions на красные деплои

Перед крупными изменениями:

- ручной DB backup
- snapshot VPS
- записать текущие commit SHA backend/frontend

После крупного изменения:

- проверить `pm2 status`
- проверить `curl https://api.crmandromeda.ru/api/v1/health`
- открыть `https://crm.crmandromeda.ru`
- сделать новый snapshot, если состояние стабильное
