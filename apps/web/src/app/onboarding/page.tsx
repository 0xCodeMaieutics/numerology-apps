import { sqlDB } from '@workspace/db/sql';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

import { CompleteProfileForm } from '../(auth)/_/complete-profile-form';

export default async function OnboardingPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (session?.user.id) {
        const user = await sqlDB.user.select.id(session.user.id);
        if (user?.birthDate) redirect('/');
    } else redirect('/login');

    return <CompleteProfileForm />;
}
