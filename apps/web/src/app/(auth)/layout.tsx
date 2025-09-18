import { sqlDB } from '@workspace/db/sql';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

import { LayoutContent } from './_/layout-content';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.user.id) {
        const user = await sqlDB.user.select.id(session.user.id)
        if (!user?.birthDate) redirect('/onboarding');
    }
    return <LayoutContent>{children}</LayoutContent>;
}
