'use client';

import { RedisTypes } from '@/types/api/redis';
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { numerology } from '@/utils/numerology';

const CategoryCard = (props: {
    celeb: RedisTypes['celebrities']['category']['response'][number];
}) => {
    const router = useRouter();
    const shortenedName =
        props.celeb.name.length > 14
            ? `${props.celeb.name.slice(0, 14)}...`
            : props.celeb.name;

    const lifePathNumber = numerology.calculateLifePath(
        props.celeb.day.toString(),
        props.celeb.month.toString(),
        props.celeb.year.toString(),
    );

    const getMasterNumberTooltipText = (lifePath: number) => {
        if (lifePath === 22 || lifePath === 33)
            return `${lifePath} is a rare Master Number!`;
        else if (lifePath === 11) return `${lifePath} is a Master Number!`;
    };

    const content = (
        <div className="relative flex text-left gap-2 p-2 pr-7">
            <div className="relative flex items-center">
                <Image
                    src={props.celeb.image_url}
                    width={70}
                    height={70}
                    className="flex flex-col justify-center items-center shrink-0 size-[70px] rounded-lg object-cover"
                    alt={`Photo of ${props.celeb.name}`}
                />

                <div className="absolute w-full bg-linear-to-t from-background to-transparent flex flex-col left-0 bottom-0 pt-2 pb-2 pl-2">
                    <p className="font-bold text-primary">
                        {numerology.calculateLifePath(
                            props.celeb.day.toString(),
                            props.celeb.month.toString(),
                            props.celeb.year.toString(),
                        )}
                    </p>
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-y-1 overflow-ellipsis">
                <p className="text-lg font-semibold w-[70%] leading-5">
                    {shortenedName}
                </p>
                <p className="text-xs">Zodiac: Tiger (Born in 1975)</p>
                <p className="text-xs text-muted-foreground">
                    politics, business
                </p>
            </div>
            <div className="absolute top-2 right-2 text-muted-foreground text-xs font-medium">
                4k votes
            </div>
        </div>
    );

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => {
                router.push(`/profile/${props.celeb.id}`);
            }}
            className={cn(
                'relative shrink-0 rounded-lg border max-w-xs overflow-hidden cursor-pointer hover:bg-foreground/10 transition-colors duration-150',
                {
                    'border-primary': numerology.isMasterNumber(lifePathNumber),
                },
            )}
        >
            {numerology.isMasterNumber(lifePathNumber) ? (
                <Tooltip>
                    <TooltipTrigger className="">{content}</TooltipTrigger>
                    <TooltipContent>
                        {getMasterNumberTooltipText(lifePathNumber)}
                    </TooltipContent>
                </Tooltip>
            ) : (
                content
            )}
        </div>
    );
};

const Title = ({ title }: { title: string }) => (
    <span className="text-muted-foreground text-lg font-bold">{title}</span>
);

export const Categories = ({
    celebrities,
    title = 'Title',
}: {
    celebrities: RedisTypes['celebrities']['category']['response'];
    title?: string;
}) => {
    return (
        <div className="flex flex-col gap-3">
            <Title title={title} />
            <ScrollArea className="w-full rounded-md">
                <div className="flex gap-4 mb-3">
                    {celebrities.map((celeb) => (
                        <CategoryCard key={celeb.id} celeb={celeb} />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};
