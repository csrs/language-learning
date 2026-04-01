// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
  // Global ignores
  {
    ignores: [
      "*/dist/**/*",
      "frontend/public/**/*",
      "frontend/node_modules/**/*",
      "backend/node_modules/**/*",
      "*.js",
    ],
  },

  // Base JS + TS rules
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": "error",
    },
  },

  // Frontend TypeScript + React scope
  {
    files: ["frontend/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: "./frontend/tsconfig.json",
      },
    },
    rules: {
      "no-console": "warn",
    },
  },

  // Backend TypeScript scope
  {
    files: ["backend/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./backend/tsconfig.json",
      },
    },
  },
);
