'use server';

import { ICelebrityCommentWrite, nosqlDB } from '@workspace/db/nosql';

export const commentServerAction = async (comment: ICelebrityCommentWrite) => {
    'use server';
    await nosqlDB.models.CelebrityComment.createTopLevel({
        ...comment,
    });
};
