import mongoose from "mongoose";
import { IBaseMongoDB, IReplyWrite } from "../../schema/celebrity-comment";

export type CreateReply = (
  data: IReplyWrite
) => Promise<
  mongoose.Document<unknown, {}, IBaseMongoDB, {}, {}> &
    IBaseMongoDB &
    Required<{ _id: mongoose.Types.ObjectId }>
>;
