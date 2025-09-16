import { Redis } from "@upstash/redis";
import { RedisTypes } from "./types";

if (!process.env.UPSTASH_URL || !process.env.UPSTASH_TOKEN)
  console.log("Missing UPSTASH_URL or UPSTASH_TOKEN environment variables");

export const redisClient = new Redis({
  url: process.env.UPSTASH_URL,
  token: process.env.UPSTASH_TOKEN,
});

const keys = {
  celebrities: {
    category: (category: string) => `celebrities:${category}`,
    id: (id: string) => ({
      default: `celebrities:${id}`,
      users: {
        id: (uid: string) => ({
          liked: `celebrities:${id}:users:${uid}:liked`,
        }),
      },
    }),
  },
};

export const redis = {
  client: redisClient,
  read: {
    celebrities: {
      category: (category: string) => {
        return (
          redisClient.get<RedisTypes["celebrities"]["category"]["response"]>(
            keys.celebrities.category(category)
          ) ?? []
        );
      },

      id: (cid: string) => ({
        users: {
          id: (uid: string) => ({
            liked: (): Promise<{ liked: boolean }> =>
              redisClient
                .get<boolean>(keys.celebrities.id(cid).users.id(uid).liked)
                .then((res) => ({
                  liked: res ?? false,
                })),
          }),
        },
      }),
    },
  },

  write: {
    celebrities: {
      id: (cid: string) => ({
        users: {
          id: (uid: string) => ({
            liked: (liked: boolean) =>
              redisClient.set(
                keys.celebrities.id(cid).users.id(uid).liked,
                liked
              ),
          }),
        },
      }),
    },
  },
};
