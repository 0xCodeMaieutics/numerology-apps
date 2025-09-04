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
          .where(eq(celebritiesTable.id, id))
          .limit(1)
          .then((res) => res[0]),
    },
  },
};

export type DBQueries = {
  select: {
    celebrities: typeof celebritiesTable.$inferSelect;
    user: typeof userTable.$inferSelect;
    account: typeof accountTable.$inferSelect;
    session: typeof sessionTable.$inferSelect;
    verification: typeof verificationTable.$inferSelect;
  };
  insert: {
    celebrities: typeof celebritiesTable.$inferInsert;
    user: typeof userTable.$inferInsert;
    account: typeof accountTable.$inferInsert;
    session: typeof sessionTable.$inferInsert;
    verification: typeof verificationTable.$inferInsert;
  };
};
