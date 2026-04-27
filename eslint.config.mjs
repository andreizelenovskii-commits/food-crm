import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/modules/*/*.service", "@/modules/*/*.repository", "@/shared/db/*", "pg"],
              message:
                "Route layer must not depend on services, repositories or database primitives directly. Go through the backend API gateway.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["components/**/*.{ts,tsx}", "modules/**/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/modules/*/*.service", "@/modules/*/*.repository", "@/shared/db/*", "pg"],
              message:
                "Presentation components must stay free of service, repository and database imports. Use API-backed data passed from routes or client API calls.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/**/*.service.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["next/*"],
              message:
                "Keep the service layer framework-agnostic. Move Next.js-specific code to route files or server actions.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "backend/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
