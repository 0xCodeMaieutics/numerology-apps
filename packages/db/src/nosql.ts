import connect from "./nosql/connect";
import mongoose, { Types } from "mongoose";
import CelebrityComment, {
  ICelebrityComment,
  ICelebrityCommentWrite,
  ICelebrityReplyWrite,
} from "./nosql/schema/celebrity-comment";

export type NoSQLQueries = {
  CelebrityComment: {
    create: mongoose.Document<unknown, {}, ICelebrityComment, {}, {}> &
      ICelebrityComment & {
        _id: mongoose.Types.ObjectId;
      };
    findByCelebrityId: (mongoose.Document<
      unknown,
      {},
      ICelebrityComment,
      {},
      {}
    > &
      ICelebrityComment & {
        _id: mongoose.Types.ObjectId;
      })[];
  };
};

export const nosqlDB = {
  connect,
  CelebrityComment,
  models: {
    CelebrityComment: {
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
      findByCelebrityId: async (celebrityId: string) => {
        await connect();
        return CelebrityComment.find({
          celebrityId: new mongoose.Types.ObjectId(celebrityId),
        }).sort({ createdAt: -1 });
      },
      findCommentsWithReplies: async (
        celebrityId: string,
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
      ) => {
        await connect();
        const {
          skip = 0,
          limit = 10,
          replySkip = 0,
          replyLimit = 5,
          sortBy = { createdAt: "desc", replyCreatedAt: "desc" },
        } = options;

        return (
          await CelebrityComment.aggregate([
            {
              $match: {
                celebrityId: new Types.ObjectId(celebrityId),
                parentId: null,
              },
            },
            { $sort: { createdAt: sortBy.createdAt === "asc" ? 1 : -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "celebrity_comments",
                let: { commentId: "$_id" },
                pipeline: [
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
                ],
                as: "replies",
              },
            },
            {
              $lookup: {
                from: "celebrity_comments",
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
                replyCount: {
                  $ifNull: [
                    { $arrayElemAt: ["$replyCountResult.total", 0] },
                    0,
                  ],
                },
                hasMoreReplies: {
                  $gt: [
                    {
                      $ifNull: [
                        { $arrayElemAt: ["$replyCountResult.total", 0] },
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
                replyCountResult: 0,
              },
            },
          ])
        ).map((doc) => ({
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
    },
  },
};

export type {
  ICelebrityComment,
  ICelebrityCommentWrite,
  ICelebrityReplyWrite,
  ICelebrityCommentBase,
} from "./nosql/schema/celebrity-comment";
