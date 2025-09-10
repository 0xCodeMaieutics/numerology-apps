import { frontendDomain } from '@/constants';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ICelebrityComment, NoSQLQueries } from '@workspace/db/nosql';
import { SQLDBQueries } from '@workspace/db/sql';
import 'better-auth';

import { authClient } from '@/lib/auth-client';

export const queryKeys = {
    comments: (celebrityId: string) => ['comments', celebrityId],
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
        useComments: (celebrityId: string) =>
            useSuspenseQuery<
                unknown,
                Error,
                NoSQLQueries['CelebrityComment']['findByCelebrityId']
            >({
                queryKey: queryKeys.comments(celebrityId),
                queryFn: () =>
                    fetch(`${frontendDomain}/api/comments/${celebrityId}`).then(
                        (res) => res.json() as Promise<ICelebrityComment[]>,
                    ),
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
                queryFn: () => {
                    return fetch(
                        `${frontendDomain}/api/liked/${celebrityId}/${userId}`,
                    ).then((res) => res.json() as Promise<{ liked: boolean }>);
                },
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
};
