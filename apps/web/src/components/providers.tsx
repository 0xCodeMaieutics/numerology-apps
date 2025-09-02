'use client';

import { QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';

import { getQueryClient } from '@/lib/react-query';

import { Header } from './header';
import { SideBar } from './side-bar';


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
                    <SideBar />
                    {children}
                </main>
            </NextThemesProvider>
        </QueryClientProvider>
    );
}
