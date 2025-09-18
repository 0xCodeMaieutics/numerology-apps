'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const HeaderWithNoSSR = dynamic(() => import('../../../components/header'), {
    ssr: false,
});

const SidebarWithNoSSR = dynamic(() => import('../../../components/side-bar'), {
    ssr: false,
});
export const LayoutContent = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <HeaderWithNoSSR />
            <main className="flex gap-2 md:gap-10 lg:gap-0 py-24 w-full max-w-6xl mx-auto px-4">
                <SidebarWithNoSSR />
                {children}
            </main>
        </>
    );
};
