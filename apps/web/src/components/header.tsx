import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Menu } from 'lucide-react';
import Link from 'next/link';

export const Header = () => {
    return (
        <header className="fixed bg-background border-b z-50 top-0 left-0 right-0 p-4">
            <div className="w-full max-w-6xl flex gap-5 md:gap-0 items-center justify-between mx-auto">
                <Link href="/" className="group">
                    <span
                        style={{
                            fontFamily: 'MysteryQuest',
                        }}
                        className="text-3xl text-foreground/80 group-hover:text-foreground transition-colors duration-300"
                    >
                        33
                    </span>
                    <div className="relative bg-foreground/80 group-hover:bg-foreground transition-colors duration-300 bottom-1.5 w-full h-1" />
                </Link>
                <div className="flex-1">
                    <Input
                        placeholder="Donald Trump"
                        className="w-full max-w-[490px] mx-auto rounded-md border border-foreground p-2 h-10"
                    />
                </div>
                <div className="hidden md:flex gap-2">
                    <Button size={'lg'}>Login</Button>
                    <Button size={'lg'} variant={'secondary'}>
                        App
                    </Button>
                </div>
                <div className="block md:hidden">
                    <button
                        onClick={() => {
                            // open the sheet
                        }}
                    >
                        <Menu />
                    </button>
                </div>
            </div>
        </header>
    );
};
