import { nosqlDB } from '@workspace/db/nosql';
import type { NextRequest } from 'next/server';

import { API_RESPONSE } from '@/utils/api-responses';

export const GET = async (
    _req: NextRequest,
    ctx: RouteContext<'/api/comments/[celebrityId]'>,
) => {
    const { celebrityId } = await ctx.params;
    try {
        if (!celebrityId) return API_RESPONSE[400]();

        const comments =
            await nosqlDB.models.CelebrityComment.findCommentsWithReplies(
                celebrityId,
            );

        return new Response(JSON.stringify(comments), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error(error);
        return API_RESPONSE[500]();
    }
};
