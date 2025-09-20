import {
  CELEBRITY_COMMENTS_COLLECTION,
  IComment,
} from "../../schema/celebrity-comment";
import { COMMENT_LIKES_COLLECTION } from "../../schema/comment-like";
import CelebrityComment from "../../schema/celebrity-comment";
import { PipelineStage, Types } from "mongoose";

export type FindCommentsWithRepliesOptions = {
  skip?: number;
  limit?: number;
  replySkip?: number;
  replyLimit?: number;
  sortBy?: {
    createdAt?: "asc" | "desc";
    replyCreatedAt?: "asc" | "desc";
  };
};

export type FindCommentsWithRepliesArgs = {
  celebrityId: string;
  userId?: string;
};

export type FindCommentsWithReplies = (
  args: FindCommentsWithRepliesArgs,
  options?: FindCommentsWithRepliesOptions
) => Promise<IComment[]>;

export const findCommentsWithReplies: FindCommentsWithReplies = async (
  { celebrityId, userId },
  options
) => {
  const {
    skip = 0,
    limit = 10,
    replySkip = 0,
    replyLimit = 5,
    sortBy = { createdAt: "desc", replyCreatedAt: "desc" },
  } = options ?? {};

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
            // total=30; 0 + 10 = 10; 10 + 10 =20; 20 + 10=30;
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
};
