'use server';

import { queryKeys } from '@/hooks/queries';
import { ICelebrityCommentWrite, nosqlDB } from '@workspace/db/nosql';
import { revalidateTag } from 'next/cache';

export const commentServerAction = async (comment: ICelebrityCommentWrite) => {
    'use server';
    await nosqlDB.models.CelebrityComment.createTopLevel({
        ...comment,
    });
    revalidateTag(queryKeys.comments(comment.celebrityId as string).join('/'));
};
