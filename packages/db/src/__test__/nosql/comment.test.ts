import mongoose from "mongoose";
import {
  describe,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  test,
  expect,
} from "vitest";
import { nosqlDB } from "../../nosql";

const TOTAL_COMMENTS = 10;
const TOTAL_REPLIES = 10;
const TOTAL_USERS = 2;

describe("CelebrityComment", async () => {
  const celebrityId = new mongoose.Types.ObjectId().toString();
  const [userId1, userId2] = Array.from({ length: TOTAL_USERS }).map(() =>
    new mongoose.Types.ObjectId().toString()
  );
  let topLevelCommentIds: string[] = [];
  let replyCommentIds: string[] = [];

  beforeAll(async () => {
    await nosqlDB.connect();
  });

  const dummyCommentData = {
    author: "Test Author",
    comment: "This is a test comment",
    level: 0,
    likes: 0,
  };

  const dummyReplyData = {
    author: "Test Author",
    comment: "This is a test reply",
    repliedAuthor: "Test Author",
    level: 1,
    likes: 0,
  };

  beforeEach(async () => {
    const comments = await Promise.all(
      Array.from({ length: TOTAL_COMMENTS }).map((_, i) =>
        nosqlDB.models.CelebrityComment.createTopLevel({
          ...dummyCommentData,
          celebrityId,
          authorId: i % 2 === 0 ? userId1! : userId2!,
        })
      )
    );
    topLevelCommentIds = comments.map((id) => id._id.toString());
    const replies = await Promise.all(
      topLevelCommentIds
        .map((id, i) =>
          Array.from({ length: TOTAL_REPLIES }).map(() =>
            nosqlDB.models.CelebrityComment.createReply({
              ...dummyReplyData,
              celebrityId,
              parentId: id,
              authorId: i % 2 === 0 ? userId1! : userId2!,
              repliedAuthorId: i % 2 === 0 ? userId2! : userId1!,
            })
          )
        )
        .flat()
    );
    replyCommentIds = replies.map((id) => id._id.toString());
  });

  afterEach(async () => {
    await nosqlDB.CelebrityComment.deleteMany({});
    await nosqlDB.CommentLike.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test.for([
    [0, 10, 0, 10],
    [4, 10, 5, 10],
    [2, 5, 3, 6],
    [1, 1, 1, 1],
  ])(
    "findCommentsWithReplies with skip %i and limit %i and reply skip %i and reply limit %i and userId %i",
    async ([skip = 0, limit = 0, replySkip = 0, replyLimit = 0]) => {
      const comments =
        await nosqlDB.models.CelebrityComment.findCommentsWithReplies(
          {
            celebrityId,
          },
          {
            skip,
            limit,
            replySkip,
            replyLimit,
          }
        );
      const expectedCommentsTotal =
        TOTAL_COMMENTS - skip > limit ? limit : TOTAL_COMMENTS - skip;

      const [firstComment] = comments;
      const [firstReply] = firstComment?.replies ?? [];

      expect(comments.length).toBe(expectedCommentsTotal);
      expect(firstComment?.level).toBe(0);
      expect(firstComment?.likes).toBe(0);
      const totalReply =
        TOTAL_REPLIES - replySkip > replyLimit
          ? replyLimit
          : TOTAL_REPLIES - replySkip;
      expect(firstComment?.replies?.length).toBe(totalReply);
      expect(firstComment?.parentId).toBeNull();
      expect(firstComment?.celebrityId.toString()).toBe(celebrityId.toString());
      expect(firstComment?.isLikedByUser).toBeUndefined();
      expect(firstComment?.hasMoreReplies).toBe(
        replySkip + replyLimit < TOTAL_REPLIES
      );

      expect(firstReply?.isLikedByUser).toBeUndefined();
      expect(firstReply?.celebrityId).toBe(celebrityId);
      expect(firstReply?.parentId).toBe(firstComment?._id);
      expect(firstReply?.level).toBe(1);
    }
  );

  test("like and unlike comment", async () => {
    const commentId = topLevelCommentIds[0]!;
    await nosqlDB.models.CelebrityComment.likeComment({
      commentId,
      userId: userId1!,
    });

    const updatedComment =
      await nosqlDB.models.CelebrityComment.findById(commentId);
    expect(updatedComment?.likes).toBe(1);

    await nosqlDB.models.CelebrityComment.unlikeComment({
      commentId,
      userId: userId1!,
    });

    const unlikedComment =
      await nosqlDB.models.CelebrityComment.findById(commentId);
    expect(unlikedComment?.likes).toBe(0);
  });

  test("like and unlike reply", async () => {
    const parentId = topLevelCommentIds[0]!;
    const replyId = replyCommentIds[0]!;
    await nosqlDB.models.CelebrityComment.likeComment({
      commentId: replyId,
      userId: userId1!,
    })
      .then(() => nosqlDB.models.CelebrityComment.findById(replyId))
      .then((updatedReply) => {
        if (updatedReply?.level === 1) {
          expect(updatedReply?.repliedAuthor).toBe("Test Author");
        }
        expect(updatedReply?.parentId?.toString()).toBe(parentId);
        return updatedReply;
      })
      .then((updatedReply) => {
        expect(updatedReply?.likes).toBe(1);
        return nosqlDB.models.CelebrityComment.unlikeComment({
          commentId: replyId,
          userId: userId1!,
        });
      })
      .then(() => nosqlDB.models.CelebrityComment.findById(replyId))
      .then((unlikedReply) => {
        expect(unlikedReply?.likes).toBe(0);
      });
  });

  test("reply to a comment and check reply author data", async () => {
    const AUTHOR1 = "Author1";
    const AUTHOR2 = "Author2";
    const REPLIED_AUTHOR = "Replied Author";
    const celebrityId = new mongoose.Types.ObjectId().toString();
    const comment = await nosqlDB.models.CelebrityComment.createTopLevel({
      ...dummyCommentData,
      author: AUTHOR1,
      celebrityId,
      authorId: userId1!,
    });

    expect(comment.author).toBe(AUTHOR1);
    expect(comment.level).toBe(0);
    expect(comment.likes).toBe(0);
    expect(comment.celebrityId.toString()).toBe(celebrityId);
    const reply = await nosqlDB.models.CelebrityComment.createReply({
      ...dummyReplyData,
      celebrityId,
      parentId: comment._id.toString(),
      author: AUTHOR2,
      authorId: userId2!,
      repliedAuthorId: userId1!,
      repliedAuthor: REPLIED_AUTHOR,
    });

    const comments =
      await nosqlDB.models.CelebrityComment.findCommentsWithReplies({
        celebrityId,
        userId: comment.authorId,
      });
    const [firstComment] = comments;
    const [firstReply] = firstComment?.replies ?? [];
    expect(firstComment).toBeDefined();
    expect(firstReply).toBeDefined();

    expect(firstComment?._id.toString()).toBe(comment._id.toString());
    expect(firstComment?.author).toBe(AUTHOR1);
    expect(firstComment?.level).toBe(0);
    expect(firstComment?.likes).toBe(0);
    expect(firstComment?.celebrityId.toString()).toBe(celebrityId);
    expect(firstComment?.isLikedByUser).toBe(false);

    expect(firstReply?._id.toString()).toBe(reply._id.toString());
    expect(firstReply?.parentId?.toString()).toBe(comment._id.toString());
    expect(firstReply?.author).toBe(AUTHOR2);
    expect(firstReply?.repliedAuthor).toBe(REPLIED_AUTHOR);
    expect(firstReply?.repliedAuthorId).toBe(userId1);
    expect(firstReply?.level).toBe(1);
    expect(firstReply?.likes).toBe(0);
    expect(firstReply?.celebrityId.toString()).toBe(celebrityId);
    expect(firstReply?.isLikedByUser).toBe(false);
  });
});
