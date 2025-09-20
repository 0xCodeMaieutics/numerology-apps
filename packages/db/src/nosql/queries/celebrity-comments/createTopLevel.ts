import mongoose from "mongoose";
import { IBaseMongoDB, ICommentWrite } from "../../schema/celebrity-comment";

export type CreateTopLevel = (
  data: ICommentWrite
) => Promise<
  mongoose.Document<unknown, {}, IBaseMongoDB, {}, {}> &
    IBaseMongoDB &
    Required<{ _id: mongoose.Types.ObjectId }>
>;
