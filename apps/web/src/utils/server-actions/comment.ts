'use server';

import { queryKeys } from '@/hooks/queries';
import { ICelebrityCommentWrite, nosqlDB } from '@workspace/db/nosql';
import { revalidateTag } from 'next/cache';

export const commentServerAction = async ({
    userId,
    ...comment
}: ICelebrityCommentWrite & { userId: string }) => {
    'use server';
    await nosqlDB.models.CelebrityComment.createTopLevel({
        ...comment,
    });
    revalidateTag(
        queryKeys
            .comments({
                celebrityId: comment.celebrityId as string,
                userId: userId,
            })
            .join('/'),
    );
};
