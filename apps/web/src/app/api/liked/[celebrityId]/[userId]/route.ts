import { NextRequest } from 'next/server';

import { API_RESPONSE } from '@/utils/api-responses';

import { redis } from '@/lib/redis-client';

export const GET = async (
    _req: NextRequest,
    ctx: RouteContext<'/api/liked/[celebrityId]/[userId]'>,
) => {
    const { celebrityId, userId } = await ctx.params;

    try {
        if (!celebrityId || !userId) return API_RESPONSE[400]();
        const result = await redis.read.celebrities
            .id(celebrityId)
            .users.id(userId)
            .liked();

        return new Response(
            JSON.stringify({
                ...result,
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    } catch (error) {
        console.error('Error in /api/liked route:', error);
        return API_RESPONSE[500]();
    }
};
