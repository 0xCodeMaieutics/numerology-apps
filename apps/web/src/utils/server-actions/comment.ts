'use server';

import { ICelebrityCommentWrite, nosqlDB } from '@workspace/db/nosql';
import { revalidatePath } from 'next/cache';

export const commentServerAction = async (comment: ICelebrityCommentWrite) => {
    'use server';
    await nosqlDB.models.CelebrityComment.createTopLevel({
        ...comment,
    });
    revalidatePath(`/celebrity/${comment.celebrityId}`);
};
