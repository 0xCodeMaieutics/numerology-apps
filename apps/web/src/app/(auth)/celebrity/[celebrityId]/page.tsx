import { DBQueries, db } from '@workspace/db';
import { Badge } from '@workspace/ui/components/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { numerology } from '@workspace/utils/numerology';
import { ChevronLeft, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { CommentSection } from '@/components/comment-section';
import { Infos } from '@/components/infos';

import { getMasterNumberTooltipElement } from '@/utils/get-master-number-tool-tip-element';

function CelebrityImage(props: {
    celebProfile: DBQueries['select']['celebrities'];
}) {
    const lifePathNumber = numerology.calculateLifePath(
        props.celebProfile.birthDay.toString(),
        props.celebProfile.birthMonth.toString(),
        props.celebProfile.birthYear.toString(),
    );
    return (
        <div className="relative">
            {props.celebProfile?.imageUrl ? (
                <Image
                    src={props.celebProfile?.imageUrl}
                    width={240}
                    height={240}
                    className="flex flex-col justify-center items-center shrink-0 size-32 md:size-[240px] rounded-lg object-cover"
                    alt={`Photo of ${props.celebProfile?.name}`}
                />
            ) : null}
            {numerology.isMasterNumber(lifePathNumber) && (
                <div className="absolute w-full flex justify-end top-0 px-2 py-1 sm:px-4 sm:py-2.5 bg-linear-to-b from-background to-transparent">
                    <Tooltip>
                        <TooltipTrigger>
                            <div className="flex justify-center items-center size-8 sm:size-12 bg-foreground/30 rounded-full text-xs">
                                <Star className="fill-primary text-primary size-5 sm:size-8" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent align="center" alignOffset={100}>
                            {getMasterNumberTooltipElement(lifePathNumber)}
                        </TooltipContent>
                    </Tooltip>
                </div>
            )}
            <div className="absolute w-full flex bottom-0 px-4 py-2.5 bg-linear-to-t from-background to-transparent">
                <Tooltip>
                    <TooltipTrigger>
                        <span className="text-2xl md:text-3xl text-primary font-bold">
                            {lifePathNumber}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent align="center" alignOffset={100}>
                        <span>
                            This is the person&apos;s{' '}
                            <span className="font-semibold">
                                Lifepath number
                            </span>
                        </span>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}

export default async function CelebrityPage({
    params,
}: {
    params: Promise<{ celebrityId: string }>;
}) {
    const { celebrityId } = await params;
    const celebProfile = await db.celebrities.read.id(celebrityId);
    if (!celebProfile) return <div>Profile not found</div>;

    return (
        <div className="w-full max-w-3xl mx-auto space-y-4">
            <Link href="/" className="flex items-center gap-1.5">
                <ChevronLeft />
                <span className="font-semibold">Back</span>
            </Link>

            <div className="space-y-10">
                <div className="flex gap-4">
                    <CelebrityImage celebProfile={celebProfile} />
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex justify-between">
                            <span className="font-semibold text-lg sm:text-2xl">
                                {celebProfile?.name}
                            </span>
                        </div>
                        {celebProfile.categories &&
                        celebProfile.categories.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 items-center">
                                {celebProfile.categories.map((category, i) => (
                                    <Badge key={i}>
                                        {category.charAt(0).toUpperCase() +
                                            category.slice(1)}
                                    </Badge>
                                ))}
                            </div>
                        ) : null}

                        <Infos celebProfile={celebProfile} />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-muted-foreground">
                        BIO
                    </span>
                    <span>{celebProfile?.bio}</span>
                </div>

                <CommentSection celebProfile={celebProfile} />
            </div>
        </div>
    );
}
