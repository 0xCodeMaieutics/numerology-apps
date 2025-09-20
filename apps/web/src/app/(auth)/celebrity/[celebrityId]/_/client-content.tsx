'use client';

import { SQLDBQueries } from '@workspace/db/sql';
import { Badge } from '@workspace/ui/components/badge';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { CelebrityImage } from '@/components/celebrity-image';
import { CommentSection } from '@/components/comment-section';
import { Infos } from '@/components/infos';

import { CelebrityProps } from '@/lib/context/celebrity-props';

const BackLink = () => (
    <Link href="/" className="flex items-center gap-1.5">
        <ChevronLeft />
        <span className="font-semibold">Back</span>
    </Link>
);

const CategoryBadges = (props: { categories: string[] }) => (
    <div className="flex flex-wrap gap-1.5 items-center">
        {props.categories.map((category, i) => (
            <Badge key={i}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
        ))}
    </div>
);

const Bio = (props: { bio: string | null }) => (
    <div className="flex flex-col gap-2">
        <span className="font-semibold text-muted-foreground">BIO</span>
        <span>{props?.bio}</span>
    </div>
);

export const ClientContent = ({
    celebProfile,
}: {
    celebProfile: SQLDBQueries['select']['celebrities'];
}) => {
    return (
        <CelebrityProps.Provider value={{ celebProfile }}>
            <div className="w-full max-w-3xl mx-auto space-y-4">
                <BackLink />
                <div className="space-y-10">
                    <div className="flex gap-4">
                        <CelebrityImage />
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="flex justify-between">
                                <span className="font-semibold text-lg sm:text-2xl">
                                    {celebProfile?.name}
                                </span>
                            </div>
                            {celebProfile.categories &&
                            celebProfile.categories.length > 0 ? (
                                <CategoryBadges
                                    categories={celebProfile.categories}
                                />
                            ) : null}
                            <Infos celebProfile={celebProfile} />
                        </div>
                    </div>
                    <Bio bio={celebProfile?.bio} />
                    <CommentSection />
                </div>
            </div>
        </CelebrityProps.Provider>
    );
};
