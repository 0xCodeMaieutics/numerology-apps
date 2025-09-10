import { env } from '@/env';
import { RedisTypes } from '@/types/api/redis';
import { Redis } from '@upstash/redis';

const UPSTASH_URL = 'https://sensible-llama-52290.upstash.io';
export const redisClient = new Redis({
    url: UPSTASH_URL,
    token: env.UPSTASH_TOKEN,
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

enum Category {
    Mma = 'mma',
    Influencers = 'influencer',
    Politics = 'politics',
    Football = 'football',
}

export const redis = {
    client: redisClient,
    read: {
        celebrities: {
            category: (category: string) => {
                return redisClient.get<
                    RedisTypes['celebrities']['category']['response']
                >(keys.celebrities.category(category));
            },

            id: (cid: string) => ({
                users: {
                    id: (uid: string) => ({
                        liked: (): Promise<{ liked: boolean }> =>
                            redisClient
                                .get<boolean>(
                                    keys.celebrities.id(cid).users.id(uid)
                                        .liked,
                                )
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
                                liked,
                            ),
                    }),
                },
            }),
        },
    },
};
