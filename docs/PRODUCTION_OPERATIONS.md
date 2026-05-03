# Production Operations Runbook

Caddy, firewall, logs, rollback и troubleshooting для production.

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

Проверить и применить:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo systemctl reload caddy
systemctl status caddy --no-pager
```

Логи:

```bash
journalctl -u caddy -n 100 --no-pager
```

## Firewall

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

```bash
df -h
du -sh ~/apps ~/backups ~/.pm2
free -h
top
pm2 conf pm2-logrotate
pm2 status
```

Ожидаемые настройки `pm2-logrotate`:

```text
max_size: 10M
retain: 14
compress: true
rotateInterval: 0 4 * * *
```

## Rollback

Frontend:

```bash
ls -1dt ~/apps/food-crm/releases/*
PREVIOUS_RELEASE=/home/deploy/apps/food-crm/releases/PASTE_RELEASE_DIR
ln -sfn "$PREVIOUS_RELEASE" ~/apps/food-crm/current
cd ~/apps/food-crm/current
pm2 startOrReload ecosystem.config.cjs --only food-crm-frontend --update-env
pm2 save
```

Backend:

```bash
ls -1dt ~/apps/food-crm-backend/releases/*
PREVIOUS_RELEASE=/home/deploy/apps/food-crm-backend/releases/PASTE_RELEASE_DIR
ln -sfn "$PREVIOUS_RELEASE" ~/apps/food-crm-backend/current
cd ~/apps/food-crm-backend/current
pm2 startOrReload ecosystem.config.cjs --only food-crm-backend --update-env
pm2 save
curl https://api.crmandromeda.ru/api/v1/health
```

Backend rollback не откатывает миграции базы. Если новая миграция уже изменила данные или схему, нужен отдельный план restore из [PRODUCTION_DATABASE.md](PRODUCTION_DATABASE.md).

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

Проблемы с GitHub Actions SSH:

- проверить `DEPLOY_SSH_KEY_B64` в GitHub secrets
- проверить public key в `/home/deploy/.ssh/authorized_keys`
- проверить `ssh deploy@163.5.29.68`

Системные ошибки и порты:

```bash
journalctl -p err -n 100 --no-pager
ss -ltnp
```

Секреты не показывать на скринах и не отправлять в чат.

## Snapshot

После важных стабильных изменений делать snapshot в HOSTKEY.

Текущая стабильная точка:

```text
crm-initial-production
```
