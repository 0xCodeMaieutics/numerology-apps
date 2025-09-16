import fs from "fs";
import "dotenv/config";
import { redis } from "./redis";
import mongoose from "mongoose";
import { sqlDB, SQLDBQueries } from "./sql";
import { celebritiesTable } from "./sql/schema/celebrities";
// @ts-ignore
import { numerology } from "@workspace/utils";

const seed: Array<{
  id: string;
  name: string;
  day: number;
  month: number;
  year: number;
  date_of_birth: string;
  place_of_birth: string;
  nationality: string;
  image_url: string;
  bio: string;
}> = JSON.parse(fs.readFileSync("./src/seed.json", "utf-8"));

mongoose.connect(process.env.MONGO_DB_CONNECTION || "");
void (async function () {
  await redis.client.set("celebrities:stories", JSON.stringify(seed));
  await sqlDB.client
    .insert(celebritiesTable)
    .values(
      seed.map(
        (celebRedis) =>
          ({
            id: celebRedis.id,
            name: celebRedis.name,
            birthDay: celebRedis.day,
            birthMonth: celebRedis.month,
            birthYear: celebRedis.year,
            dateOfBirth: celebRedis.date_of_birth,
            placeOfBirth: celebRedis.place_of_birth,
            nationality: celebRedis.nationality,
            imageUrl: celebRedis.image_url,
            bio: celebRedis.bio,
            categories: ["influencer"],
            lifePath: numerology.calculateLifePath(
              celebRedis.day.toString(),
              celebRedis.month.toString(),
              celebRedis.year.toString()
            ),
          }) as SQLDBQueries["insert"]["celebrities"]
      )
    )
    .onConflictDoNothing();
  await sqlDB.client.$client.end();
})();
