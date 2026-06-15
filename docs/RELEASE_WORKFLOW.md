# Release Workflow

## Branch and Environment Model

```text
feature branch -> dev -> staging -> main -> production
```

In git terms:

- `feature/*` branches are short-lived work branches.
- `dev` is the integration branch.
- `staging` is the deployed environment from `dev`, not a separate git branch.
- `main` is the production branch.
- `production` is the deployed environment from `main`.

Repositories:

- Frontend: `andreizelenovskii-commits/food-crm`
- Backend: `andreizelenovskii-commits/food-crm-backend`

## Normal Flow

1. Create a feature branch from `dev`.
2. Open a PR into `dev`.
3. CI must pass before merging to `dev`.
4. Merge to `dev`.
5. Let staging deploy from `dev`.
6. Smoke-test staging.
7. Open/merge `dev` into `main` only after the checklist below is complete.
8. Production deploy runs from `main`.

Always deploy production in this order:

1. Backend
2. Frontend

## Automated Checks

Backend CI runs on pull requests and pushes to `dev`:

```bash
npm ci
npx prisma generate
npm run typecheck
npm test
```

Frontend CI runs on pull requests and pushes to `dev`:

```bash
npm ci
npm run lint
npm test
npm run build
```

Deploy workflows also run checks before uploading releases.

Backend deploy must run:

```bash
npm run typecheck
npm test
```

Frontend deploy must run:

```bash
npm run lint
npm test
npm run build
```

## Checklist Before Merging to `main`

Backend:

- `npm run typecheck` passes.
- `npm test` passes.
- Database migrations have been applied on staging.
- `http://127.0.0.1:4100/api/v1/health` responds on the VPS.

Frontend:

- `npm run lint` passes.
- `npm test` passes.
- `npm run build` passes.
- `http://127.0.0.1:3100` responds on the VPS.
- `http://127.0.0.1:3100/login` responds on the VPS.
- Dashboard opens after login.

Manual staging smoke-test:

- Admin login works.
- Dashboard is visible.
- Product create/edit works.
- Client create works.
- Order create works.
- Order status change works.
- Inventory writeoff/movement works if the change touches order or stock flows.
- Logout/login works.
- Public storefront opens.
- Public order either works or is intentionally hidden.

## Production Check

After production deploy:

```bash
curl https://api.crmandromeda.ru/api/v1/health
curl -I https://crm.crmandromeda.ru
curl -I https://crm.crmandromeda.ru/login
```

Then repeat the critical smoke path on production if the release changed auth,
orders, catalog, clients, inventory, or public storefront behavior.
