import { Header } from '@/components/header';
import { SideBar } from '@/components/side-bar';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <main className="flex gap-2 md:gap-10 lg:gap-0 py-24 w-full max-w-6xl mx-auto px-4">
                <SideBar />
                {children}
            </main>
        </>
    );
}
