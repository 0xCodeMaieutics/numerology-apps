import CommentLike from "../../schema/comment-like";
import CelebrityComment from "../../schema/celebrity-comment";

export type UnlikeComment = (data: {
  userId: string;
  commentId: string;
}) => Promise<void>;
export const unlikeComment: UnlikeComment = async ({ commentId, userId }) => {
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
};
