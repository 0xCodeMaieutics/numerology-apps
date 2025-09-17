import mongoose, { PipelineStage, Types } from "mongoose";
import {
  CELEBRITY_COMMENTS_COLLECTION,
  ICelebrityComment,
  ICelebrityCommentWithoutObjectId,
  ICelebrityCommentWrite,
  ICelebrityReplyWrite,
} from "./schema/celebrity-comment";
import CelebrityComment from "./schema/celebrity-comment";
import CommentLike, { COMMENT_LIKES_COLLECTION } from "./schema/comment-like";
import connect from "./connect";

export type NoSQLQueries = {
  CelebrityComment: {
    create: mongoose.Document<unknown, {}, ICelebrityComment, {}, {}> &
      ICelebrityCommentWithoutObjectId & {
        _id: mongoose.Types.ObjectId;
      };
    findByCelebrityId: (mongoose.Document<
      unknown,
      {},
      ICelebrityCommentWithoutObjectId,
      {},
      {}
    > &
      ICelebrityCommentWithoutObjectId)[];
  };
};

export const nosqlDB = {
  connect,
  CelebrityComment,
  CommentLike,
  models: {
    CelebrityComment: {
      findById: async (id: string) => {
        await connect();
        return CelebrityComment.findById(new mongoose.Types.ObjectId(id));
      },

      unlikeComment: async ({
        commentId,
        userId,
      }: {
        commentId: string;
        userId: string;
      }) => {
        await connect();
        const session = await mongoose.startSession();

        await session.withTransaction(async () => {
          const existingLike = await CommentLike.findOne({
            userId,
            commentId: new mongoose.Types.ObjectId(commentId),
          }).session(session);

          if (!existingLike)
            throw new Error("Comment not liked by user, cannot unlike");

          await CelebrityComment.findByIdAndUpdate(
            commentId,
            { $inc: { likes: -1 } },
            { session: session }
          );

          await CommentLike.deleteOne(
            {
              userId,
              commentId: commentId,
            },
            { session: session }
          );
        });
      },
      likeComment: async ({
        commentId,
        userId,
      }: {
        commentId: string;
        userId: string;
      }) => {
        await connect();
        const session = await mongoose.startSession();

        await session.withTransaction(async () => {
          const existingLike = await CommentLike.findOne({
            userId,
            commentId: new mongoose.Types.ObjectId(commentId),
          }).session(session);

          if (existingLike) throw new Error("Comment already liked by user");

          await CelebrityComment.findByIdAndUpdate(
            commentId,
            { $inc: { likes: 1 } },
            { session: session }
          );

          await CommentLike.insertOne(
            {
              userId,
              commentId: commentId,
            },
            {
              session: session,
            }
          );
        });
      },
      createTopLevel: async (data: ICelebrityCommentWrite) => {
        await connect();
        return CelebrityComment.create({
          ...data,
          celebrityId: new mongoose.Types.ObjectId(data.celebrityId as string),
          parentId: null,
          level: 0,
        });
      },
      createReply: async (data: ICelebrityReplyWrite) => {
        await connect();
        return CelebrityComment.create({
          ...data,
          celebrityId: new mongoose.Types.ObjectId(data.celebrityId as string),
          parentId: new mongoose.Types.ObjectId(data.parentId as string),
          level: 1,
        });
      },
      getCommentAndRepliesCount: async (celebrityId: string) => {
        await connect();
        return CelebrityComment.countDocuments({
          celebrityId: new mongoose.Types.ObjectId(celebrityId),
        });
      },
      findCommentsByCelebrityId: async (celebrityId: string) => {
        await connect();
        return CelebrityComment.find({
          celebrityId: new mongoose.Types.ObjectId(celebrityId),
        }).sort({ createdAt: -1 });
      },
      findCommentsWithReplies: async (
        { celebrityId, userId }: { celebrityId: string; userId?: string },
        options: {
          skip?: number;
          limit?: number;
          replySkip?: number;
          replyLimit?: number;
          sortBy?: {
            createdAt?: "asc" | "desc";
            replyCreatedAt?: "asc" | "desc";
          };
        } = {}
      ): Promise<ICelebrityCommentWithoutObjectId[]> => {
        await connect();
        const {
          skip = 0,
          limit = 10,
          replySkip = 0,
          replyLimit = 5,
          sortBy = { createdAt: "desc", replyCreatedAt: "desc" },
        } = options;

        const replyPipeline: any[] = [
          {
            $match: {
              $expr: { $eq: ["$parentId", "$$commentId"] },
            },
          },
          {
            $sort: {
              createdAt: sortBy.replyCreatedAt === "asc" ? 1 : -1,
            },
          },
          { $skip: replySkip },
          { $limit: replyLimit },

          {
            $lookup: {
              from: COMMENT_LIKES_COLLECTION,
              let: { replyId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$commentId", "$$replyId"] },
                  },
                },
                { $count: "total" },
              ],
              as: "likesCountResult",
            },
          },
        ];

        if (userId)
          replyPipeline.push({
            $lookup: {
              from: COMMENT_LIKES_COLLECTION,
              let: { replyId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$commentId", "$$replyId"] },
                        { $eq: ["$userId", userId] },
                      ],
                    },
                  },
                },
              ],
              as: "userLike",
            },
          });

        replyPipeline.push(
          {
            $addFields: {
              ...(userId
                ? { isLikedByUser: { $gt: [{ $size: "$userLike" }, 0] } }
                : {}),
              likesCount: {
                $ifNull: [{ $arrayElemAt: ["$likesCountResult.total", 0] }, 0],
              },
            },
          },
          {
            $project: {
              ...(userId ? { userLike: 0 } : {}),
              likesCountResult: 0,
              repliedToUserInfo: 0,
            },
          }
        );

        const pipeline: PipelineStage[] = [
          {
            $match: {
              celebrityId: new Types.ObjectId(celebrityId),
              parentId: null,
            },
          },
          { $sort: { createdAt: sortBy.createdAt === "asc" ? 1 : -1 } },
          { $skip: skip },
          { $limit: limit },
        ];

        if (userId)
          pipeline.push({
            $lookup: {
              from: COMMENT_LIKES_COLLECTION,
              let: { commentId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$commentId", "$$commentId"] },
                        { $eq: ["$userId", userId] },
                      ],
                    },
                  },
                },
              ],
              as: "userLike",
            },
          });

        pipeline.push(
          {
            $lookup: {
              from: COMMENT_LIKES_COLLECTION,
              let: { commentId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$commentId", "$$commentId"] },
                  },
                },
                { $count: "total" },
              ],
              as: "likesCountResult",
            },
          },
          {
            $lookup: {
              from: CELEBRITY_COMMENTS_COLLECTION,
              let: { commentId: "$_id" },
              pipeline: replyPipeline,
              as: "replies",
            },
          },
          {
            $lookup: {
              from: CELEBRITY_COMMENTS_COLLECTION,
              let: { commentId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$parentId", "$$commentId"] },
                  },
                },
                { $count: "total" },
              ],
              as: "replyCountResult",
            },
          },
          {
            $addFields: {
              ...(userId
                ? { isLikedByUser: { $gt: [{ $size: "$userLike" }, 0] } }
                : {}),
              likesCount: {
                $ifNull: [
                  { $arrayElemAt: ["$likesCountResult.total", 0] }, // likesCountResult => [{ total: number }]
                  0,
                ],
              },
              replyCount: {
                $ifNull: [
                  { $arrayElemAt: ["$replyCountResult.total", 0] }, // replyCountResult => [{ total: number }]
                  0,
                ],
              },
              hasMoreReplies: {
                $gt: [
                  {
                    $ifNull: [
                      { $arrayElemAt: ["$replyCountResult.total", 0] }, // replyCountResult => [{ total: number }]
                      0,
                    ],
                  },
                  { $add: [replySkip, replyLimit] },
                ],
              },
            },
          },
          {
            $project: {
              userLike: 0,
              likesCountResult: 0,
              replyCountResult: 0,
            },
          }
        );

        return (await CelebrityComment.aggregate(pipeline)).map((doc) => ({
          ...doc,
          _id: doc._id.toString(),
          celebrityId: doc.celebrityId.toString(),
          parentId: doc.parentId ? doc.parentId.toString() : null,
          replies: doc.replies.map((reply: any) => ({
            ...reply,
            _id: reply._id.toString(),
            celebrityId: reply.celebrityId.toString(),
            parentId: reply.parentId ? reply.parentId.toString() : null,
          })),
        }));
      },
      decrementLikes: async (data: {
        commentId: string;
        session?: mongoose.ClientSession;
      }) => {
        await connect();
        return CelebrityComment.findByIdAndUpdate(
          data.commentId,
          { $inc: { likes: -1 } },
          { session: data.session }
        );
      },
      incrementLikes: async (data: {
        commentId: string;
        session?: mongoose.ClientSession;
      }) => {
        await connect();
        return CelebrityComment.findByIdAndUpdate(
          data.commentId,
          { $inc: { likes: 1 } },
          { session: data.session }
        );
      },
    },
    CommentLike: {
      findOne: async ({
        commentId,
        userId,
      }: {
        userId: string;
        commentId: string;
      }) => {
        await connect();
        return CommentLike.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          commentId: new mongoose.Types.ObjectId(commentId),
        });
      },
    },
  },
};

export type {
  ICelebrityComment,
  ICelebrityCommentWrite,
  ICelebrityReplyWrite,
  ICelebrityCommentWithoutObjectId,
  ICelebrityCommentBaseWithoutObjectId,
} from "./schema/celebrity-comment";
