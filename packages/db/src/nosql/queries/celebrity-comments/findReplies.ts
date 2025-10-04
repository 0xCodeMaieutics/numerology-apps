import { Types } from "mongoose";
import { IReply } from "../../schema/celebrity-comment";
import CelebrityComment from "../../schema/celebrity-comment";
import { COMMENT_LIKES_COLLECTION } from "../../schema/comment-like";

export type FindReplies = (
  args: {
    celebrityId: string;
    commentId: string;
    userId?: string;
  },
  options?: {
    skip?: number;
    limit?: number;
    sortBy?: {
      createdAt?: "asc" | "desc";
    };
  }
) => Promise<IReply[]>;

export const findReplies: FindReplies = async (
  { celebrityId, commentId, userId },
  options
) => {
  const {
    skip = 0,
    limit = 10,
    sortBy = { createdAt: "desc" },
  } = options ?? {};

  return CelebrityComment.aggregate([
    {
      $match: {
        celebrityId: new Types.ObjectId(celebrityId),
        parentId: new Types.ObjectId(commentId),
      },
    },
    {
      $sort: {
        createdAt: sortBy.createdAt === "asc" ? 1 : -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
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
    {
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
    },
    {
      $addFields: {
        isLikedByUser: { $gt: [{ $size: "$userLike" }, 0] },
        likesCount: {
          $ifNull: [{ $arrayElemAt: ["$likesCountResult.total", 0] }, 0],
        },
      },
    },
    {
      $project: {
        ...(!userId ? { isLikedByUser: 0 } : {}),
        userLike: 0,
        likesCountResult: 0,
      },
    },
  ]);
};
