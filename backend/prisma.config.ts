import { defineConfig, env } from "prisma/config";
import "dotenv/config";

const migrationDatabaseUrl = process.env.DIRECT_URL ?? env("DATABASE_URL");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: migrationDatabaseUrl,
  },
});
