'use client';

import { queryHooks, queryKeys } from '@/hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';
import { cn } from '@workspace/ui/lib/utils';
import { Heart, MessageCircle, Share } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { commentServerAction } from '@/utils/server-actions/comment';
import { likeCelebrity } from '@/utils/server-actions/liked-celebrity';
import { replyServerAction } from '@/utils/server-actions/reply';
import { sleep } from '@/utils/sleep';

import { CommentContent } from './comment-content';
import { CommentTextarea } from './comment-textarea';
import { EmptyComments } from './empty-comments';
import { LoginRequiredAlertDialog } from './login-required-alert-dialog';

export const CommentSection = ({
    celebrityId,
    userId,
}: {
    celebrityId: string;
    userId?: string;
}) => {
    const { data: celebProfile } =
        queryHooks.suspense.useCelebrity(celebrityId);
    const { data: session } = queryHooks.suspense.useAuthSession(userId);

    const [open, setOpen] = useState(false);

    const queryClient = useQueryClient();
    const { data: liked } = queryHooks.suspense.useLiked({
        celebrityId: celebProfile.id,
        userId: session?.user.id as string,
    });
    const [replyCommentId, setReplyCommentId] = useState<string | null>(null);

    const { data: commentsCount } =
        queryHooks.suspense.useCelebrityCommentsCount(celebProfile.id);
    const { data: comments } = queryHooks.suspense.useComments(celebProfile.id);
    const textarea = useRef<HTMLTextAreaElement>(null);
    const replyTextarea = useRef<HTMLTextAreaElement>(null);

    const onReplyHandler = async () => {
        if (!session) return;

        const value = replyTextarea.current?.value?.trim() ?? '';
        if (value?.length === 0) return;
        await replyServerAction({
            author: session.user.name || 'Anonymous',
            parentId: replyCommentId as string,
            authorId: session?.user.id,
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

    const onLikeHandler = async () => {
        if (!session) {
            setOpen(true);
            return;
        }
        const userLikedKey = queryKeys
            .celebrity(celebProfile.id)
            .users(session.user.id)
            .liked();
        const celebKey = queryKeys.celebrity(celebProfile.id).default;
        queryClient.setQueryData<{ liked: boolean }>(userLikedKey, (liked) => ({
            liked: liked ? !liked.liked : false,
        }));

        queryClient.setQueryData(celebKey, {
            ...celebProfile,
            totalLikes:
                (celebProfile?.totalLikes ?? 0) + (liked.liked ? -1 : 1),
        });
        try {
            await likeCelebrity({
                celebrityId: celebProfile.id,
                prevLikes: celebProfile.totalLikes ?? 0,
                oldLiked: liked.liked,
                userId: session.user.id,
            });
        } catch (err) {
            toast.error('Something went wrong');
            queryClient.setQueryData<{ liked: boolean }>(
                userLikedKey,
                (liked) => ({ liked: liked ? !liked.liked : false }),
            );
            queryClient.setQueryData(celebKey, {
                ...celebProfile,
                totalLikes:
                    (celebProfile?.totalLikes ?? 0) + (liked.liked ? -1 : 1),
            });
        }
    };

    const onCommentHandler = async () => {
        if (!session) {
            setOpen(true);
            return;
        }
        const value = textarea.current?.value?.trim() ?? '';
        if (value?.length === 0) return;
        await commentServerAction({
            author: session.user.name || 'Anonymous',
            authorId: session.user.id,
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

    const onReplyCommentLikeHandler = () => {
        if (!session) {
            setOpen(true);
            return;
        }
    };

    return (
        <>
            <div className="flex items-center gap-1.5">
                <Button onClick={onLikeHandler} variant={'secondary'}>
                    <Heart
                        className={cn({
                            'fill-red-600 stroke-red-600': liked.liked,
                        })}
                    />
                    <span>Like</span>
                    <span>{celebProfile.totalLikes}</span>
                </Button>
                <Button
                    onClick={() => {
                        if (!session) setOpen(true);
                        else textarea.current?.focus();
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
                disabled={!session}
                onKeyDown={async (e) => {
                    if (e.key === 'Enter' && e.altKey) onCommentHandler();
                }}
                onSend={onCommentHandler}
                placeholder="Write a comment..."
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
                                    onLike={onReplyCommentLikeHandler}
                                    likes={comment.likes}
                                    onReply={async () => {
                                        if (!session) {
                                            setOpen(true);
                                            return;
                                        }
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
                                                onLike={
                                                    onReplyCommentLikeHandler
                                                }
                                                onReply={async () => {
                                                    if (!session) {
                                                        setOpen(true);
                                                        return;
                                                    }
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
                                                disabled={!session}
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === 'Enter' &&
                                                        e.altKey
                                                    )
                                                        onReplyHandler();
                                                }}
                                                onCancel={() =>
                                                    setReplyCommentId(null)
                                                }
                                                onSend={onReplyHandler}
                                                placeholder="Write a comment..."
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
            <LoginRequiredAlertDialog
                open={open}
                onOpenChange={setOpen}
                celebrityId={celebrityId}
            />
        </>
    );
};
