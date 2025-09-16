#!/usr/bin/env tsx
import mongoose from "mongoose";
import { nosqlDB } from "./nosql";

void (async function connectTest() {
  const params = new URLSearchParams();
  params.append("authSource", "admin"); // defaults to admin anyways
  params.append("replicaSet", "rs0");
  params.append("directConnection", "true");
  params.append("connectTimeoutMS", "3000");
  const dbName = "numerology_dev";
  const url =
    "mongodb://user:pass@127.0.0.1:27017/" + dbName + "?" + params.toString();
  console.log(url);
  await mongoose.connect(url, {
    bufferCommands: false,
  });
  console.log("MongoDB connected");

  await nosqlDB.User.create({
    _id: new mongoose.Types.ObjectId(),
    name: "test",
  });

  await mongoose.connection.close();
})();
