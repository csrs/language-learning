import { defineConfig } from "orval";

export default defineConfig({
  languageLearningApi: {
    input: {
      target: "../backend/openapi.generated.json",
    },
    output: {
      mode: "tags-split",
      target: "src/api/generated/endpoints",
      schemas: "src/api/generated/types",
      client: "fetch",
      clean: ["src/api/generated/endpoints", "src/api/generated/types"],
      baseUrl: "",
      override: {
        mutator: {
          path: "src/api/generated/fetchClient.ts",
          name: "apiFetch",
        },
      },
    },
  },
});
