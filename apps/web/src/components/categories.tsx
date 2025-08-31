import { RedisTypes } from '@/types/api/redis';
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area';
import Image from 'next/image';

import { numerology } from '@/utils/numerology';

export const Categories = ({
    celebrities,
    title = 'Title',
}: {
    celebrities: RedisTypes['celebrities']['category']['response'];
    title?: string;
}) => {
    return (
        <div className="flex flex-col gap-3">
            <span className="text-muted-foreground text-lg font-bold">
                {title}
            </span>
            <ScrollArea className="w-full rounded-md">
                <div className="flex gap-4 mb-3">
                    {celebrities.map((celeb) => {
                        const shortenedBio =
                            celeb.bio.length > 100
                                ? celeb.bio.slice(0, 100) + '...'
                                : celeb.bio;
                        return (
                            <div
                                key={celeb.id}
                                className="shrink-0 flex gap-2 rounded-lg border max-w-xs p-3 overflow-hidden"
                            >
                                <Image
                                    src={celeb.image_url}
                                    width={60}
                                    height={60}
                                    className="shrink-0 size-[120px] rounded-lg object-cover"
                                    alt={`Photo of ${celeb.name}`}
                                />
                                <div className="flex-1 flex flex-col overflow-ellipsis">
                                    <div className="flex-1">
                                        <span className="block">
                                            {celeb.name}
                                        </span>
                                        <p className="text-xs overflow-y-hidden text-muted-foreground">
                                            {shortenedBio}
                                        </p>
                                    </div>

                                    <span className="text-right">
                                        LP:{' '}
                                        {numerology.calculateLifePath(
                                            celeb.day.toString(),
                                            celeb.month.toString(),
                                            celeb.year.toString(),
                                        )}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};
