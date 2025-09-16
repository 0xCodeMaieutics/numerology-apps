'use client';

import { isDevelopment } from '@/constants';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';

import { getQueryClient } from '@/lib/react-query';

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
                {children}
            </NextThemesProvider>
            {isDevelopment ? <ReactQueryDevtools /> : null}
        </QueryClientProvider>
    );
}
