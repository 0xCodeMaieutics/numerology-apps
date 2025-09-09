'use server';

import { ICelebrityReplyWrite, nosqlDB } from '@workspace/db/nosql';
import { revalidatePath } from 'next/cache';

export const replyServerAction = async (reply: ICelebrityReplyWrite) => {
    'use server';
    await nosqlDB.models.CelebrityComment.createReply({
        ...reply,
    });
    revalidatePath(`/celebrity/${reply.celebrityId}`);
};
