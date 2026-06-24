# Local Development

```bash
cd food-crm-dev
npm run local:setup
npm run local:dev
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
| DB is broken | `npm run local:reset` |
| Login does not work | `npm run local:doctor` |
| Check shift opening | `npm run local:time:set -- "2026-06-24 09:00"` |
| Check shift closing | `npm run local:time:set -- "2026-06-24 21:00"` |
| Return real time | `npm run local:time:reset` |

## Safety

This workflow does not use SSH, VPS, Caddy, staging ports, production domains or
staging/production databases. Production and staging deploy workflows are not used.
