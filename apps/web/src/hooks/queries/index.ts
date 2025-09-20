import { frontendDomain } from '@/constants';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { IComment, IReply } from '@workspace/db/nosql';
import { SQLDBQueries } from '@workspace/db/sql';
import 'better-auth';

import { commentServerAction } from '@/utils/server-actions/comment';
import { likeCommentServerAction } from '@/utils/server-actions/like-comment';
import { likeCelebrity } from '@/utils/server-actions/liked-celebrity';
import { replyServerAction } from '@/utils/server-actions/reply';
import { unlikeCommentServerAction } from '@/utils/server-actions/unlike-comment';

import { authClient } from '@/lib/auth-client';
import { useCelebrityProps } from '@/lib/context/celebrity-props';

export const queryKeys = {
    comments: ({
        celebrityId,
        userId,
    }: {
        celebrityId: string;
        userId?: string;
    }) => ['comments', celebrityId, userId ?? 'user-not-logged-in'],
    commentsCount: (celebrityId: string) => ['comments', celebrityId, 'count'],
    auth: (userId?: string) => ({
        session: ['auth', 'session', userId ?? 'user-not-logged-in'],
    }),
    celebrity: (celebrityId: string) => ({
        default: ['celebrity', celebrityId],
        commentsCount: ['celebrity', celebrityId, 'commentsCount'],
        users: (userId?: string) => ({
            liked: () => [
                'celebrity',
                celebrityId,
                'users',
                userId ?? 'user-not-logged-in',
                'liked',
            ],
        }),
    }),
};

type MutationEvents = {
    onSuccess?: () => void;
    onError?: () => void;
    onMutate?: () => void;
};

export const queryHooks = {
    query: {
        comments: {
            useCount: () => {
                const { celebProfile } = useCelebrityProps();
                return useQuery<unknown, Error, number>({
                    queryKey: queryKeys.commentsCount(celebProfile.id),
                    queryFn: () =>
                        fetch(
                            `${frontendDomain}/api/comments/${celebProfile.id}/comments-count`,
                        ).then((res) =>
                            res.json().then((data) => data.count as number),
                        ),
                });
            },
        },
    },
    suspense: {
        useAuthSession: (userId?: string) =>
            useSuspenseQuery<
                unknown,
                Error,
                typeof authClient.$Infer.Session | null
            >({
                queryKey: queryKeys.auth(userId).session,

                queryFn: () =>
                    authClient.getSession().then((res) => {
                        if (res.error) throw new Error(res.error.message);
                        return res.data;
                    }),
            }),
        useComments: (options?: {
            skip?: number;
            limit?: number;
            replySkip?: number;
            replyLimit?: number;
            sortBy?: {
                createdAt?: 'asc' | 'desc';
                replyCreatedAt?: 'asc' | 'desc';
            };
        }) => {
            const {
                skip = 0,
                limit = 10,
                replySkip = 0,
                replyLimit = 3,
                sortBy = { createdAt: 'asc', replyCreatedAt: 'asc' },
            } = options ?? {};
            const session = queryHooks.suspense.useAuthSession();
            const { celebProfile } = useCelebrityProps();
            const userId = session?.data?.user?.id;
            const celebrityId = celebProfile.id;
            return useSuspenseQuery<unknown, Error, IComment[]>({
                queryKey: queryKeys.comments({
                    celebrityId,
                    userId,
                }),
                queryFn: () => {
                    const searchParams = new URLSearchParams();
                    userId && searchParams.set('userId', userId);
                    searchParams.set('sortBy', sortBy.createdAt || 'asc');
                    searchParams.set(
                        'replySortBy',
                        sortBy.replyCreatedAt || 'asc',
                    );
                    searchParams.set('skip', String(skip));
                    searchParams.set('limit', String(limit));
                    searchParams.set('replySkip', String(replySkip));
                    searchParams.set('replyLimit', String(replyLimit));
                    const baseUrl = `${frontendDomain}/api/comments/${celebrityId}`;
                    return fetch(
                        searchParams.size > 0
                            ? `${baseUrl}?${searchParams.toString()}`
                            : baseUrl,
                    ).then((res) => res.json());
                },
            });
        },
        useLiked: ({
            celebrityId,
            userId,
        }: {
            celebrityId: string;
            userId?: string;
        }) =>
            useSuspenseQuery<unknown, Error, { liked: boolean }>({
                queryKey: queryKeys
                    .celebrity(celebrityId)
                    .users(userId)
                    .liked(),
                queryFn: () =>
                    fetch(
                        `${frontendDomain}/api/liked/${celebrityId}/${userId}`,
                    ).then((res) => res.json() as Promise<{ liked: boolean }>),
            }),

        useCelebrity: (celebrityId: string) =>
            useSuspenseQuery<
                unknown,
                Error,
                SQLDBQueries['select']['celebrities']
            >({
                queryKey: queryKeys.celebrity(celebrityId).default,
                queryFn: () =>
                    fetch(
                        `${frontendDomain}/api/celebrity/${celebrityId}`,
                    ).then(
                        (res) =>
                            res.json() as Promise<
                                SQLDBQueries['select']['celebrities']
                            >,
                    ),
            }),

        useCelebrityCommentsCount: (celebrityId: string) =>
            useSuspenseQuery<unknown, Error, number>({
                queryKey: queryKeys.celebrity(celebrityId).commentsCount,
                queryFn: () =>
                    fetch(
                        `${frontendDomain}/api/celebrity/${celebrityId}/comments/total-count`,
                    ).then((res) =>
                        res.json().then((data) => data.count as number),
                    ),
            }),
    },
    mutation: {
        celebrity: {
            useLikeCelebrity: (args?: MutationEvents) => {
                const session = queryHooks.suspense.useAuthSession();
                const { celebProfile } = useCelebrityProps();
                return useMutation<
                    unknown,
                    Error,
                    { liked: boolean; prevLikes: number }
                >({
                    mutationFn: ({ liked, prevLikes }) => {
                        if (!session?.data?.user.id)
                            throw new Error('User not logged in');
                        return likeCelebrity({
                            celebrityId: celebProfile.id,
                            prevLikes,
                            oldLiked: liked,
                            userId: session?.data?.user.id,
                        });
                    },
                    ...args,
                });
            },
            useLikeComment: (args?: {
                onSuccess?: () => void;
                onError?: () => void;
            }) => {
                const session = queryHooks.suspense.useAuthSession();
                return useMutation<unknown, Error, string>({
                    mutationFn: (commentId) => {
                        if (!session?.data?.user.id)
                            throw new Error('User not logged in');
                        return likeCommentServerAction({
                            commentId,
                            userId: session?.data?.user.id,
                        });
                    },
                    onSuccess: args?.onSuccess,
                    onError: args?.onError,
                });
            },

            useUnlikeComment: (args?: MutationEvents) => {
                const session = queryHooks.suspense.useAuthSession();
                return useMutation<unknown, Error, string>({
                    mutationFn: (commentId) => {
                        if (!session?.data?.user.id)
                            throw new Error('User not logged in');
                        return unlikeCommentServerAction({
                            commentId,
                            userId: session?.data?.user.id,
                        });
                    },
                    ...args,
                });
            },
        },
        comments: {
            useReplyComment: (
                args?: Omit<MutationEvents, 'onSuccess'> & {
                    onSuccess?: (args: {
                        replyTextarea: React.RefObject<HTMLTextAreaElement | null>;
                    }) => void;
                },
            ) => {
                const session = queryHooks.suspense.useAuthSession();
                const { celebProfile } = useCelebrityProps();
                return useMutation<
                    {
                        replyTextarea: React.RefObject<HTMLTextAreaElement | null>;
                    },
                    Error,
                    {
                        comment: string;
                        parentId: string;
                        repliedComment: IReply | IComment;
                        replyTextarea: React.RefObject<HTMLTextAreaElement | null>;
                    }
                >({
                    mutationFn: async ({
                        comment,
                        parentId,
                        repliedComment,
                        replyTextarea,
                    }) => {
                        if (!session?.data?.user.id)
                            throw new Error('User not logged in');
                        await replyServerAction({
                            author: session?.data?.user.name || 'Anonymous',
                            parentId,
                            authorId: session?.data?.user.id,
                            celebrityId: celebProfile.id,
                            comment,
                            repliedAuthor: repliedComment.author,
                            repliedAuthorId: repliedComment.authorId,
                        });
                        return { replyTextarea };
                    },
                    ...args,
                });
            },

            useComment: (args?: MutationEvents) => {
                const session = queryHooks.suspense.useAuthSession();
                const { celebProfile } = useCelebrityProps();
                return useMutation<unknown, Error, string>({
                    mutationFn: (comment) => {
                        if (!session?.data?.user.id)
                            throw new Error('User not logged in');
                        return commentServerAction({
                            author: session?.data?.user.name || 'Anonymous',
                            authorId: session?.data?.user.id,
                            celebrityId: celebProfile.id,
                            comment: comment ?? '',
                            likes: 0,
                            level: 0,
                            userId: session?.data?.user.id,
                        });
                    },
                    ...args,
                });
            },
        },
    },
};
