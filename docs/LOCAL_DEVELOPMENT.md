# Local Development

## Daily Commands

```bash
cd food-crm-dev
```

| Goal | Command |
| --- | --- |
| Ежедневная работа | `npm run local` |
| Чистый старт | `npm run local:fresh` |
| Проверка смены | `npm run local:shift:check` |
| Полная browser-проверка | `npm run local:shift:e2e` |
| Весь QA | `npm run local:qa` |
| Автозапуск macOS | `npm run local:autostart:install` |
| Статус | `npm run local:status` |
| Логи | `npm run local:logs` |
| Остановить | `npm run local:stop` |

## First Setup

```bash
npm run local:setup
npm run local
```

## URLs

| Area | URL |
| --- | --- |
| CRM login | http://localhost:3000/login |
| Dispatcher | http://localhost:3000/dispatcher/orders |
| Kitchen | http://localhost:3000/kitchen |
| Shift history | http://localhost:3000/dashboard/sales/shifts |
| Public menu | http://localhost:3000/menu/пицца |
| Local health | http://localhost:3000/dev |
| Backend health | http://127.0.0.1:4000/api/v1/health |

Browser API calls use the frontend origin: `/api/v1/*`. Next.js rewrites them to
`http://127.0.0.1:4000/api/v1/*`, so normal local browser flows do not need CORS.

## Demo Users

`npm run local:setup` and `npm run local:reset` seed local-only demo accounts:

| Role | Phone | Password |
| --- | --- | --- |
| Управляющий | `+7 900 100-00-01` | `FoodLikeDev1!` |
| Диспетчер | `+7 900 100-00-02` | `FoodLikeDev1!` |
| Повар | `+7 900 100-00-03` | `FoodLikeDev1!` |
| Курьер | `+7 900 100-00-04` | `FoodLikeDev1!` |

These credentials are local-only. Do not use them for staging or production.

## Local SMS

Local backend uses `SMSAERO_ENABLED=false`.

1. Open the public site.
2. Request a code.
3. Read the `[sms-dev]` line in the `[API]` log.
4. Enter that code in the browser.

No real SMS is sent.

## Time Simulation

Shift logic uses Asia/Sakhalin business time. For local development:

```bash
npm run local:time:set -- "2026-06-24 08:59"
npm run local:time:set -- "2026-06-24 09:00"
npm run local:time:set -- "2026-06-24 20:59"
npm run local:time:set -- "2026-06-24 21:00"
npm run local:time:show
npm run local:time:reset
```

The override is stored in the backend `.local-dev-clock.json`, which is ignored by git.
It is read only when `NODE_ENV=development` and `LOCAL_DEV_TOOLS_ENABLED=true`.

## DB Reset

```bash
npm run local:reset
```

For automation:

```bash
npm run local:reset -- --yes
```

The reset refuses any database URL that is not localhost/127.0.0.1 and database
`food_crm_local`.

`local:reset` makes a backup first unless `--no-backup` is passed explicitly.
`local:fresh` runs backup, reset, seed and background start:

```bash
npm run local:fresh
```

Restore the latest local backup:

```bash
npm run local:restore:last
```

## Background Mode

```bash
npm run local:start
npm run local:status
npm run local:logs
npm run local:restart
npm run local:stop
```

Background mode stores runtime data in `.local/`:

- PIDs: `.local/pids/`
- Logs: `.local/logs/`
- Backups: `.local/backups/`
- Reports: `.local/reports/`

`local:start` is idempotent and refuses to kill unrelated processes on busy ports.

## Shift Automation

```bash
npm run local:shift:check
npm run local:shift:e2e
```

The API smoke uses an isolated stack:

- frontend test URL: `http://127.0.0.1:3001`
- backend test URL: `http://127.0.0.1:4001`
- database: `food_crm_shift_test` on port `5433`

Reports are written to `.local/reports/`. The regular local DB is not reset or modified.

Playwright browser E2E requires Chromium:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

## macOS Autostart

```bash
npm run local:autostart:install
npm run local:autostart:status
npm run local:autostart:uninstall
```

Autostart uses native LaunchAgent `ru.crmandromeda.foodlike.local`.
It starts Docker/PostgreSQL/backend/frontend through `local:start`.

Autostart never resets the local database, never changes the clock, never runs tests
and never opens a browser. If the repository is moved, reinstall autostart.

## Doctor

```bash
npm run local:doctor
```

The doctor checks Node, npm, Docker, env files, local database safety, cookie names,
ports and health endpoints.

## Stop

```bash
npm run local:stop
npm run local:stop -- --db
```

The default keeps PostgreSQL running for faster next starts. `--db` stops the local
PostgreSQL container without deleting the volume.

## Troubleshooting

| Problem | Command |
| --- | --- |
| Docker is not running | `open -a Docker` |
| Port is busy | `npm run local:doctor` |
| Stale PID | `npm run local:status && npm run local:restart` |
| DB is broken | `npm run local:reset` |
| Restore last backup | `npm run local:restore:last` |
| Login does not work | `npm run local:doctor` |
| Playwright Chromium missing | `npx playwright install chromium` |
| Autostart after repo move | `npm run local:autostart:install` |
| LaunchAgent status | `npm run local:autostart:status` |
| Check shift opening | `npm run local:time:set -- "2026-06-24 09:00"` |
| Check shift closing | `npm run local:time:set -- "2026-06-24 21:00"` |
| Return real time | `npm run local:time:reset` |

## Safety

This workflow does not use SSH, VPS, Caddy, staging ports, production domains or
staging/production databases. Production and staging deploy workflows are not used.
