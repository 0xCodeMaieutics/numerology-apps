import { IComment, IReply } from "../../schema/celebrity-comment";
import mongoose from "mongoose";
import CelebrityComment from "../../schema/celebrity-comment";

export type FindById = (id: string) => Promise<IComment | IReply | null>;

export const findById: FindById = async (id) =>
  CelebrityComment.findById(new mongoose.Types.ObjectId(id));
