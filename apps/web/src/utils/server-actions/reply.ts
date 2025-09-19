'use server';

import { IReplyWrite, nosqlDB } from '@workspace/db/nosql';
import { revalidatePath } from 'next/cache';

export const replyServerAction = async (reply: IReplyWrite) => {
    'use server';
    await nosqlDB.models.CelebrityComment.createReply({
        ...reply,
    });
    revalidatePath(`/celebrity/${reply.celebrityId}`);
};
