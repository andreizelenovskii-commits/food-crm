# Production Database Runbook

PostgreSQL, backup, restore и admin user для CRM Andromeda.

## PostgreSQL

Проверка сервиса:

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

Restore перезаписывает данные. Перед restore сделать свежий backup.

Восстановление в отдельную тестовую базу:

```bash
sudo -u postgres createdb food_crm_restore_test --owner=food_crm_user
BACKUP=~/backups/postgres/food_crm-YYYYMMDD-HHMMSS.dump.gz
gzip -dc "$BACKUP" | pg_restore --dbname=food_crm_restore_test --no-owner --no-privileges
```

Production restore:

```bash
pm2 stop food-crm-backend food-crm-frontend
~/scripts/backup-food-crm-db.sh
sudo -u postgres dropdb food_crm
sudo -u postgres createdb food_crm --owner=food_crm_user
BACKUP=~/backups/postgres/food_crm-YYYYMMDD-HHMMSS.dump.gz
gzip -dc "$BACKUP" | pg_restore --dbname=food_crm --no-owner --no-privileges
pm2 start food-crm-backend food-crm-frontend
curl https://api.crmandromeda.ru/api/v1/health
```

Удалить тестовую базу:

```bash
sudo -u postgres dropdb food_crm_restore_test
```
