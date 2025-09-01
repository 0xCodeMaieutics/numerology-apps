import '@workspace/ui/globals.css';

import { Providers } from '@/components/providers';

import './fonts.css';

export const metadata = {
    title: '33 - Numerology Database',
    description:
        'Explore the world of numerology and discover the hidden meanings behind numbers.',
    keywords: [
        'numerology',
        'astrology',
        'database',
        'explore',
        'hidden meanings',
    ],
};
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={'font-sans antialiased'}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
