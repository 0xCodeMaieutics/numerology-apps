import {
    Card,
    CardDescription,
    CardTitle,
} from '@workspace/ui/components/card';

import { Categories } from '@/components/categories';
import { Stories } from '@/components/stories';

import { redis } from '@/lib/redis-client';

export default async function Page() {
    const storiesCelebs = await redis.read.celebrities.category('stories');
    const mmaCelebs = await redis.read.celebrities.category('mma');
    const footballCelebs = await redis.read.celebrities.category('football');
    const politicsCelebs = await redis.read.celebrities.category('politics');
    const influencerCelebs =
        await redis.read.celebrities.category('influencer');
    return (
        <div className="min-h-svh w-full mx-auto max-w-3xl space-y-6">
            {storiesCelebs ? <Stories celebrities={storiesCelebs} /> : null}

            <div className="space-y-6">
                <Card className="px-5">
                    <CardTitle className="text-xl font-semibold">
                        Explore People in different Categories of Life using
                        Numerology
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Discover the unique traits and characteristics of
                        individuals based on their life path numbers.
                    </CardDescription>
                </Card>
                {politicsCelebs ? (
                    <Categories title="Politics" celebrities={politicsCelebs} />
                ) : null}
                {footballCelebs ? (
                    <Categories title="Football" celebrities={footballCelebs} />
                ) : null}
                {mmaCelebs ? (
                    <Categories title="MMA" celebrities={mmaCelebs} />
                ) : null}

                {influencerCelebs ? (
                    <Categories
                        title="Influencer"
                        celebrities={influencerCelebs}
                    />
                ) : null}
            </div>
        </div>
    );
}
