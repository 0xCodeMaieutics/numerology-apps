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
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
                'w-full flex p-5 py-6 justify-start rounded-full items-center gap-3.5 text-xl dark:hover:bg-accent/10 dark:hover:text-foreground',
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

export const SideBar = () => {
    const pathname = usePathname();
    return (
        <aside className="hidden sm:flex flex-col gap-y-4">
            <Link href={'/'}>
                <SideLink Icon={HomeIcon} isActive={pathname === '/'}>
                    Home
                </SideLink>
            </Link>
            <Link href="/explore">
                <SideLink Icon={Search} isActive={pathname === '/explore'}>
                    Explore
                </SideLink>
            </Link>
            <SideLink Icon={CalculatorIcon}>Calculator</SideLink>
            <SideLink Icon={UsersRound}>App</SideLink>
            <SideLink Icon={SettingsIcon}>Settings</SideLink>
            <SideLink Icon={UserRound}>Profile</SideLink>
            <Button
                size={'lg'}
                className="text-right text-lg rounded-full p-5 py-6 md:min-w-[200px]"
            >
                <span className="hidden md:block">New Celebrity</span>
                <Send className="md:hidden" />
            </Button>
        </aside>
    );
};
