import { env } from "@/env";
import { RedisTypes } from "@/types/api/redis";
import { Redis } from "@upstash/redis";

const UPSTASH_URL = "https://sensible-llama-52290.upstash.io";
export const redisClient = new Redis({
  url: UPSTASH_URL,
  token: env.UPSTASH_TOKEN,
});

const keys = {
  celebrities: {
    category: (category: string) => `celebrities:${category}`,
  },
};

export const redis = {
  client: redisClient,
  read: {
    celebrities: {
      category: (category: string) => {
        return redisClient.get<
          RedisTypes["celebrities"]["category"]["response"]
        >(keys.celebrities.category(category));
      },
    },
  },
};
