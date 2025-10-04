import mongoose, { Model, Types } from "mongoose";

export interface IBaseMongoDB {
  _id: Types.ObjectId;
  celebrityId: Types.ObjectId;
  parentId?: Types.ObjectId;
  author: string;
  authorId: string;
  comment: string;
  likes: number;
  level: number; // 0 for top-level, 1 for first reply, 2 for nested reply, etc.
  isLikedByUser?: boolean;
  likesCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

export type IReplyMongoDB = {
  repliedAuthor?: string;
  repliedAuthorId?: string;
};

type IBase = Omit<IBaseMongoDB, "_id" | "celebrityId" | "parentId"> & {
  _id: string;
  celebrityId: string;
  parentId?: string;
};

export type IReply = IBase &
  IReplyMongoDB & {
    level: 1;
  };

export type IComment = IBase & {
  level: 0;
  hasMoreReplies?: boolean;
  replies?: IReply[];
  replyCount?: number;
};

export type ICommentWrite = Partial<IBase>;
export type IReplyWrite = Partial<IBase> & IReplyMongoDB;

export const CELEBRITY_COMMENTS_COLLECTION = "celebrity_comments";

const CelebrityCommentSchema = new mongoose.Schema<
  IBaseMongoDB & IReplyMongoDB
>(
  {
    celebrityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CelebrityComment",
      default: null,
      index: true,
    },
    author: { type: String, required: true },
    authorId: { type: String, required: true }, // user id that's stored in sql user table
    comment: { type: String, required: true },
    likes: { type: Number, required: true, default: 0 },
    level: { type: Number, required: true, default: 0 },
    repliedAuthor: {
      type: String,
      required: false,
    },
    repliedAuthorId: {
      type: String,
      required: false,
    },
  },
  {
    collection: CELEBRITY_COMMENTS_COLLECTION,
    timestamps: true,
  }
);

const model =
  (mongoose.models.CelebrityComment as Model<IBaseMongoDB>) ||
  mongoose.model<IBaseMongoDB>("CelebrityComment", CelebrityCommentSchema);

export default model;
