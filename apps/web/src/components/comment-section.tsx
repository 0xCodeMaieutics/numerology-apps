'use client';

import { DBQueries } from '@workspace/db';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { cn } from '@workspace/ui/lib/utils';
import { Heart, MessageCircle, Share } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { navigation } from '@/utils/navigation';
import { likeCelebrity } from '@/utils/server-actions/liked-celebrity';

import { authClient } from '@/lib/auth-client';

export const CommentSection = ({
    celebProfile,
    ...props
}: {
    celebProfile: DBQueries['select']['celebrities'];
    liked: boolean;
}) => {
    const [likes, setLikes] = useState<number>(celebProfile?.totalLikes ?? 0);
    const [liked, setLiked] = useState<boolean>(props.liked);
    const router = useRouter();
    const textarea = useRef<HTMLTextAreaElement>(null);

    const session = authClient.useSession();

    return (
        <>
            <div className="flex items-center gap-1.5">
                <Button
                    onClick={async () => {
                        if (!session.data) {
                            router.push(
                                navigation.login.redirect(
                                    '/celebrity/' + celebProfile.id,
                                ),
                            );
                        } else {
                            setLiked(!liked);
                            setLikes((prev) => (liked ? prev - 1 : prev + 1));
                            try {
                                await likeCelebrity({
                                    celebrityId: celebProfile.id,
                                    prevLikes: celebProfile.totalLikes ?? 0,
                                    oldLiked: props.liked,
                                    userId: session.data.user.id,
                                });
                            } catch (err) {
                                toast.error('Something went wrong');
                                setLiked(liked);
                                setLikes((prev) =>
                                    liked ? prev + 1 : prev - 1,
                                );
                            }
                        }
                    }}
                    variant={'secondary'}
                >
                    <Heart
                        className={cn({
                            'fill-red-600 stroke-red-600': liked,
                        })}
                    />
                    <span>Like</span>
                    <span>{likes}</span>
                </Button>
                <Button
                    onClick={() => {
                        textarea.current?.focus();
                    }}
                    variant={'secondary'}
                    className="rounded-full"
                >
                    <MessageCircle />
                    <span>{celebProfile?.totalComments}</span>
                </Button>
                <Button
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied to clipboard');
                    }}
                    variant={'secondary'}
                    className="rounded-full"
                >
                    <Share />
                </Button>
            </div>

            <div>
                <Textarea
                    ref={textarea}
                    className="max-h-60 rounded-xl p-3"
                    placeholder="Write a comment..."
                />
            </div>
        </>
    );
};
