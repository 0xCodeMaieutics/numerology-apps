import mongoose from "mongoose";
import {
  describe,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  it,
  expect,
  test,
} from "vitest";
import { nosqlDB } from "../../nosql";
describe("CelebrityComment", () => {
  let celebrityId = new mongoose.Types.ObjectId().toString();
  let userId = new mongoose.Types.ObjectId().toString();
  let topLevelCommentId = new mongoose.Types.ObjectId().toString();
  let replyCommentId = new mongoose.Types.ObjectId().toString();

  beforeAll(async () => {
    await nosqlDB.connect();
  });

  beforeEach(async () => {
    const createdUser = await nosqlDB.models.User.create({
      _id: userId,
    });
    userId = createdUser._id.toString();

    const topLevelComment =
      await nosqlDB.models.CelebrityComment.createTopLevel({
        celebrityId,
        author: "Test Author",
        authorId: userId,
        comment: "This is a test comment",
      });
    topLevelCommentId = topLevelComment._id.toString();

    const replyComment = await nosqlDB.models.CelebrityComment.createReply({
      celebrityId,
      parentId: topLevelCommentId,
      author: "Test Author",
      authorId: userId,
      comment: "This is a test reply",
    });
    replyCommentId = replyComment._id.toString();
  });

  afterEach(async () => {
    await nosqlDB.CelebrityComment.deleteMany({});
    await nosqlDB.User.deleteMany({});
    await nosqlDB.CommentLike.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("comments and replies creation", async () => {
    const comment = await nosqlDB.CelebrityComment.findById(topLevelCommentId);
    expect(comment?.level).toBe(0);
    expect(comment?._id?.toString()).toBe(topLevelCommentId);

    const reply = await nosqlDB.CelebrityComment.findById(replyCommentId);
    expect(reply?.level).toBe(1);
    expect(reply?._id?.toString()).toBe(replyCommentId);

    const commnetsWithReplies =
      await nosqlDB.models.CelebrityComment.findCommentsWithReplies({
        celebrityId,
        userId,
      });

    expect(commnetsWithReplies.length).toBe(1);
    const foundComment = commnetsWithReplies[0];
    expect(foundComment?.isLikedByUser).toBe(false);
    expect(foundComment).toBeDefined();
    expect(commnetsWithReplies.length).toBe(foundComment?.replyCount);
    expect(foundComment?.hasMoreReplies).toBe(false);
    expect(foundComment!._id?.toString()).toBe(topLevelCommentId);

    const replies = foundComment?.replies;
    expect(replies?.length).toBe(1);
    expect(replies?.[0]?._id?.toString()).toBe(replyCommentId);
    expect(replies?.[0]?.isLikedByUser).toBe(false);
  });

  it("should test user comment like", async () => {
    await nosqlDB.models.CelebrityComment.likeComment({
      commentId: topLevelCommentId,
      userId,
    });

    const foundComment =
      await nosqlDB.models.CelebrityComment.findById(topLevelCommentId);
    expect(foundComment?.likes).toBe(1);
    const foundLikedComment = await nosqlDB.models.CommentLike.findOne({
      userId,
      commentId: topLevelCommentId,
    });
    expect(foundLikedComment).not.toBeNull();
    expect(foundLikedComment?.userId?.toString()).toBe(userId);
    expect(foundLikedComment?.commentId?.toString()).toBe(topLevelCommentId);

    const comments =
      await nosqlDB.models.CelebrityComment.findCommentsWithReplies({
        celebrityId,
        userId,
      });

    expect(comments).toHaveLength(1);
    expect(comments[0]?.isLikedByUser).toBe(true);
    expect(comments[0]?.replies[0]?.isLikedByUser).toBe(false);
  });

  it("should test user comment reply like", async () => {
    await nosqlDB.models.CelebrityComment.likeComment({
      commentId: replyCommentId,
      userId,
    });

    const foundReply =
      await nosqlDB.models.CelebrityComment.findById(replyCommentId);

    expect(foundReply?.likes).toBe(1);
    const foundLikeReply = await nosqlDB.models.CommentLike.findOne({
      userId,
      commentId: replyCommentId,
    });
    expect(foundLikeReply).not.toBeNull();
    expect(foundLikeReply?.userId?.toString()).toBe(userId);
    expect(foundLikeReply?.commentId?.toString()).toBe(replyCommentId);

    const comments =
      await nosqlDB.models.CelebrityComment.findCommentsWithReplies({
        celebrityId,
        userId,
      });

    expect(comments).toHaveLength(1);
    expect(comments[0]?.isLikedByUser).toBe(false);
    expect(comments[0]?.replies[0]?.isLikedByUser).toBe(true);
  });
});
