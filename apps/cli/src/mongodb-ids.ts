import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { ICelebrityComment, nosqlDB } from "@workspace/db/nosql";
import { sqlDB } from "@workspace/db/sql";
import { createRandomId } from "@workspace/utils";

const envVarFlag = process.argv[2];
config({
  path: envVarFlag === "--prod" ? ".env.production" : ".env",
});

void (async function () {
  const celebrities = await sqlDB.celebrities.select.all(500);
  const conn = await nosqlDB.connect();

  console.log(
    "Celebrities:",
    celebrities.map((c) => c.id)
  );

  const newCelebs = celebrities.map(
    (celeb) =>
      ({
        ...celeb,
        id: createRandomId(),
      }) as ICelebrityComment
  );

  console.log("Total celebs:", celebrities.length, newCelebs.length);

  for (const celeb of celebrities) {
    if (celeb.id.length === 32) {
      // delete duplicate
      console.log("Deleting duplicate celeb with id:", celeb.id);
      await sqlDB.client
        .delete(sqlDB.schema.celebrities)
        // @ts-expect-error -- IGNORE --
        .where(eq(celebritiesTable.id, celeb.id));
    }
  }

  console.log("Done inserting celebs");

  await conn.connection.close();
  await sqlDB.client.$client.end();
})();
