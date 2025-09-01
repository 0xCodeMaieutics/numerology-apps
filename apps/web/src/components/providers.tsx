'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import {
    CalculatorIcon,
    HomeIcon,
    LucideIcon,
    Search,
    Send,
    SettingsIcon,
    UserRound,
    UsersRound,
} from 'lucide-react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import Link from 'next/link';
import * as React from 'react';

import { getQueryClient } from '@/lib/react-query';

import { Header } from './header';

const SideLink = ({
    children,
    Icon,
    isActive = false,
}: {
    isActive?: boolean;
    children?: React.ReactNode;
    Icon?: LucideIcon;
}) => {
    return (
        <Button
            variant={'ghost'}
            size={'lg'}
            className={cn(
                'flex p-5 py-6 justify-start rounded-full items-center gap-3.5 text-xl dark:hover:bg-accent/10 dark:hover:text-foreground',
                {
                    'cursor-default text-primary font-semibold': isActive,
                },
            )}
        >
            {Icon ? <Icon className="size-6" /> : null}
            <span className="truncate hidden md:block">{children}</span>
        </Button>
    );
};

export function Providers({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <NextThemesProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
                enableColorScheme
            >
                <Header />
                <main className="flex gap-2 md:gap-10 lg:gap-0 py-24 w-full max-w-6xl mx-auto px-4">
                    <aside className="hidden sm:flex flex-col gap-y-4">
                        <SideLink Icon={HomeIcon} isActive>
                            Home
                        </SideLink>
                        <Link href="/explore">
                            <SideLink Icon={Search}>Explore</SideLink>
                        </Link>

                        <SideLink Icon={CalculatorIcon}>Calculator</SideLink>
                        <SideLink Icon={UsersRound}>App</SideLink>
                        <SideLink Icon={SettingsIcon}>Settings</SideLink>
                        <SideLink Icon={UserRound}>Profile</SideLink>
                        <Button
                            size={'lg'}
                            className="text-right text-lg rounded-full p-5 py-6 md:min-w-[200px]"
                        >
                            <span className="hidden md:block">
                                New Celebrity
                            </span>
                            <Send className="md:hidden" />
                        </Button>
                    </aside>
                    {children}
                </main>
            </NextThemesProvider>
        </QueryClientProvider>
    );
}
