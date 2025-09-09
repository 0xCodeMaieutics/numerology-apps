import { ICelebrityCommentWrite, nosqlDB } from "@workspace/db/nosql";
import { config } from "dotenv";
import mongoose from "mongoose";

const envVarFlag = process.argv[2];
config({
  path: envVarFlag === "--prod" ? ".env.production" : ".env",
});

const celeb = "0dfa86c4c26f1d079c32f039";
const authorId = "d2516b20bf18414ff20f377e";
void (async function () {
  const writeDoc: ICelebrityCommentWrite = {
    celebrityId: celeb,
    author: "John Doe",
    authorId: authorId,
    comment: "This is a comment",
    likes: 0,
  };
  await nosqlDB.connect();
  const result = await nosqlDB.models.CelebrityComment.createTopLevel(writeDoc);
  console.log(result._id.toString());
  //   const comments =
  // await nosqlDB.models.CelebrityComment.findCommentsWithReplies(celeb);
  //   console.log(JSON.stringify(comments, null, 2));
  await mongoose.connection.close();
})();
