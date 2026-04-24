import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",

  // SQLite (dev — local file)
  dialect: "sqlite",
  dbCredentials: {
    url: "/home/workspace/amml/data/amml.db",
  },
});