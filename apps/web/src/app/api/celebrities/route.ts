import { redis } from '@workspace/db/redis';

import { API_RESPONSE } from '@/utils/api-responses';

export const GET = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        if (!category) return API_RESPONSE[400]();
        const result = await redis.read.celebrities.category(category);
        return new Response(JSON.stringify(result), {
            headers: {
                'Content-Type': 'application/json',
            },
            status: 200,
        });
    } catch (error) {
        return API_RESPONSE[500]();
    }
};
