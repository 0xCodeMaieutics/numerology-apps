import { queryHooks, queryKeys } from '@/hooks/queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth-client';

export const HeaderLogin = () => {
    const session = queryHooks.suspense.useAuthSession();
    const queryClient = useQueryClient();
    const signOutMutation = useMutation({
        mutationFn: () => authClient.signOut(),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.auth().session,
            });
        },
        onError: () => {
            toast.error('Error signing out');
        },
    });
    return session.data ? (
        <Button
            size={'lg'}
            onClick={() => signOutMutation.mutate()}
            disabled={signOutMutation.isPending}
        >
            {signOutMutation.isPending ? (
                <Loader2Icon className="animate-spin" />
            ) : null}
            Logout
        </Button>
    ) : (
        <Button size={'lg'}>
            <Link href={'/login'}>Login</Link>
        </Button>
    );
};
