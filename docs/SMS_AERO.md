# SMS Aero Auth

Публичный сайт использует SMS-коды для входа и регистрации клиентов.
Ключи SMS Aero хранятся только в backend `.env` на сервере, не в git.

## Backend Env

Production:

```text
SMSAERO_ENABLED=true
SMSAERO_EMAIL=<email аккаунта SMS Aero>
SMSAERO_API_KEY=<api key из SMS Aero>
SMSAERO_SIGN=<подпись отправителя>
BACKEND_SESSION_COOKIE_DOMAIN=.crmandromeda.ru
```

Staging:

```text
SMSAERO_ENABLED=true
SMSAERO_EMAIL=<email аккаунта SMS Aero>
SMSAERO_API_KEY=<api key из SMS Aero>
SMSAERO_SIGN=<подпись отправителя>
BACKEND_SESSION_COOKIE_DOMAIN=.crmandromeda.ru
```

Local development:

```text
SMSAERO_ENABLED=false
```

При `SMSAERO_ENABLED=false` backend не отправляет SMS, а печатает код в лог.

## Где лежат env на VPS

```text
/home/deploy/apps/food-crm-backend/shared/.env
/home/deploy/apps/food-crm-backend-staging/shared/.env
```

После изменения env:

```bash
pm2 restart food-crm-backend
pm2 restart food-crm-backend-staging
pm2 save
```

## Проверка

1. Открой публичный сайт.
2. Нажми вход или регистрацию.
3. Введи телефон в формате `+7 ...`.
4. Нажми `Получить SMS-код`.
5. Проверь, что SMS пришла и код подтверждает вход.

Если SMS не пришла:

```bash
pm2 logs food-crm-backend --lines 100
pm2 logs food-crm-backend-staging --lines 100
```

Частые причины:

- неверный `SMSAERO_EMAIL`
- неверный `SMSAERO_API_KEY`
- неподтвержденная или неверная `SMSAERO_SIGN`
- нулевой баланс SMS Aero
- backend env изменили, но PM2 процесс не перезапустили

## Безопасность

- Код живет 10 минут.
- Повторная отправка ограничена 55 секундами.
- На проверку кода дается 5 попыток.
- Код хранится как hash с backend secret, не plain text.
- Публичный профиль не возвращает внутренний CRM id клиента.
