import { isDevelopment } from '@/constants';
import { queryKeys } from '@/hooks/queries';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { nosqlDB } from '@workspace/db/nosql';
import { sqlDB } from '@workspace/db/sql';
import { Badge } from '@workspace/ui/components/badge';
import { ChevronLeft } from 'lucide-react';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import Link from 'next/link';

import { CelebrityImage } from '@/components/celebrity-image';
import { CommentSection } from '@/components/comment-section';
import { Infos } from '@/components/infos';

import { auth } from '@/lib/auth';
import { getQueryClient } from '@/lib/react-query';
import { redis } from '@/lib/redis-client';

const REVALIDATE = isDevelopment ? 60 * 10 : 60 * 10; // 10 minutes

const getComments = (celebrityId: string) =>
    unstable_cache(
        async (celebrityId: string) =>
            nosqlDB.models.CelebrityComment.findCommentsWithReplies(
                celebrityId,
                {
                    sortBy: {
                        replyCreatedAt: 'asc',
                    },
                },
            ),
        queryKeys.comments(celebrityId),
        {
            revalidate: REVALIDATE,
            tags: [queryKeys.comments(celebrityId).join('/')],
        },
    );

const getCommentsCount = (celebrityId: string) =>
    unstable_cache(
        (celebrityId: string) =>
            nosqlDB.models.CelebrityComment.getCommentAndRepliesCount(
                celebrityId,
            ),
        queryKeys.celebrity(celebrityId).commentsCount,
        {
            revalidate: REVALIDATE,
            tags: [queryKeys.comments(celebrityId).join('/')],
        },
    );

const BackLink = () => (
    <Link href="/" className="flex items-center gap-1.5">
        <ChevronLeft />
        <span className="font-semibold">Back</span>
    </Link>
);

const CategoryBadges = (props: { categories: string[] }) => (
    <div className="flex flex-wrap gap-1.5 items-center">
        {props.categories.map((category, i) => (
            <Badge key={i}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
        ))}
    </div>
);

const Bio = (props: { bio: string | null }) => (
    <div className="flex flex-col gap-2">
        <span className="font-semibold text-muted-foreground">BIO</span>
        <span>{props?.bio}</span>
    </div>
);

export default async function CelebrityPage({
    params,
}: {
    params: Promise<{ celebrityId: string }>;
}) {
    const { celebrityId } = await params;
    const queryClient = getQueryClient();

    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const celebProfile = await sqlDB.celebrities.select.id(celebrityId);

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: queryKeys.comments(celebrityId),
            queryFn: () => getComments(celebrityId)(celebrityId),
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.liked(celebrityId, session?.user?.id),
            queryFn: async () => ({
                liked: session?.user
                    ? ((await redis.read.celebrities
                          .id(celebrityId)
                          .users.id(session.user.id)
                          .liked()) ?? false)
                    : false,
            }),
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.celebrity(celebrityId).default,
            queryFn: () => celebProfile,
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.celebrity(celebrityId).commentsCount,
            queryFn: () => getCommentsCount(celebrityId)(celebrityId),
        }),
    ]);
    if (!celebProfile) return <div>Profile not found</div>;

    return (
        <div className="w-full max-w-3xl mx-auto space-y-4">
            <BackLink />

            <div className="space-y-10">
                <div className="flex gap-4">
                    <CelebrityImage celebProfile={celebProfile} />
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex justify-between">
                            <span className="font-semibold text-lg sm:text-2xl">
                                {celebProfile?.name}
                            </span>
                        </div>
                        {celebProfile.categories &&
                        celebProfile.categories.length > 0 ? (
                            <CategoryBadges
                                categories={celebProfile.categories}
                            />
                        ) : null}

                        <Infos celebProfile={celebProfile} />
                    </div>
                </div>
                <Bio bio={celebProfile?.bio} />
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <CommentSection celebProfile={celebProfile} />
                </HydrationBoundary>
            </div>
        </div>
    );
}
