import { nosqlDB } from "@workspace/db/nosql";
import { config } from "dotenv";
import mongoose from "mongoose";
import { performance } from "perf_hooks";
const envVarFlag = process.argv[2];
config({
  path: envVarFlag === "--prod" ? ".env.production" : ".env",
});

const parentId = "68bd55619e4b17b488118b27";
const celeb = "0dfa86c4c26f1d079c32f039";
const authorId = "d2516b20bf18414ff20f377e";
void (async function () {
  await nosqlDB.connect();
  let start = performance.now();
  await nosqlDB.models.CelebrityComment.createReply({
    celebrityId: celeb,
    author: "John Doe",
    authorId: authorId,
    comment: "This is a comment",
    likes: 0,
    parentId,
  });
  let end = performance.now();
  console.log(`Time taken to create reply: ${end - start} ms`);

  await mongoose.connection.close();
})();
