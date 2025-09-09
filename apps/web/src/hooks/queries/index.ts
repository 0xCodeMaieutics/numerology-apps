import { frontendDomain } from '@/constants';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ICelebrityComment, NoSQLQueries } from '@workspace/db/nosql';
import { SQLDBQueries } from '@workspace/db/sql';

export const queryKeys = {
    comments: (celebrityId: string) => ['comments', celebrityId],
    liked: (celebrityId: string, userId?: string) => [
        'liked',
        celebrityId,
        userId,
    ],

    celebrity: (celebrityId: string) => ({
        default: ['celebrity', celebrityId],
        commentsCount: ['celebrity', celebrityId, 'commentsCount'],
    }),
};

export const queryHooks = {
    suspense: {
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
            useSuspenseQuery<unknown, Error, false>({
                queryKey: queryKeys.liked(celebrityId, userId),
                queryFn: () =>
                    userId
                        ? fetch(
                              `${frontendDomain}/api/liked/${celebrityId}/${userId}`,
                          ).then((res) =>
                              res.json().then((data) => data.liked as boolean),
                          )
                        : { liked: false },
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
                    ).then((res) => res.json().then((data) => data.count as number)),
            }),
    },
};
