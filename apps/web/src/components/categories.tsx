'use client';

import { DBQueries } from '@workspace/db';
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';
import { numerology } from '@workspace/utils/numerology';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { getMasterNumberTooltipElement } from '@/utils/get-master-number-tool-tip-element';
import { navigation } from '@/utils/navigation';

const SHORTEN_NAME_LENGTH = 15;
const CategoryCard = (props: {
    celeb: DBQueries['select']['celebrities'];
    category: string;
}) => {
    const router = useRouter();

    const lifePathNumber = numerology.calculateLifePath(
        props.celeb.birthDay.toString(),
        props.celeb.birthMonth.toString(),
        props.celeb.birthYear.toString(),
    );

    const getShortenedName = (name: string) => {
        if (name.length > SHORTEN_NAME_LENGTH) {
            return `${name.slice(0, SHORTEN_NAME_LENGTH)}...`;
        }
        return name;
    };

    const content = (
        <div className="relative h-full w-full flex justify-center items-center text-left gap-2 px-2 pr-7">
            <div className="relative">
                <Image
                    src={props.celeb.imageUrl ?? '/default-avatar.png'}
                    width={70}
                    height={70}
                    className="flex flex-col justify-center items-center shrink-0 size-[70px] rounded-lg object-cover"
                    alt={`Photo of ${props.celeb.name}`}
                />

                <div className="absolute rounded-lg w-full bg-linear-to-t from-background to-transparent flex flex-col left-0 bottom-0 pt-2 pb-2 pl-2">
                    <p className="font-bold text-primary">
                        {numerology.calculateLifePath(
                            props.celeb.birthDay.toString(),
                            props.celeb.birthMonth.toString(),
                            props.celeb.birthYear.toString(),
                        )}
                    </p>
                </div>
            </div>
            <div className="flex-1 h-full flex flex-col justify-start pt-2 gap-1">
                <p className="font-semibold leading-4 w-6/7">
                    {getShortenedName(props.celeb.name ?? '')}
                </p>

                {/* <p className="text-xs">Zodiac: Tiger (Born in 1975)</p> */}
                <p className="text-xs text-muted-foreground">
                    {props.celeb.categories?.join(', ')}
                </p>
            </div>
            <div className="absolute top-0 right-2 text-muted-foreground text-xs font-medium">
                {props.celeb.totalLikes} likes
            </div>
        </div>
    );

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => {
                router.push(navigation.celebrity.detail(props.celeb.id));
            }}
            className={cn(
                'h-20 w-full max-w-[250px] relative shrink-0 rounded-lg border overflow-hidden cursor-pointer hover:bg-foreground/10 transition-colors duration-150',
                {
                    'border-primary': numerology.isMasterNumber(lifePathNumber),
                },
            )}
        >
            {numerology.isMasterNumber(lifePathNumber) ? (
                <Tooltip>
                    <TooltipTrigger className="h-full w-full">
                        {content}
                    </TooltipTrigger>
                    <TooltipContent>
                        {getMasterNumberTooltipElement(lifePathNumber)}
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
    category = '',
}: {
    celebrities: DBQueries['select']['celebrities'][];
    title?: string;
    category?: string;
}) => {
    return (
        <div className="flex flex-col gap-3">
            <Title title={title} />
            <ScrollArea className="w-full rounded-md">
                <div className="flex items-center  gap-4 mb-3">
                    {celebrities.map((celeb) => (
                        <CategoryCard
                            key={celeb.id}
                            category={category}
                            celeb={celeb}
                        />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};
