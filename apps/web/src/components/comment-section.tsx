'use client';

import { DBQueries } from '@workspace/db';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { Heart, MessageCircle, Share } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

export const CommentSection = ({
    celebProfile,
}: {
    celebProfile: DBQueries['select']['celebrities'];
}) => {
    const textarea = useRef<HTMLTextAreaElement>(null);

    return (
        <>
            <div className="flex items-center gap-1.5">
                <Button variant={'secondary'}>
                    <Heart />
                    <span>Like</span>
                    <span>{celebProfile?.totalLikes}</span>
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
