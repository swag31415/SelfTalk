import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// The fallback permits static production builds; runtime deployments must provide DATABASE_URL.
const connectionString = process.env.DATABASE_URL ?? "postgres://selftalk:selftalk@localhost:5432/selftalk";
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
