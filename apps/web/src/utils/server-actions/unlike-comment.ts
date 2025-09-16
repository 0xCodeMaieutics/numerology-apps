'use server';

import { nosqlDB } from '@workspace/db/nosql';

export const unlikeCommentServerAction = async ({
    commentId,
    userId,
}: {
    commentId: string;
    userId: string;
}) => {
    'use server';

    await nosqlDB.models.CelebrityComment.unlikeComment({
        commentId,
        userId,
    });
};
