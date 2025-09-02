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
            all: async () => {
                const mmaPromise = redisClient.get<
                    RedisTypes['celebrities']['category']['response']
                >(keys.celebrities.category(Category.Mma));
                const influencersPromise = redisClient.get<
                    RedisTypes['celebrities']['category']['response']
                >(keys.celebrities.category(Category.Influencers));
                const politicsPromise = redisClient.get<
                    RedisTypes['celebrities']['category']['response']
                >(keys.celebrities.category(Category.Politics));
                const footballPromise = redis.client.get<
                    RedisTypes['celebrities']['category']['response']
                >(keys.celebrities.category(Category.Football));

                const [
                    mma = [],
                    influencers = [],
                    politics = [],
                    football = [],
                ] = await Promise.all([
                    mmaPromise,
                    influencersPromise,
                    politicsPromise,
                    footballPromise,
                ]);
                const allCelebs = [
                    ...(mma ? mma : []),
                    ...(influencers ? influencers : []),
                    ...(politics ? politics : []),
                    ...(football ? football : []),
                ];
                return allCelebs.sort(() => 0.5 - Math.random());
            },
            category: (category: string) => {
                return redisClient.get<
                    RedisTypes['celebrities']['category']['response']
                >(keys.celebrities.category(category));
            },
        },
    },
};
