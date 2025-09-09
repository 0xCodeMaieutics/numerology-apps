import { nosqlDB } from "@workspace/db/nosql";
import { config } from "dotenv";
import mongoose from "mongoose";
import { performance } from "perf_hooks";

const envVarFlag = process.argv[2];

config({
  path: envVarFlag === "--prod" ? ".env.production" : ".env",
});

const celeb = "6ae7bfe54b44cf873cead906";
void (async function () {
  await nosqlDB.connect();
  let perf = performance.now();
  const comments =
    await nosqlDB.models.CelebrityComment.findCommentsWithReplies(celeb, {
      skip: 0,
      limit: 1,
      sortBy: { createdAt: "asc", replyCreatedAt: "asc" },
    });
  console.log(comments);

  console.log(
    comments[0]?.replies?.map?.((r: any) =>
      new Date(r.createdAt).toTimeString()
    )
  );

  perf = performance.now() - perf;

  console.log(`Time taken to fetch comments and replies: ${perf} ms`);
  const commentsCount =
    await nosqlDB.models.CelebrityComment.getCommentAndRepliesCount(celeb);
  console.log(`Total comments and replies: ${commentsCount}`);
  await mongoose.connection.close();
})();
