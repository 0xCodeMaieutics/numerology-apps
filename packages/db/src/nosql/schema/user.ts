import mongoose, { Model, Types } from "mongoose";

export interface User {
  _id: Types.ObjectId;
}

const COLLECTION_NAME = "users";

const UserSchema = new mongoose.Schema<User>(
  {},
  {
    collection: COLLECTION_NAME,
    timestamps: false,
  }
);

const model =
  (mongoose.models.User as Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default model;
