'use client';

import { RedisTypes } from '@/types/api/redis';
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area';
import { cn } from '@workspace/ui/lib/utils';
import { ChevronLeft, ChevronRight, Crown } from 'lucide-react';
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
                <div className="absolute flex justify-between w-full bg-linear-to-b from-black to-transparent z-10 top-0 left-0 px-4 py-2.5 text-white">
                    <div>
                        <span className="text-xs">Life Path</span>{' '}
                        <span
                            className={cn(
                                'text-2xl text-primary font-bold block',
                            )}
                        >
                            {lifePathNumber}
                        </span>
                    </div>
                    {numerology.isMasterNumber(lifePathNumber) && (
                        <div className="flex justify-center items-center size-8 bg-foreground rounded-full text-xs">
                            <Crown className="text-primary size-5" />
                        </div>
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
                <div className="flex gap-3 mb-3">
                    {celebrities?.map((celebrity) => (
                        <StoryCard key={celebrity.id} celebrity={celebrity} />
                    ))}{' '}
                </div>

                <ScrollBar orientation="horizontal" />
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
