'use client';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { HeaderLogin } from './header-login';
import { Logo } from './logo';

const ButtonSkeleton = () => (
    <Skeleton className="h-12 w-[100px] bg-foreground/10 rounded-full" />
);

export const Header = () => (
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
                <Suspense fallback={<ButtonSkeleton />}>
                    <HeaderLogin />
                </Suspense>

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
