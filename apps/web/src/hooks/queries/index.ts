import { frontendDomain } from '@/constants';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { NoSQLQueries } from '@workspace/db/nosql';
import { SQLDBQueries } from '@workspace/db/sql';
import 'better-auth';

import { likeCommentServerAction } from '@/utils/server-actions/like-comment';
import { unlikeCommentServerAction } from '@/utils/server-actions/unlike-comment';

import { authClient } from '@/lib/auth-client';

export const queryKeys = {
    comments: ({
        celebrityId,
        userId,
    }: {
        celebrityId: string;
        userId?: string;
    }) => ['comments', celebrityId, userId ?? 'user-not-logged-in'],
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

export const queryHooks = {
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
        useComments: ({
            celebrityId,
            userId,
        }: {
            celebrityId: string;
            userId?: string;
        }) =>
            useSuspenseQuery<
                unknown,
                Error,
                NoSQLQueries['CelebrityComment']['findByCelebrityId']
            >({
                queryKey: queryKeys.comments({
                    celebrityId,
                    userId,
                }),
                queryFn: () => {
                    const searchParams = new URLSearchParams();
                    userId && searchParams.set('userId', userId);
                    const baseUrl = `${frontendDomain}/api/comments/${celebrityId}`;
                    return fetch(
                        searchParams.size > 0
                            ? `${baseUrl}?${searchParams.toString()}`
                            : baseUrl,
                    ).then((res) => res.json());
                },
            }),
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
                        `${frontendDomain}/api/celebrity/${celebrityId}/comments-count`,
                    ).then((res) =>
                        res.json().then((data) => data.count as number),
                    ),
            }),
    },
    mutation: {
        celebrity: {
            useLikeComment: (args?: {
                onSuccess?: () => void;
                onError?: () => void;
            }) =>
                useMutation<
                    unknown,
                    Error,
                    { commentId: string; userId: string }
                >({
                    mutationFn: ({ commentId, userId }) =>
                        likeCommentServerAction({
                            commentId,
                            userId,
                        }),
                    onSuccess: args?.onSuccess,
                    onError: args?.onError,
                }),

            useUnlikeComment: (args?: {
                onSuccess?: () => void;
                onError?: () => void;
            }) =>
                useMutation<
                    unknown,
                    Error,
                    { commentId: string; userId: string }
                >({
                    mutationFn: ({ commentId, userId }) =>
                        unlikeCommentServerAction({
                            commentId,
                            userId,
                        }),
                    onSuccess: args?.onSuccess,
                    onError: args?.onError,
                }),
        },
    },
};
