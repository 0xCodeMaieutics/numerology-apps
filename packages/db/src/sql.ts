import { drizzle } from "drizzle-orm/node-postgres";
import { celebritiesTable } from "./sql/schema/celebrities";
import { userTable } from "./sql/schema/user";
import { accountTable } from "./sql/schema/account";
import { sessionTable } from "./sql/schema/session";
import { verificationTable } from "./sql/schema/verification";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { count, sql } from "drizzle-orm";

const sqlClient = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ...(Boolean(process.env.DATABASE_SSL_ENABLED) ? { ssl: true } : {}),
  },
});

export const sqlSchema = {
  celebrities: celebritiesTable,
  user: userTable,
  account: accountTable,
  session: sessionTable,
  verification: verificationTable,
};

export const sqlDB = {
  client: sqlClient,
  schema: sqlSchema,
  celebrities: {
    select: {
      all: (limit = 10, offset = 0) =>
        sqlClient.select().from(celebritiesTable).limit(limit).offset(offset),
      id: (id: string) =>
        sqlClient
          .select()
          .from(celebritiesTable)
          .where(eq(celebritiesTable.id, id))
          .limit(1)
          .then((res) => res[0]),
      category: (category: string, limit = 10) =>
        sqlClient
          .select()
          .from(celebritiesTable)
          .where(sql`${category}::text = ANY (${celebritiesTable.categories})`)
          .limit(limit),
      count: () =>
        sqlClient
          .select({ count: count() })
          .from(celebritiesTable)
          .then((res) => res?.[0]?.count ?? 0),
    },
    update: {
      like: ({
        celebrityId,
        totalLikes,
      }: {
        celebrityId: string;
        totalLikes: number;
      }) =>
        sqlClient
          .update(celebritiesTable)
          .set({
            totalLikes,
          })
          .where(eq(celebritiesTable.id, celebrityId)),
    },
  },
  user: {
    select: {
      count: () =>
        sqlClient
          .select({ count: count() })
          .from(userTable)
          .then((res) => res?.[0]?.count ?? 0),
    },
  },
};

export type SQLDBQueries = {
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
