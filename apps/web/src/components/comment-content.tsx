import { ICelebrityCommentBaseWithoutObjectId } from '@workspace/db/nosql';
import { cn } from '@workspace/ui/lib/utils';
import { Heart, MessageCircle } from 'lucide-react';

import { dates } from '@/utils/date';

export const CommentContent = (props: {
    comment: ICelebrityCommentBaseWithoutObjectId;
    likes: number;
    onReply?: () => void;
    onLike?: () => void;
}) => (
    <div className={'space-y-2.5'}>
        <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    {props.comment.author
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold">
                        {props.comment.author}{' '}
                    </span>
                    {props.comment.repliedAuthor &&
                    props.comment.repliedAuthorId ? (
                        <div className="text-muted-foreground text-xs">
                            replied to{' '}
                            <span className="font-semibold">
                                {props.comment.repliedAuthor}
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>

            <span className="text-sm text-muted-foreground">
                {dates.formatCommentDate(props.comment.createdAt!)}
            </span>
        </div>
        <div className="flex flex-col items-start gap-0.5">
            <p>{props.comment.comment}</p>
        </div>

        <div className="flex items-center gap-4">
            <button
                onClick={props.onReply}
                className="flex items-center gap-0.5 text-muted-foreground font-semibold text-sm"
            >
                <MessageCircle className="size-4" />
                <span>reply</span>
            </button>
            <button
                onClick={props.onLike}
                className="flex items-center gap-0.5 text-muted-foreground font-semibold text-sm"
            >
                <Heart
                    className={cn('size-4', {
                        'fill-red-600 stroke-red-600':
                            props.comment.isLikedByUser,
                    })}
                />
                <span>like {props.likes}</span>
            </button>
        </div>
    </div>
);
