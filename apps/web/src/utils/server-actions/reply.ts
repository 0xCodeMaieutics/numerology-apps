'use server';

import { ICelebrityReplyWrite, nosqlDB } from '@workspace/db/nosql';

export const replyServerAction = async (reply: ICelebrityReplyWrite) => {
    'use server';
    await nosqlDB.models.CelebrityComment.createReply({
        ...reply,
    });
};
