import { isDevelopment } from '@/constants';
import { queryKeys } from '@/hooks/queries';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { nosqlDB } from '@workspace/db/nosql';
import { redis } from '@workspace/db/redis';
import { sqlDB } from '@workspace/db/sql';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import { Suspense } from 'react';

import { auth } from '@/lib/auth';
import { getQueryClient } from '@/lib/react-query';

import { ClientContent } from './_/client-content';

const REVALIDATE = isDevelopment ? 1 : 60 * 10;

const getComments = ({
    celebrityId,
    userId,
}: {
    celebrityId: string;
    userId?: string;
}) =>
    unstable_cache(
        async ({
            celebrityId,
            userId,
        }: {
            celebrityId: string;
            userId?: string;
        }) =>
            nosqlDB.models.CelebrityComment.findCommentsWithReplies(
                {
                    userId,
                    celebrityId,
                },
                {
                    sortBy: {
                        replyCreatedAt: 'asc',
                    },
                },
            ),
        queryKeys.comments({
            celebrityId,
            userId: userId ?? 'user-not-logged-in',
        }),
        {
            revalidate: REVALIDATE,
            tags: [
                queryKeys
                    .comments({
                        celebrityId,
                        userId: userId ?? 'user-not-logged-in',
                    })
                    .join('/'),
            ],
        },
    );

const getCommentsCount = ({
    celebrityId,
    userId,
}: {
    celebrityId: string;
    userId?: string;
}) =>
    unstable_cache(
        (celebrityId: string) =>
            nosqlDB.models.CelebrityComment.getCommentAndRepliesCount(
                celebrityId,
            ),
        queryKeys.celebrity(celebrityId).commentsCount,
        {
            revalidate: REVALIDATE,
            tags: [
                queryKeys
                    .comments({
                        celebrityId,
                        userId,
                    })
                    .join('/'),
            ],
        },
    );

export default async function CelebrityPage({
    params,
}: {
    params: Promise<{ celebrityId: string }>;
}) {
    const { celebrityId } = await params;
    if (!celebrityId) return <div>Profile not found</div>;
    const queryClient = getQueryClient();

    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const celebProfile = await sqlDB.celebrities.select.id(celebrityId);
    if (!celebProfile) return <div>Profile not found</div>;

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: queryKeys.auth(session?.user?.id ?? 'user-not-logged-in')
                .session,
            queryFn: () => session,
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.comments({
                celebrityId,
                userId: session?.user?.id,
            }),
            queryFn: () =>
                getComments({
                    celebrityId,
                    userId: session?.user?.id,
                })({
                    celebrityId,
                    userId: session?.user?.id,
                }),
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys
                .celebrity(celebrityId)
                .users(session?.user?.id)
                .liked(),
            queryFn: async () => {
                if (!session?.user) {
                    return { liked: false };
                }
                return redis.read.celebrities
                    .id(celebrityId)
                    .users.id(session?.user?.id)
                    .liked();
            },
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.celebrity(celebrityId).default,
            queryFn: () => celebProfile,
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.celebrity(celebrityId).commentsCount,
            queryFn: () =>
                getCommentsCount({
                    celebrityId,
                    userId: session?.user?.id,
                })(celebrityId),
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<div>Loading profile...</div>}>
                <ClientContent celebProfile={celebProfile} />
            </Suspense>
        </HydrationBoundary>
    );
}
