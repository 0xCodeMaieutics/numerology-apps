import { isDevelopment } from '@/constants';
import { queryKeys } from '@/hooks/queries';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { nosqlDB } from '@workspace/db/nosql';
import { redis } from '@workspace/db/redis';
import { sqlDB } from '@workspace/db/sql';
import { Badge } from '@workspace/ui/components/badge';
import { ChevronLeft } from 'lucide-react';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Suspense } from 'react';

import { CelebrityImage } from '@/components/celebrity-image';
import { CommentSection } from '@/components/comment-section';
import { Infos } from '@/components/infos';

import { auth } from '@/lib/auth';
import { getQueryClient } from '@/lib/react-query';

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
                    <Suspense>
                        <CommentSection
                            celebrityId={celebrityId}
                            userId={session?.user.id}
                        />
                    </Suspense>
                </HydrationBoundary>
            </div>
        </div>
    );
}

// test
// test 2