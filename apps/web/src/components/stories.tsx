'use client';

import { RedisTypes } from '@/types/api/redis';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { numerology } from '@/utils/numerology';

const StoryCard = (props: {
    celebrity: RedisTypes['celebrities']['category']['response'][number];
}) => {
    const lifePathNumber = numerology.calculateLifePath(
        props.celebrity.day.toString(),
        props.celebrity.month.toString(),
        props.celebrity.year.toString(),
    );

    const getMasterNumberTooltipText = (lifePath: number) => {
        if (lifePath === 22 || lifePath === 33)
            return `${lifePath} is a rare Master Number!`;
        else if (lifePath === 11) return `${lifePath} is a Master Number!`;
    };

    return (
        <Link href={`/profile/${props.celebrity.id}`}>
            <div className="relative overflow-hidden rounded-md">
                <div className="relative w-[150px] h-[200px]">
                    <Image
                        src={props.celebrity.image_url}
                        alt={`Photo of ${props.celebrity.name}`}
                        className="object-cover opacity-80"
                        sizes="(max-width: 150px) 100vw, 150px"
                        priority
                        fill
                    />
                </div>
                <div className="absolute z-10 top-0 left-0 flex justify-between w-full bg-linear-to-b from-background to-transparent px-4 py-2.5">
                    <Tooltip>
                        <TooltipTrigger>
                            <p className={'text-2xl text-primary font-bold'}>
                                {lifePathNumber}
                            </p>
                        </TooltipTrigger>
                        <TooltipContent align="center" alignOffset={100}>
                            <span>
                                This is the person&apos;s{' '}
                                <span className="font-bold">
                                    Lifepath number
                                </span>
                            </span>
                        </TooltipContent>
                    </Tooltip>

                    {numerology.isMasterNumber(lifePathNumber) && (
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="flex justify-center items-center size-8 bg-foreground/30 rounded-full text-xs">
                                    <Star className="fill-primary text-primary size-5" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent align="center" alignOffset={100}>
                                <span>
                                    {getMasterNumberTooltipText(lifePathNumber)}
                                </span>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
                <div className="absolute bg-linear-to-t from-black to-transparent w-full pt-2 z-10 bottom-0 left-0 px-4 pb-2.5 text-white">
                    <p className="text-sm font-semibold">
                        {props.celebrity.name}
                    </p>
                </div>
            </div>
        </Link>
    );
};

const SCROLL_VALUE = 500;

export const Stories = ({
    celebrities,
}: {
    celebrities: RedisTypes['celebrities']['category']['response'];
}) => {
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollWidth, setScrollWidth] = useState(0);
    const scrollViewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollViewportRef.current) {
            setScrollWidth(
                scrollViewportRef.current.scrollWidth -
                    scrollViewportRef.current.clientWidth,
            );
        }
    }, []);

    const onLeftArrowClick = (value: number) => {
        if (scrollViewportRef.current) {
            scrollViewportRef.current.scroll({
                left: scrollLeft - value,
                behavior: 'smooth',
            });
        }
    };
    const onRightArrowClick = (value: number) => {
        if (scrollViewportRef.current) {
            scrollViewportRef.current.scroll({
                left: scrollLeft + value,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="relative">
            <ScrollArea
                viewportRef={scrollViewportRef}
                onScrollCapture={(e) => {
                    if (!scrollViewportRef.current) return;
                    console.log(
                        'onscrollcapture',
                        scrollViewportRef.current.scrollWidth,
                    );
                    setScrollLeft(scrollViewportRef?.current?.scrollLeft);
                }}
                className="rounded-md"
            >
                <div className="flex gap-3">
                    {celebrities?.map((celebrity) => (
                        <StoryCard key={celebrity.id} celebrity={celebrity} />
                    ))}{' '}
                </div>
            </ScrollArea>
            <button
                onClick={() => onLeftArrowClick(SCROLL_VALUE)}
                className={cn(
                    'absolute top-1/2 left-2 transform -translate-y-1/2 transition-opacity duration-300',
                    {
                        'opacity-0': scrollLeft === 0,
                    },
                )}
            >
                <div className="flex justify-center items-center size-12 bg-foreground rounded-full">
                    <ChevronLeft className="size-7 text-background" />
                </div>
            </button>
            <button
                onClick={() => onRightArrowClick(SCROLL_VALUE)}
                className={cn(
                    'absolute top-1/2 right-2 transform -translate-y-1/2 transition-opacity duration-150',
                    {
                        'opacity-0': scrollLeft === scrollWidth,
                    },
                )}
            >
                <div className="flex justify-center items-center size-12 bg-foreground rounded-full">
                    <ChevronRight className="size-7 text-background" />
                </div>
            </button>
        </div>
    );
};
