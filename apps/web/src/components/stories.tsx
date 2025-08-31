'use client';

import { RedisTypes } from '@/types/api/redis';
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area';
import Image from 'next/image';
import Link from 'next/link';

import { numerology } from '@/utils/numerology';

export const Stories = ({
    celebrities,
}: {
    celebrities: RedisTypes['celebrities']['category']['response'];
}) => {
    return (
        <ScrollArea className="flex flex-col gap-3 rounded-md">
            <div className="flex gap-3">
                {celebrities?.map((celebrity) => (
                    <div key={celebrity.id} className="shrink-0 cursor-pointer">
                        <Link href={`/profile/${celebrity.id}`}>
                            <div className="relative overflow-hidden rounded-md">
                                <Image
                                    src={celebrity.image_url}
                                    alt={`Photo of ${celebrity.name}`}
                                    className="aspect-[3/4] h-fit w-fit object-cover opacity-80"
                                    width={112}
                                    height={200}
                                />
                                <div className="absolute z-10 bottom-0 left-2 text-white">
                                    <span className="text-sm text-foreground">
                                        {celebrity.name}
                                    </span>
                                </div>
                                <div className="absolute z-10 top-2 left-2 text-white">
                                    <span className="text-xs text-foreground">
                                        Life Path{' '}
                                        <span className="text-xl font-bold block">
                                            {numerology.calculateLifePath(
                                                celebrity.day.toString(),
                                                celebrity.month.toString(),
                                                celebrity.year.toString(),
                                            )}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
};
