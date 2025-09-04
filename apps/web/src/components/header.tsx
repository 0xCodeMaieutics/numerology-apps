'use client';

import { useMutation } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Loader2Icon, Menu } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth-client';

import { Logo } from './logo';

const ButtonSkeleton = () => {
    return (
        <Skeleton className="h-12 w-[100px] bg-foreground/10 rounded-full" />
    );
};

export const Header = () => {
    const session = authClient.useSession();
    const signOutMutation = useMutation({
        mutationFn: () => authClient.signOut(),
        onError: (error) => {
            toast.error('Error signing out');
        },
    });
    return (
        <header className="fixed bg-background border-b z-50 top-0 left-0 right-0 p-4">
            <div className="w-full max-w-6xl flex gap-5 md:gap-0 items-center justify-between mx-auto">
                <Link href="/">
                    <Logo />
                </Link>

                <div className="flex-1">
                    <Input
                        placeholder="Donald Trump"
                        className="w-full max-w-[490px] mx-auto border-1 border-foreground px-3 py-2 h-10"
                    />
                </div>
                <div className="hidden md:flex gap-2">
                    {session.isPending ? (
                        <ButtonSkeleton />
                    ) : session.data ? (
                        <Button
                            size={'lg'}
                            onClick={() => signOutMutation.mutate()}
                        >
                            {signOutMutation.isPending ? (
                                <Loader2Icon className="animate-spin" />
                            ) : null}
                            {signOutMutation.isPending
                                ? 'Signing out...'
                                : 'Logout'}
                        </Button>
                    ) : (
                        <Button size={'lg'}>
                            <Link href={'/login'}>Login</Link>
                        </Button>
                    )}

                    <Button size={'lg'} variant={'secondary'}>
                        App
                    </Button>
                </div>
                <div className="block md:hidden">
                    <button>
                        <Menu />
                    </button>
                </div>
            </div>
        </header>
    );
};
