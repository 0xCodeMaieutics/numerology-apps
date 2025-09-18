'use server';

import { SQLDBQueries, sqlDB } from '@workspace/db/sql';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';

export const updateUserProfile = async ({
    ...args
}: Partial<SQLDBQueries['insert']['user']>) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user.id) throw new Error('User not authenticated');

    await sqlDB.user.update(session.user.id, {
        ...args,
    });
};
