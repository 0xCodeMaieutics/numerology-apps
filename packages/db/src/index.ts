import { drizzle } from "drizzle-orm/node-postgres";
import { celebritiesTable } from "./db/schema/celebrities.ts";

const client = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: process.env.NODE_ENV === "production",
  },
});

export const db = {
  client,
  tables: {
    celebrities: celebritiesTable,
  },
};
