'use client';

import { queryHooks, queryKeys } from '@/hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import { SQLDBQueries } from '@workspace/db/sql';
import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';
import { cn } from '@workspace/ui/lib/utils';
import { Heart, MessageCircle, Share } from 'lucide-react';
import { ComponentPropsWithRef, useRef, useState } from 'react';
import { toast } from 'sonner';

import { commentServerAction } from '@/utils/server-actions/comment';
import { likeCelebrity } from '@/utils/server-actions/liked-celebrity';
import { replyServerAction } from '@/utils/server-actions/reply';
import { sleep } from '@/utils/sleep';

import { authClient } from '@/lib/auth-client';

import { CommentContent } from './comment-content';
import { EmptyComments } from './empty-comments';

const CommentTextarea = ({
    onCancel,
    onSend,
    ...props
}: ComponentPropsWithRef<'textarea'> & {
    onCancel?: () => void;
    onSend?: () => void;
}) => {
    return (
        <div className="relative flex flex-col gap-1.5 border-input dark:bg-input/30 w-full rounded-md border bg-transparent px-3 py-4 text-base shadow-xs overflow-hidden">
            <textarea
                {...props}
                ref={props.ref}
                onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = '0px';
                    target.style.height = target.scrollHeight + 'px';
                }}
                data-slot="textarea"
                className={'outline-none text-sm min-w-16 w-full resize-y'}
                placeholder="Write a comment..."
            />
            <div className="flex justify-end pb-0 p-1.5 bg-transparent">
                <div className="flex items-center gap-1.5">
                    {typeof onCancel !== 'undefined' ? (
                        <Button
                            size={'sm'}
                            variant={'ghost'}
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                    ) : null}
                    <Button size={'sm'} variant={'secondary'} onClick={onSend}>
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const CommentSection = ({
    celebProfile,
}: {
    celebProfile: SQLDBQueries['select']['celebrities'];
}) => {
    const { data: celebrity } = queryHooks.suspense.useCelebrity(
        celebProfile.id,
    );
    const queryClient = useQueryClient();
    const { data: liked } = queryHooks.suspense.useLiked({
        celebrityId: celebProfile.id,
        userId: authClient.useSession().data?.user.id as string,
    });

    const [replyCommentId, setReplyCommentId] = useState<string | null>(null);

    const { data: commentsCount } =
        queryHooks.suspense.useCelebrityCommentsCount(celebProfile.id);
    const { data: comments } = queryHooks.suspense.useComments(celebProfile.id);
    const textarea = useRef<HTMLTextAreaElement>(null);
    const replyTextarea = useRef<HTMLTextAreaElement>(null);

    const session = authClient.useSession();

    const onReplyHandler = async () => {
        const value = replyTextarea.current?.value?.trim() ?? '';
        if (value?.length === 0) return;
        if (!session.data) return;
        await replyServerAction({
            author: session.data.user.name || 'Anonymous',
            parentId: replyCommentId as string,
            authorId: session.data?.user.id,
            celebrityId: celebProfile.id,
            comment: value,
            likes: 0,
        });
        replyTextarea.current!.value = '';

        setReplyCommentId(null);

        queryClient.setQueryData(
            queryKeys.celebrity(celebProfile.id).commentsCount,
            (old: number | undefined) => (old ?? 0) + 1,
        );

        queryClient.invalidateQueries({
            queryKey: queryKeys.comments(celebProfile.id),
        });
    };

    const onCommentLikeHandler = async () => {
        if (!session.data) return;
        queryClient.setQueryData(
            queryKeys.liked(celebProfile.id, session.data.user.id),
            !liked,
        );

        queryClient.setQueryData(queryKeys.celebrity(celebProfile.id).default, {
            ...celebrity,
            totalLikes: (celebrity?.totalLikes ?? 0) + (liked ? -1 : 1),
        });
        try {
            await likeCelebrity({
                celebrityId: celebProfile.id,
                prevLikes: celebProfile.totalLikes ?? 0,
                oldLiked: liked,
                userId: session.data.user.id,
            });
        } catch (err) {
            toast.error('Something went wrong');
            queryClient.setQueryData(
                queryKeys.liked(celebProfile.id, session.data.user.id),
                liked,
            );
            queryClient.setQueryData(
                queryKeys.celebrity(celebProfile.id).default,
                {
                    ...celebrity,
                    totalLikes: (celebrity?.totalLikes ?? 0) + (liked ? -1 : 1),
                },
            );
        }
    };

    const onCommentHandler = async () => {
        const value = textarea.current?.value?.trim() ?? '';
        if (value?.length === 0) return;
        if (!session.data) return;
        await commentServerAction({
            author: session.data.user.name || 'Anonymous',
            authorId: session.data.user.id,
            celebrityId: celebProfile.id,
            comment: value ?? '',
            likes: 0,
        });
        textarea.current!.value = '';

        queryClient.setQueryData(
            queryKeys.celebrity(celebProfile.id).commentsCount,
            (old: number | undefined) => (old ?? 0) + 1,
        );

        queryClient.invalidateQueries({
            queryKey: queryKeys.comments(celebProfile.id),
        });
    };

    return (
        <>
            <div className="flex items-center gap-1.5">
                <Button
                    onClick={async () => {
                        onCommentLikeHandler();
                    }}
                    variant={'secondary'}
                >
                    <Heart
                        className={cn({
                            'fill-red-600 stroke-red-600': liked,
                        })}
                    />
                    <span>Like</span>
                    <span>{celebrity.totalLikes}</span>
                </Button>
                <Button
                    onClick={() => {
                        textarea.current?.focus();
                    }}
                    variant={'secondary'}
                    className="rounded-full"
                >
                    <MessageCircle />
                    <span>{commentsCount}</span>
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

            <CommentTextarea
                ref={textarea}
                disabled={!session.data}
                onKeyDown={async (e) => {
                    if (e.key === 'Enter' && e.altKey) onCommentHandler();
                }}
                onSend={onCommentHandler}
                onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = '0px';
                    target.style.height = target.scrollHeight + 'px';
                }}
            />

            <div className="">
                {comments && comments.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {comments.map((comment) => (
                            <div
                                key={comment._id.toString()}
                                className="space-y-4 border border-border rounded-xl p-4"
                            >
                                <CommentContent
                                    likes={comment.likes}
                                    onReply={async () => {
                                        const replyEl = replyTextarea.current;
                                        setReplyCommentId(
                                            comment._id.toString(),
                                        );
                                        if (!replyEl) {
                                            await sleep(50);
                                        }
                                        if (!replyEl) return;
                                        replyEl.focus();
                                        const value = replyEl.value.trim();
                                        const authorHandle = `@${comment.author}`;
                                        const hasHandle =
                                            value.includes(authorHandle);
                                        if (hasHandle) return;
                                        if (!hasHandle && value.length > 0) {
                                            replyEl.value =
                                                `${authorHandle} ` + value;
                                        }
                                    }}
                                    comment={comment}
                                />
                                {comment?.replies?.length > 0 ? (
                                    <Separator />
                                ) : null}

                                <div className="ml-7">
                                    <div className="flex flex-col gap-4">
                                        {comment.replies?.map((reply) => (
                                            <CommentContent
                                                onReply={async () => {
                                                    const replyEl =
                                                        replyTextarea.current;
                                                    setReplyCommentId(
                                                        comment._id.toString(),
                                                    );
                                                    if (!replyEl) {
                                                        await sleep(50);
                                                    }
                                                    if (!replyEl) return;
                                                    replyEl.focus();
                                                    const value =
                                                        replyEl.value.trim();
                                                    const authorHandle = `@${comment.author}`;
                                                    const hasHandle =
                                                        value.includes(
                                                            authorHandle,
                                                        );
                                                    if (hasHandle) return;
                                                    if (
                                                        !hasHandle &&
                                                        value.length > 0
                                                    ) {
                                                        replyEl.value =
                                                            `${authorHandle} ` +
                                                            value;
                                                    }
                                                }}
                                                key={reply._id.toString()}
                                                comment={reply}
                                                likes={reply.likes}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    {replyCommentId ===
                                    comment._id.toString() ? (
                                        <div className="mt-2">
                                            <CommentTextarea
                                                ref={replyTextarea}
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === 'Enter' &&
                                                        e.altKey
                                                    ) {
                                                        onReplyHandler();
                                                    }
                                                }}
                                                onCancel={() => {
                                                    setReplyCommentId(null);
                                                }}
                                                onSend={() => {
                                                    onReplyHandler();
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyComments />
                )}
            </div>
        </>
    );
};
