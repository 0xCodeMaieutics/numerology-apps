import { db } from '@workspace/db';
import {
    Card,
    CardDescription,
    CardTitle,
} from '@workspace/ui/components/card';
import { unstable_cache } from 'next/cache';
import Image from 'next/image';

import { Categories } from '@/components/categories';
import { Stories } from '@/components/stories';

import { redis } from '@/lib/redis-client';

const WelcomeCard = ({
    celebrityCount,
    userCount,
}: {
    celebrityCount: number;
    userCount: number;
}) => (
    <Card className="relative px-5 py-12 bg-transparent">
        <div className="w-full text-center sm:text-left sm:max-w-xl space-y-3">
            <CardTitle className="text-2xl font-semibold">
                Explore celebrities inner traits through Numerology
            </CardTitle>
            <CardDescription className="text-foreground">
                Numerology Database offers a collection of celebrities from
                various fields, allowing users to explore and analyze their
                numerological profiles.
            </CardDescription>
        </div>

        <div className="grid grid-flow-col grid-rows-1 justify-center gap-10 sm:justify-start sm:max-w-xs">
            <div className="flex flex-col items-center sm:items-start">
                <p className="text-sm">Celebrities</p>
                <p className="font-semibold">{celebrityCount}</p>
            </div>
            <div className="flex flex-col items-center sm:items-start">
                <p className="text-sm">Users</p>
                <p className="font-semibold">{userCount}</p>
            </div>
        </div>
        <div className="absolute top-0 bottom-0 right-0 left-0 bg-background/70 -z-10"></div>
        <div className="absolute top-0 bottom-0 left-0 right-0 -z-20">
            <Image
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                src="/universe.webp"
                alt="Universe Image"
                className="object-cover"
                priority
            />
        </div>
    </Card>
);

const REVALIDATE = 60 * 60 * 3; // 3 hours

const getUserCount = unstable_cache(
    async () => db.user.count(),
    ['user', 'count'],
    {
        revalidate: REVALIDATE,
    },
);

const getCelebrityCount = unstable_cache(
    async () => db.celebrities.count(),
    ['celebrities', 'count'],
    {
        revalidate: REVALIDATE,
    },
);

const getStories = unstable_cache(
    async () => redis.read.celebrities.category('stories'),
    ['celebrities', 'stories'],
    {
        revalidate: REVALIDATE,
    },
);

const getMMA = unstable_cache(
    async () => redis.read.celebrities.category('mma'),
    ['celebrities', 'mma'],
    {
        revalidate: REVALIDATE,
    },
);

const getFootball = unstable_cache(
    async () => redis.read.celebrities.category('football'),
    ['celebrities', 'football'],
    {
        revalidate: REVALIDATE,
    },
);

const getPolitics = unstable_cache(
    async () => redis.read.celebrities.category('politics'),
    ['celebrities', 'politics'],
    {
        revalidate: REVALIDATE,
    },
);

const getInfluencers = unstable_cache(
    async () => redis.read.celebrities.category('influencer'),
    ['celebrities', 'influencer'],
    {
        revalidate: REVALIDATE,
    },
);

export default async function Page() {
    const storiesCelebs = await getStories();
    const mmaCelebs = await getMMA();
    const footballCelebs = await getFootball();
    const politicsCelebs = await getPolitics();
    const influencerCelebs = await getInfluencers();

    const celebCount = await getCelebrityCount();
    const userCount = await getUserCount();
    return (
        <div className="w-full mx-auto max-w-3xl space-y-12">
            {storiesCelebs ? <Stories celebrities={storiesCelebs} /> : null}
            <WelcomeCard userCount={userCount} celebrityCount={celebCount} />

            <div className="space-y-2">
                {politicsCelebs ? (
                    <Categories
                        category="Politics"
                        title="Politics"
                        celebrities={politicsCelebs}
                    />
                ) : null}
                {footballCelebs ? (
                    <Categories
                        category="Football"
                        title="Football"
                        celebrities={footballCelebs}
                    />
                ) : null}
                {mmaCelebs ? (
                    <Categories
                        category="MMA"
                        title="MMA"
                        celebrities={mmaCelebs}
                    />
                ) : null}

                {influencerCelebs ? (
                    <Categories
                        category="Influencer"
                        title="Influencers & Youtubers"
                        celebrities={influencerCelebs}
                    />
                ) : null}
            </div>
        </div>
    );
}
