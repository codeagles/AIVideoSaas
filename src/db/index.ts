import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL/POSTGRES_URL env var");
}

const isLocalhost = databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");
const sql = postgres(databaseUrl, {
  max: 10,
  ssl: isLocalhost ? undefined : "require",
});

export const db = drizzle(sql, { schema });

export * from "./schema";
