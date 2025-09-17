import mongoose, { Model, Types } from "mongoose";

export interface ICelebrityCommentBase {
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
  repliedAuthor?: string;
  repliedAuthorId?: string; // user id stored in sql user table
  __v?: number;
}

export type ICelebrityCommentBaseWithoutObjectId = Omit<
  ICelebrityCommentBase,
  "_id" | "celebrityId" | "parentId"
> & {
  _id: string;
  celebrityId: string;
  parentId?: string;
};

export interface ICelebrityCommentWithoutObjectId
  extends ICelebrityCommentBaseWithoutObjectId {
  replies: ICelebrityCommentBaseWithoutObjectId[];
  replyCount?: number;
  hasMoreReplies?: boolean;
}

export interface ICelebrityComment extends ICelebrityCommentBase {
  replies: ICelebrityCommentBase[];
}

export interface ICelebrityCommentWrite {
  celebrityId: string | Types.ObjectId;
  parentId?: string | Types.ObjectId | null; // For replies
  author: string;
  authorId: string;
  comment: string;
  likes?: number;
  level?: number; // Will be calculated automatically
}

export interface ICelebrityReplyWrite {
  parentId: string | Types.ObjectId; // Required for replies
  celebrityId: string | Types.ObjectId;
  author: string;
  authorId: string;
  comment: string;
  repliedAuthor: string;
  repliedAuthorId: string;
  likes?: number;
}

export const CELEBRITY_COMMENTS_COLLECTION = "celebrity_comments";

const CelebrityCommentSchema = new mongoose.Schema<ICelebrityComment>(
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
  (mongoose.models.CelebrityComment as Model<ICelebrityComment>) ||
  mongoose.model<ICelebrityComment>("CelebrityComment", CelebrityCommentSchema);

export default model;
