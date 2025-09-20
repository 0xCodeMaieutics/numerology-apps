import mongoose from "mongoose";
import { IBaseMongoDB } from "./schema/celebrity-comment";
import CelebrityComment from "./schema/celebrity-comment";
import CommentLike, { ICommentLike } from "./schema/comment-like";
import connect from "./connect";
import * as CelebrityCommentQueries from "./queries/celebrity-comments";
import { CustomDocument } from "./queries/types";

export type NoSQLDB = {
  connect: () => Promise<typeof mongoose>;
  CelebrityComment: typeof CelebrityComment;
  CommentLike: typeof CommentLike;
  models: {
    CelebrityComment: {
      findCommentsWithReplies: CelebrityCommentQueries.FindCommentsWithReplies;
      findReplies: CelebrityCommentQueries.FindReplies;
      findById: CelebrityCommentQueries.FindById;
      unlikeComment: CelebrityCommentQueries.UnlikeComment;
      likeComment: CelebrityCommentQueries.LikeComment;
      createTopLevel: CelebrityCommentQueries.CreateTopLevel;
      createReply: CelebrityCommentQueries.CreateReply;
      getCommentAndRepliesCount: (celebrityId: string) => Promise<number>;
      getCommentsCount: (celebrityId: string) => Promise<number>;
      findCommentsByCelebrityId: (
        celebrityId: string
      ) => Promise<CustomDocument<IBaseMongoDB>[]>;
      decrementLikes: (data: {
        commentId: string;
        session?: mongoose.ClientSession;
      }) => Promise<CustomDocument<IBaseMongoDB> | null>;
      incrementLikes: (data: {
        commentId: string;
        session?: mongoose.ClientSession;
      }) => Promise<CustomDocument<IBaseMongoDB> | null>;
    };
    CommentLike: {
      findOne: (data: {
        userId: string;
        commentId: string;
      }) => Promise<CustomDocument<ICommentLike> | null>;
    };
  };
};

export const nosqlDB: NoSQLDB = {
  connect,
  CelebrityComment,
  CommentLike,
  models: {
    CelebrityComment: {
      findById: async (id) => {
        await connect();
        return CelebrityCommentQueries.findById(id);
      },
      unlikeComment: async (args) => {
        await connect();
        await CelebrityCommentQueries.unlikeComment(args);
      },
      likeComment: async (args) => {
        await connect();
        await CelebrityCommentQueries.likeComment(args);
      },
      createTopLevel: async (data) => {
        await connect();
        return CelebrityComment.create({
          ...data,
          celebrityId: new mongoose.Types.ObjectId(data.celebrityId as string),
          parentId: null,
          level: 0,
        });
      },
      createReply: async (data) => {
        await connect();
        return CelebrityComment.create({
          ...data,
          celebrityId: new mongoose.Types.ObjectId(data.celebrityId as string),
          parentId: new mongoose.Types.ObjectId(data.parentId as string),
          level: 1,
          likes: 0,
        });
      },
      getCommentAndRepliesCount: async (celebrityId) => {
        await connect();
        return CelebrityComment.countDocuments({
          celebrityId: new mongoose.Types.ObjectId(celebrityId),
        });
      },
      getCommentsCount: async (celebrityId) => {
        await connect();
        return CelebrityComment.countDocuments({
          celebrityId: new mongoose.Types.ObjectId(celebrityId),
          parentId: null,
        });
      },
      findCommentsByCelebrityId: async (celebrityId) => {
        await connect();
        return CelebrityComment.find({
          celebrityId: new mongoose.Types.ObjectId(celebrityId),
        }).sort({ createdAt: -1 });
      },
      findCommentsWithReplies: async (args, options) => {
        await connect();
        return CelebrityCommentQueries.findCommentsWithReplies(args, options);
      },
      decrementLikes: async (data) => {
        await connect();
        return CelebrityComment.findByIdAndUpdate(
          data.commentId,
          { $inc: { likes: -1 } },
          { session: data.session }
        );
      },
      incrementLikes: async (data) => {
        await connect();
        return CelebrityComment.findByIdAndUpdate(
          data.commentId,
          { $inc: { likes: 1 } },
          { session: data.session }
        );
      },
      findReplies: async (args, options) => {
        await connect();
        return CelebrityCommentQueries.findReplies(args, options);
      },
    },
    CommentLike: {
      findOne: async ({ commentId, userId }) => {
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
  IComment,
  ICommentWrite,
  IReplyWrite,
  IReply,
} from "./schema/celebrity-comment";
