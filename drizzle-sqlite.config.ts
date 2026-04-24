import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema-sqlite.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  dbCredentials: { url: "/home/workspace/amml/data/amml.db" },
});