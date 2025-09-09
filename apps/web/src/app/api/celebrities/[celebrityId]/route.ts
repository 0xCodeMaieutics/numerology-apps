import { sqlDB } from '@workspace/db/sql';
import { NextRequest } from 'next/server';

import { API_RESPONSE } from '@/utils/api-responses';

export const GET = async (
    _req: NextRequest,
    ctx: RouteContext<'/api/celebrities/[celebrityId]'>,
) => {
    try {
        const { celebrityId } = await ctx.params;
        if (!celebrityId) return API_RESPONSE[400]();
        const result = await sqlDB.celebrities.select.id(celebrityId);
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return API_RESPONSE[500]();
    }
};
