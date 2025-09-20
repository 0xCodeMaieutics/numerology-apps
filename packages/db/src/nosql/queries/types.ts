import mongoose from "mongoose";

export type CustomDocument<T> = mongoose.Document<unknown, {}, T, {}, {}> &
  T &
  Required<{ _id: mongoose.Types.ObjectId }>;
