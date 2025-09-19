import { nosqlDB } from '@workspace/db/nosql';
import { NextRequest } from 'next/server';

import { API_RESPONSE } from '@/utils/api-responses';

export const GET = async (
    _req: NextRequest,
    ctx: RouteContext<'/api/comments/[celebrityId]/comments-count'>,
) => {
    try {
        const { celebrityId } = await ctx.params;
        if (!celebrityId) return API_RESPONSE[400]();
        const result =
            await nosqlDB.models.CelebrityComment.getCommentsCount(
                celebrityId,
            );
        return new Response(
            JSON.stringify({
                count: result,
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    } catch (error) {
        return API_RESPONSE[500]();
    }
};
