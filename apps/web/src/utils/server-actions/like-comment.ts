'use server';

import { nosqlDB } from '@workspace/db/nosql';

export const likeCommentServerAction = async ({
    commentId,
    userId,
}: {
    commentId: string;
    userId: string;
}) => {
    'use server';

    await nosqlDB.models.CelebrityComment.likeComment({
        commentId,
        userId,
    });
};
