import { getMasterNumberTooltipElement } from '@/utils/get-master-number-tool-tip-element';
import { SQLDBQueries } from '@workspace/db/sql';
import { Tooltip, TooltipContent, TooltipTrigger } from '@workspace/ui/components/tooltip';
import { numerology } from '@workspace/utils/numerology';
import { Star } from 'lucide-react';
import Image from 'next/image';

export const CelebrityImage = (props: {
    celebProfile: SQLDBQueries['select']['celebrities'];
}) => {
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
};
