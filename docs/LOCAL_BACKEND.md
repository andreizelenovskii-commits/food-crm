# Локальный бэкенд + Postgres (macOS), вариант 1

Цель: на Mac своя база и API на **4000**, фронт **food-crm** на **3000** — без VPS. Учётки создаёшь **`npm run admin:create` на Mac**, не на сервере.

Репозиторий API: **`andreizelenovskii-commits/food-crm-backend`**.

### Postgres без Homebrew (Docker)

Если установлен [Docker Desktop](https://www.docker.com/products/docker-desktop/):

```bash
cd /path/to/food-crm
npm run local:db:up
```

Скопируй [docker/backend.env.example](../docker/backend.env.example) в **`food-crm-backend/.env`** (рядом с `package.json` бэкенда) — там уже `DATABASE_URL` под этот контейнер. Дальше миграции и `admin:create` так же, как после установки Postgres ниже.

---

## 0. Homebrew

Если в терминале **`zsh: command not found: brew`**, сначала поставь [Homebrew](https://brew.sh/):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

В конце скрипт напишет **две команды** — их нужно выполнить, чтобы `brew` находился в PATH. На **Apple Silicon** чаще всего так:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

На **Intel** путь может быть `/usr/local/bin/brew` — смотри, что выведет установщик.

Перезапусти Terminal (или `source ~/.zprofile`), затем:

```bash
brew --version
```

Без рабочего `brew` шаг с PostgreSQL ниже не выполнится. Альтернатива без Brew — [Postgres.app](https://postgresapp.com/) и свой `DATABASE_URL` на порт из приложения (часто `5432`).

---

## 1. PostgreSQL

С [Homebrew](https://brew.sh/):

```bash
brew install postgresql@16
brew services start postgresql@16
```

Добавь `bin` в PATH на время сессии (Apple Silicon / Homebrew по умолчанию):

```bash
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
```

На Intel иногда: `/usr/local/opt/postgresql@16/bin`.

Создай базу (имя на твой вкус):

```bash
createdb food_crm_local
```

Проверка:

```bash
psql -d food_crm_local -c "SELECT 1;"
```

---

## 2. Строка `DATABASE_URL`

Частый вариант для локального Postgres без пароля (peer/локальный доступ):

```text
postgresql://ВЫВОД_КОМАНДЫ_whoami@localhost:5432/food_crm_local?schema=public
```

Подставь вместо `ВЫВОД_КОМАНДЫ_whoami` логин macOS (в терминале: `whoami`).

Если настроил пользователя с паролем — стандартный URL:

```text
postgresql://USER:PASSWORD@localhost:5432/food_crm_local?schema=public
```

---

## 3. Клон и зависимости бэкенда

```bash
cd ~/projects   # или другая папка для репозиториев
git clone git@github.com:andreizelenovskii-commits/food-crm-backend.git
cd food-crm-backend
npm install
```

---

## 4. Файл `.env` в **корне** `food-crm-backend`

Бэкенд читает **сначала** `../.env` относительно текущей директории, затем **перекрывает** значениями из **`.env` в корне репозитория**. Держи все переменные в **`food-crm-backend/.env`**, чтобы не путаться.

Пример (подставь свой `DATABASE_URL` и длинный секрет):

```bash
DATABASE_URL="postgresql://myuser@localhost:5432/food_crm_local?schema=public"
SESSION_SECRET="замени-на-32+случайных-символов-минимум"
BACKEND_CORS_ORIGIN="http://localhost:3000,http://127.0.0.1:3000"
PORT=4000
```

Вместо `myuser` подставь результат команды `whoami` на Mac.

`PORT` по умолчанию уже **4000**, строку можно опустить.

---

## 5. Схема БД (миграции)

Из корня **`food-crm-backend`**:

```bash
npx prisma generate
npm run db:deploy
```

Если `db:deploy` ругается на подключение — проверь `DATABASE_URL` и что `postgresql@16` запущен (`brew services list`).

---

## 6. Админ в **локальной** базе

Там же, в корне бэкенда:

```bash
read -s -p "Пароль админа: " ADMIN_PASSWORD; echo
ADMIN_PHONE="+79241868741" ADMIN_PASSWORD="$ADMIN_PASSWORD" npm run admin:create
unset ADMIN_PASSWORD
```

В логе должно быть: `Admin user is ready: 79241868741` (или твой нормализованный номер).

---

## 7. Запуск API

```bash
npm run dev
```

Проверка:

```bash
curl -fsS http://127.0.0.1:4000/api/v1/health
```

Оставь этот терминал открытым.

---

## 8. Фронт `food-crm`

В другом терминале, в каталоге **этого** репозитория:

```bash
cd /path/to/food-crm
cp .env.local.example .env.local
# задай SESSION_SECRET в .env.local
npm install
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000), войди **тем же телефоном и паролем**, что в шаге 6.

`NEXT_PUBLIC_BACKEND_API_URL` не обязателен, если фронт и API оба на `localhost` / `127.0.0.1` и порт API **4000** (см. [README](../README.md)).

---

## Частые сбои

| Симптом | Что проверить |
| --- | --- |
| `401` на логине | `admin:create` запускался **на Mac** с тем же `DATABASE_URL`, что у `npm run dev` бэкенда. |
| `connection refused` на 4000 | Бэкенд не запущен или другой `PORT`. |
| Ошибка Prisma / миграций | Версия Node **22** (как на проде), актуальный `npm install`. |
| CORS в консоли | В `.env` бэкенда есть `BACKEND_CORS_ORIGIN` с `http://localhost:3000`. |

Официальные требования к переменным бэкенда — в [README бэкенда](https://github.com/andreizelenovskii-commits/food-crm-backend/blob/main/README.md).
