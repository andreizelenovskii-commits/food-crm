import { readFile } from "node:fs/promises";

const REQUIRED_MARKERS = [
  {
    file: ".github/workflows/setup-staging.yml",
    markers: [
      "dev.crm.crmandromeda.ru",
      "dev-api.crmandromeda.ru",
      "food_crm_staging",
      "/home/deploy/apps/food-crm-staging",
      "/home/deploy/apps/food-crm-backend-staging",
    ],
  },
  {
    file: ".github/workflows/deploy-staging.yml",
    markers: [
      'branches: ["dev"]',
      "food-crm-frontend-staging",
      "127.0.0.1:3100",
      "https://dev-api.crmandromeda.ru",
    ],
  },
  {
    file: "backend/.github/workflows/deploy-staging.yml",
    markers: [
      'branches: ["dev"]',
      "food-crm-backend-staging",
      "127.0.0.1:4100",
      "food_crm_staging",
    ],
  },
  {
    file: "ecosystem.staging.config.cjs",
    markers: ["food-crm-frontend-staging", "3100"],
  },
  {
    file: "backend/ecosystem.staging.config.cjs",
    markers: ["food-crm-backend-staging", "4100"],
  },
  {
    file: "docs/STAGING.md",
    markers: ["dev.crm.crmandromeda.ru", "dev-api.crmandromeda.ru", "Branch:           dev"],
  },
];

const failures = [];

for (const entry of REQUIRED_MARKERS) {
  const content = await readFile(entry.file, "utf8").catch(() => null);

  if (content === null) {
    failures.push(`${entry.file}: file is missing`);
    continue;
  }

  for (const marker of entry.markers) {
    if (!content.includes(marker)) {
      failures.push(`${entry.file}: missing marker "${marker}"`);
    }
  }
}

if (failures.length > 0) {
  console.error("Dev mirror configuration is incomplete:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("OK: dev mirror configuration is present for frontend, backend, DNS docs and PM2.");
