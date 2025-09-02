import { RedisTypes } from '@/types/api/redis';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { format } from 'date-fns';
import { Bookmark, ChevronLeft, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { numerology } from '@/utils/numerology';

import { redis } from '@/lib/redis-client';

const Info = (props: { value: string; label: string }) => (
    <div>
        <span className="text-muted-foreground">{props.label}</span>{' '}
        <span className="font-medium">{props.value}</span>
    </div>
);

const Infos = (props: {
    celebProfile: RedisTypes['celebrities']['category']['response'][number];
}) => {
    return (
        <div>
            <Info
                label="Date of birth:"
                value={format(
                    new Date(
                        props.celebProfile.year,
                        props.celebProfile.month - 1,
                        props.celebProfile.day,
                    ),
                    'dd LLL, yyyy',
                )}
            />
            <Info label="Nationality:" value={props.celebProfile.nationality} />
            <Info
                label="Place of Birth:"
                value={props.celebProfile.place_of_birth}
            />
        </div>
    );
};

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ profileId: string }>;
}) {
    const { profileId } = await params;
    const celebProfile = await redis.read.celebrities.profile(profileId);
    if (!celebProfile) return <div>Profile not found</div>;

    const lifePathNumber = numerology.calculateLifePath(
        celebProfile.day.toString(),
        celebProfile.month.toString(),
        celebProfile.year.toString(),
    );

    const getMasterNumberTooltipText = (lifePath: number) => {
        if (lifePath === 22 || lifePath === 33)
            return `${lifePath} is a rare Master Number!`;
        else if (lifePath === 11) return `${lifePath} is a Master Number!`;
    };

    return (
        <div className="min-h-svh w-full max-w-3xl mx-auto">
            <Link href="/" className="flex items-center gap-1.5">
                <ChevronLeft />
                <span className="font-semibold">Back</span>
            </Link>

            <div className="space-y-10">
                <div className="flex gap-4">
                    <div className="relative">
                        {celebProfile?.image_url ? (
                            <Image
                                src={celebProfile?.image_url}
                                width={240}
                                height={240}
                                className="flex flex-col justify-center items-center shrink-0 size-[240px] rounded-lg object-cover"
                                alt={`Photo of ${celebProfile?.name}`}
                            />
                        ) : null}
                        <div className="absolute w-full flex justify-end top-0 px-4 py-2.5 bg-linear-to-b from-background to-transparent">
                            {numerology.isMasterNumber(lifePathNumber) && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className="flex justify-center items-center size-12 bg-foreground/30 rounded-full text-xs">
                                            <Star className="fill-primary text-primary size-8" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        align="center"
                                        alignOffset={100}
                                    >
                                        <span>
                                            {getMasterNumberTooltipText(
                                                lifePathNumber,
                                            )}
                                        </span>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                        <div className="absolute w-full flex bottom-0 px-4 py-2.5 bg-linear-to-t from-background to-transparent">
                            <Tooltip>
                                <TooltipTrigger>
                                    <span className="text-2xl text-primary font-bold">
                                        {lifePathNumber}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent
                                    align="center"
                                    alignOffset={100}
                                >
                                    <span>
                                        This is the person&apos;s Life path
                                        number
                                    </span>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-2xl">
                                {celebProfile?.name}
                            </span>
                            <button className="relative">
                                <Bookmark className="text-primary" />
                                <span className="absolute bg-background -top-1 -right-3 flex items-center justify-center">
                                    <span className="text-xs">1.2k</span>
                                </span>
                            </button>
                        </div>
                        <Infos celebProfile={celebProfile} />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-muted-foreground">
                        BIO
                    </span>
                    <span>{celebProfile?.bio}</span>
                </div>
            </div>
        </div>
    );
}
