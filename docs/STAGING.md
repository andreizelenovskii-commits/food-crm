# Staging CRM

Staging is the draft mirror for development changes before production deploy.

## Domains

Create DNS A records:

```text
dev.crm.crmandromeda.ru      163.5.29.68
dev-api.crmandromeda.ru      163.5.29.68
```

## Runtime

```text
Frontend staging: /home/deploy/apps/food-crm-staging          port 3100
Backend staging:  /home/deploy/apps/food-crm-backend-staging  port 4100
Database:         food_crm_staging
Branch:           dev
```

Production stays on:

```text
Frontend production: /home/deploy/apps/food-crm          port 3000
Backend production:  /home/deploy/apps/food-crm-backend  port 4000
Branch:              main
```

## First Setup

After DNS records exist, run the GitHub Actions workflow:

```text
Setup staging infrastructure
```

It prepares:

- staging `.env` files
- `food_crm_staging` database
- Caddy routes for `dev.crm.crmandromeda.ru` and `dev-api.crmandromeda.ru`

The setup requires passwordless `sudo` for the `deploy` user on the VPS.

## Deploy Flow

Push draft work to `dev`:

```bash
git push origin dev
```

Staging deploy workflows:

```text
Deploy frontend staging
Deploy backend staging
```

When staging is approved, merge `dev` into `main` and push `main` to deploy production.
