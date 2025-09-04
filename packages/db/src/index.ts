import { drizzle } from "drizzle-orm/node-postgres";
import { celebritiesTable } from "./db/schema/celebrities";
import { userTable } from "./db/schema/user";
import { accountTable } from "./db/schema/account";
import { sessionTable } from "./db/schema/session";
import { verificationTable } from "./db/schema/verification";
import { eq } from "drizzle-orm/sql/expressions/conditions";

const client = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: process.env.NODE_ENV === "production",
  },
});

const schema = {
  celebrities: celebritiesTable,
  user: userTable,
  account: accountTable,
  session: sessionTable,
  verification: verificationTable,
};

export const db = {
  client,
  schema,
  celebrities: {
    read: {
      id: (id: string) =>
        client
          .select()
          .from(celebritiesTable)
          .where(eq(celebritiesTable.id, id)),
    },
  },
};
