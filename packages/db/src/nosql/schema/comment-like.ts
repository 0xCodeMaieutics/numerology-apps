import mongoose, { Model, Types } from "mongoose";

export interface ICommentLike {
  _id: Types.ObjectId;
  userId: string;
  commentId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const COLLECTION_NAME = "comment_likes";

const CommentLikeSchema = new mongoose.Schema<ICommentLike>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CelebrityComment",
      required: true,
      index: true,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

const model =
  (mongoose.models.CommentLike as Model<ICommentLike>) ||
  mongoose.model<ICommentLike>("CommentLike", CommentLikeSchema);

export default model;
