'use client';

import { queryHooks, queryKeys } from '@/hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import { ICelebrityCommentBaseWithoutObjectId } from '@workspace/db/nosql';
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
    const { mutate: likeComment } =
        queryHooks.mutation.celebrity.useLikeComment({
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.comments({
                        celebrityId,
                        userId,
                    }),
                });
            },
            onError: () => {
                toast.error('Something went wrong');
            },
        });

    const { mutate: unlikeComment } =
        queryHooks.mutation.celebrity.useUnlikeComment({
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.comments({
                        celebrityId,
                        userId,
                    }),
                });
            },
            onError: () => {
                toast.error('Something went wrong');
            },
        });

    const { data: celebProfile } =
        queryHooks.suspense.useCelebrity(celebrityId);
    const { data: session } = queryHooks.suspense.useAuthSession(userId);

    const [isLoginRequiredAlertDialogOpen, setLoginAlertDialogOpen] =
        useState(false);

    const queryClient = useQueryClient();
    const { data: liked } = queryHooks.suspense.useLiked({
        celebrityId: celebProfile.id,
        userId: session?.user.id as string,
    });
    const [replyCommentId, setReplyCommentId] = useState<string | null>(null);

    const { data: commentsCount } =
        queryHooks.suspense.useCelebrityCommentsCount(celebProfile.id);

    const { data: comments } = queryHooks.suspense.useComments({
        celebrityId: celebProfile.id,
        userId: session?.user?.id,
    });
    const textarea = useRef<HTMLTextAreaElement>(null);
    const replyTextarea = useRef<HTMLTextAreaElement>(null);

    const onReplySendHandler = async (parentId: string) => {
        if (!session) return;

        const value = replyTextarea.current?.value?.trim() ?? '';
        if (value?.length === 0) return;
        await replyServerAction({
            author: session.user.name || 'Anonymous',
            parentId,
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
            queryKey: queryKeys.comments({
                celebrityId: celebProfile.id,
                userId: session?.user?.id,
            }),
        });
    };

    const onCelebrityLikeHandler = async () => {
        if (!session) {
            setLoginAlertDialogOpen(true);
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
            // TODO: implement mutation
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
            setLoginAlertDialogOpen(true);
            return;
        }
        const value = textarea.current?.value?.trim() ?? '';
        if (value?.length === 0) return;
        // TODO: implement mutation
        await commentServerAction({
            author: session.user.name || 'Anonymous',
            authorId: session.user.id,
            celebrityId: celebProfile.id,
            comment: value ?? '',
            likes: 0,
            userId: session.user.id,
        });
        textarea.current!.value = '';

        queryClient.setQueryData(
            queryKeys.celebrity(celebProfile.id).commentsCount,
            (old: number | undefined) => (old ?? 0) + 1,
        );

        queryClient.invalidateQueries({
            queryKey: queryKeys.comments({
                celebrityId: celebProfile.id,
                userId: session?.user?.id,
            }),
        });
    };

    const onCommentLikeHandler = async (commentId: string) => {
        if (!session) return setLoginAlertDialogOpen(true);

        const foundComment = comments?.find(
            (comment) => comment._id === commentId,
        );
        if (!foundComment || typeof foundComment.likes !== 'number') return;

        if (foundComment.isLikedByUser) {
            unlikeComment({
                commentId,
                userId: session.user.id,
            });
        } else {
            likeComment({
                commentId,
                userId: session.user.id,
            });
        }
    };

    const onReplyLikeHandler = async ({
        commentId,
        replyId,
    }: {
        commentId: string;
        replyId: string;
    }) => {
        if (!session) return setLoginAlertDialogOpen(true);
        const foundComment = comments?.find(
            (comment) => comment._id === commentId,
        );
        if (!foundComment?.replies) return;
        const foundReply = foundComment.replies.find(
            (reply) => reply._id === replyId,
        );
        if (!foundReply || typeof foundReply.likes !== 'number') return;
        if (foundReply.isLikedByUser) {
            unlikeComment({
                commentId: replyId,
                userId: session.user.id,
            });
        } else {
            likeComment({
                commentId: replyId,
                userId: session.user.id,
            });
        }
    };

    const onReplyClickHandler = async (
        comment: ICelebrityCommentBaseWithoutObjectId,
    ) => {
        if (!session) return setLoginAlertDialogOpen(true);
        const replyEl = replyTextarea.current;
        setReplyCommentId(comment._id);
        if (!replyEl) await sleep(50);
        if (!replyEl) return;
        replyEl.focus();
    };

    return (
        <>
            <div className="flex items-center gap-1.5">
                <Button onClick={onCelebrityLikeHandler} variant={'secondary'}>
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
                        if (!session) setLoginAlertDialogOpen(true);
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
                        {comments.map((comment) => {
                            return (
                                <div
                                    key={comment._id}
                                    className="space-y-4 border border-border rounded-xl p-4"
                                >
                                    <CommentContent
                                        onLike={() =>
                                            onCommentLikeHandler(comment._id)
                                        }
                                        likes={comment.likes}
                                        onReply={() =>
                                            onReplyClickHandler(comment)
                                        }
                                        comment={comment}
                                    />
                                    {comment?.replies?.length > 0 ? (
                                        <Separator />
                                    ) : null}

                                    <div className="ml-7">
                                        <div className="flex flex-col gap-4">
                                            {comment.replies?.map((reply) => (
                                                <div
                                                    className="space-y-5"
                                                    key={reply._id}
                                                >
                                                    <CommentContent
                                                        onLike={() =>
                                                            onReplyLikeHandler({
                                                                commentId:
                                                                    comment._id,
                                                                replyId:
                                                                    reply._id,
                                                            })
                                                        }
                                                        onReply={() =>
                                                            onReplyClickHandler(
                                                                reply,
                                                            )
                                                        }
                                                        comment={reply}
                                                        likes={reply.likes}
                                                    />

                                                    {replyCommentId ===
                                                    reply._id ? (
                                                        <div className="mt-2">
                                                            <CommentTextarea
                                                                ref={
                                                                    replyTextarea
                                                                }
                                                                replyName={
                                                                    comment.author
                                                                }
                                                                disabled={
                                                                    !session
                                                                }
                                                                onKeyDown={(
                                                                    e,
                                                                ) => {
                                                                    if (
                                                                        e.key ===
                                                                            'Enter' &&
                                                                        e.altKey
                                                                    )
                                                                        onReplySendHandler(
                                                                            comment._id,
                                                                        );
                                                                }}
                                                                onCancel={() =>
                                                                    setReplyCommentId(
                                                                        null,
                                                                    )
                                                                }
                                                                onSend={() =>
                                                                    onReplySendHandler(
                                                                        comment._id,
                                                                    )
                                                                }
                                                                placeholder="Write a comment..."
                                                            />
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {replyCommentId === comment._id ? (
                                        <div className="mt-2">
                                            <CommentTextarea
                                                ref={replyTextarea}
                                                replyName={comment.author}
                                                disabled={!session}
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === 'Enter' &&
                                                        e.altKey
                                                    )
                                                        onReplySendHandler(
                                                            comment._id,
                                                        );
                                                }}
                                                onCancel={() =>
                                                    setReplyCommentId(null)
                                                }
                                                onSend={() =>
                                                    onReplySendHandler(
                                                        comment._id,
                                                    )
                                                }
                                                placeholder="Write a comment..."
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyComments />
                )}
            </div>
            <LoginRequiredAlertDialog
                open={isLoginRequiredAlertDialogOpen}
                onOpenChange={setLoginAlertDialogOpen}
                celebrityId={celebrityId}
            />
        </>
    );
};
