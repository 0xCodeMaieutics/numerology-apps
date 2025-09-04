'use server';

import { db } from '@workspace/db';

import { redis } from '@/lib/redis-client';

export const likeCelebrity = async ({
    celebrityId,
    prevLikes,
    userId,
    oldLiked,
}: {
    celebrityId: string;
    prevLikes: number;
    userId: string;
    oldLiked: boolean;
}) => {
    'use server';
    await Promise.all([
        db.celebrities.update.like({
            celebrityId,
            totalLikes: oldLiked ? prevLikes - 1 : prevLikes + 1,
        }),
        redis.write.celebrities
            .id(celebrityId)
            .users.id(userId)
            .liked(!oldLiked),
    ]);
};
