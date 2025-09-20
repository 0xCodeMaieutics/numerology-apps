'use client';

import { queryHooks, queryKeys } from '@/hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import { IComment, IReply } from '@workspace/db/nosql';
import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';
import { cn } from '@workspace/ui/lib/utils';
import { Heart, MessageCircle, Share } from 'lucide-react';
import { RefObject, useRef, useState } from 'react';
import { toast } from 'sonner';

import { sleep } from '@/utils/sleep';

import { useCelebrityProps } from '@/lib/context/celebrity-props';

import { CommentContent } from './comment-content';
import { CommentTextarea } from './comment-textarea';
import { EmptyComments } from './empty-comments';
import { LoginRequiredAlertDialog } from './login-required-alert-dialog';

const DEFAULT_SKIP = 0;
const DEFAULT_LIMIT = 5;

export const CommentSection = () => {
    const [skip, setSkip] = useState(DEFAULT_SKIP);
    const celebrityProps = useCelebrityProps();
    const session = queryHooks.suspense.useAuthSession();
    const commentCounts = queryHooks.query.comments.useCount();
    const { mutate: likeCelebrity } =
        queryHooks.mutation.celebrity.useLikeCelebrity({
            onSuccess: () => {
                const userLikedKey = queryKeys
                    .celebrity(celebProfile.id)
                    .users(session?.data?.user.id)
                    .liked();
                const celebKey = queryKeys.celebrity(celebProfile.id).default;
                queryClient.setQueryData<{
                    liked: boolean;
                }>(userLikedKey, (liked) => ({
                    liked: liked ? !liked.liked : false,
                }));

                queryClient.setQueryData(celebKey, {
                    ...celebProfile,
                    totalLikes:
                        (celebProfile?.totalLikes ?? 0) +
                        (liked.liked ? -1 : 1),
                });
            },
            onError: () => {
                const userLikedKey = queryKeys
                    .celebrity(celebProfile.id)
                    .users(session?.data?.user.id)
                    .liked();
                const celebKey = queryKeys.celebrity(celebProfile.id).default;
                queryClient.setQueryData<{
                    liked: boolean;
                }>(userLikedKey, (liked) => ({
                    liked: liked ? !liked.liked : false,
                }));
                queryClient.setQueryData(celebKey, {
                    ...celebProfile,
                    totalLikes:
                        (celebProfile?.totalLikes ?? 0) +
                        (liked.liked ? -1 : 1),
                });
                toast.error('Something went wrong');
            },
        });

    const { mutate: relyCommentMutate } =
        queryHooks.mutation.comments.useReplyComment({
            onSuccess: ({ replyTextarea }) => {
                replyTextarea.current!.value = '';
                setReplyCommentId(null);
                queryClient.setQueryData(
                    queryKeys.celebrity(celebProfile.id).commentsCount,
                    (old: number | undefined) => (old ?? 0) + 1,
                );
                queryClient.invalidateQueries({
                    queryKey: queryKeys.comments({
                        celebrityId: celebProfile.id,
                        userId: session?.data?.user.id,
                    }),
                });
            },
            onError: () => {
                toast.error('Reply failed to post');
            },
        });
    const { mutate: likeComment } =
        queryHooks.mutation.celebrity.useLikeComment({
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.comments({
                        celebrityId: celebrityProps.celebProfile.id,
                        userId: session?.data?.user.id,
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
                        celebrityId: celebrityProps.celebProfile.id,
                        userId: session?.data?.user.id,
                    }),
                });
            },
            onError: () => {
                toast.error('Something went wrong');
            },
        });

    const { mutate: mutateComment } = queryHooks.mutation.comments.useComment({
        onSuccess: () => {
            textarea.current!.value = '';
            queryClient.setQueryData(
                queryKeys.celebrity(celebProfile.id).commentsCount,
                (old: number | undefined) => (old ?? 0) + 1,
            );

            queryClient.invalidateQueries({
                queryKey: queryKeys.comments({
                    celebrityId: celebProfile.id,
                    userId: session?.data?.user.id,
                }),
            });
        },
        onError: () => {
            toast.error('Comment failed to post');
        },
    });

    const { data: celebProfile } = queryHooks.suspense.useCelebrity(
        celebrityProps.celebProfile.id,
    );

    const [isLoginRequiredAlertDialogOpen, setLoginAlertDialogOpen] =
        useState(false);
    const queryClient = useQueryClient();
    const { data: liked } = queryHooks.suspense.useLiked({
        celebrityId: celebProfile.id,
        userId: session?.data?.user.id as string,
    });
    const [replyCommentId, setReplyCommentId] = useState<string | null>(null);

    const { data: commentsCount } =
        queryHooks.suspense.useCelebrityCommentsCount(celebProfile.id);

    const { data: comments } = queryHooks.suspense.useComments({
        skip,
        limit: DEFAULT_LIMIT,
        replySkip: 0,
        replyLimit: 3,
        sortBy: {
            createdAt: 'desc',
            replyCreatedAt: 'asc',
        },
    });
    const textarea = useRef<HTMLTextAreaElement>(null);
    const replyTextarea = useRef<HTMLTextAreaElement>(null);
    const replyTextarea2 = useRef<HTMLTextAreaElement>(null);

    const onReplySendHandler = async ({
        parentId,
        repliedComment,
        replyTextarea,
    }: {
        parentId: string;
        repliedComment: IReply | IComment;
        replyTextarea: RefObject<HTMLTextAreaElement | null>;
    }) => {
        if (!session) return;
        if (!replyCommentId) return;

        const value = replyTextarea.current?.value?.trim() ?? '';
        if (value?.length === 0) return;

        relyCommentMutate({
            comment: value,
            parentId,
            repliedComment,
            replyTextarea,
        });
    };

    const onCelebrityLikeHandler = async () => {
        if (!session) {
            setLoginAlertDialogOpen(true);
            return;
        }
        likeCelebrity({
            prevLikes: celebProfile.totalLikes ?? 0,
            liked: liked.liked,
        });
    };

    const onCommentHandler = async () => {
        if (!session.data || !session.data?.user.id) {
            setLoginAlertDialogOpen(true);
            return;
        }
        if (textarea.current?.value?.length === 0) return;
        mutateComment(textarea.current?.value ?? '');
    };

    const onCommentLikeHandler = async (commentId: string) => {
        if (!session.data || !session.data?.user.id)
            return setLoginAlertDialogOpen(true);

        const foundComment = comments?.find(
            (comment) => comment._id === commentId,
        );
        if (!foundComment || typeof foundComment.likes !== 'number') return;
        if (foundComment.isLikedByUser) {
            unlikeComment(commentId);
        } else {
            likeComment(commentId);
        }
    };

    const onReplyLikeHandler = async ({
        commentId,
        replyId,
    }: {
        commentId: string;
        replyId: string;
    }) => {
        if (!session.data || !session.data?.user.id)
            return setLoginAlertDialogOpen(true);
        const foundComment = comments?.find(
            (comment) => comment._id === commentId,
        );
        if (!foundComment?.replies) return;
        const foundReply = foundComment.replies.find(
            (reply) => reply._id === replyId,
        );
        if (!foundReply || typeof foundReply.likes !== 'number') return;
        if (foundReply.isLikedByUser) {
            unlikeComment(replyId);
        } else {
            likeComment(replyId);
        }
    };

    const onReplyClickHandler = async ({
        comment,
        textAreaEl,
    }: {
        comment: IReply | IComment;
        textAreaEl: RefObject<HTMLTextAreaElement | null>;
    }) => {
        if (!session) return setLoginAlertDialogOpen(true);
        setReplyCommentId(comment._id);
        if (!textAreaEl.current) {
            await sleep(100);
        }
        if (textAreaEl.current) textAreaEl.current.focus();
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
                            const sendReply = () =>
                                onReplySendHandler({
                                    parentId: comment._id,
                                    repliedComment: comment,
                                    replyTextarea,
                                });
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
                                            onReplyClickHandler({
                                                comment,
                                                textAreaEl: replyTextarea,
                                            })
                                        }
                                        comment={comment}
                                    />
                                    {(comment?.replies?.length ?? 0) > 0 ? (
                                        <Separator />
                                    ) : null}

                                    <div className="ml-7">
                                        <div className="flex flex-col gap-4">
                                            {comment.replies?.map((reply) => {
                                                const sendReply = () =>
                                                    onReplySendHandler({
                                                        parentId: comment._id,
                                                        repliedComment: reply,
                                                        replyTextarea:
                                                            replyTextarea2,
                                                    });
                                                return (
                                                    <div
                                                        className="space-y-5"
                                                        key={reply._id}
                                                    >
                                                        <CommentContent
                                                            onLike={() =>
                                                                onReplyLikeHandler(
                                                                    {
                                                                        commentId:
                                                                            comment._id,
                                                                        replyId:
                                                                            reply._id,
                                                                    },
                                                                )
                                                            }
                                                            onReply={() =>
                                                                onReplyClickHandler(
                                                                    {
                                                                        comment:
                                                                            reply,
                                                                        textAreaEl:
                                                                            replyTextarea2,
                                                                    },
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
                                                                        replyTextarea2
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
                                                                            sendReply();
                                                                    }}
                                                                    onCancel={() =>
                                                                        setReplyCommentId(
                                                                            null,
                                                                        )
                                                                    }
                                                                    onSend={() =>
                                                                        sendReply()
                                                                    }
                                                                    placeholder="Write a comment..."
                                                                />
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            })}
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
                                                        sendReply();
                                                }}
                                                onCancel={() =>
                                                    setReplyCommentId(null)
                                                }
                                                onSend={sendReply}
                                                placeholder="Write a comment..."
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                        {(commentCounts?.data ?? 0) > DEFAULT_LIMIT ? (
                            <button>Load more</button>
                        ) : null}
                    </div>
                ) : (
                    <EmptyComments />
                )}
            </div>
            <LoginRequiredAlertDialog
                open={isLoginRequiredAlertDialogOpen}
                onOpenChange={setLoginAlertDialogOpen}
            />
        </>
    );
};
