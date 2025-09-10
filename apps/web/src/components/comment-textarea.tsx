import { queryHooks } from '@/hooks/queries';
import { Button } from '@workspace/ui/components/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { Mail } from 'lucide-react';
import { ComponentPropsWithRef } from 'react';

export const CommentTextarea = ({
    onCancel,
    onSend,
    ...props
}: ComponentPropsWithRef<'textarea'> & {
    onCancel?: () => void;
    onSend?: () => void;
}) => {
    const { data: session } = queryHooks.suspense.useAuthSession();

    const textareaEl = (
        <textarea
            {...props}
            data-slot="textarea"
            className={'outline-none text-sm min-w-16 w-full resize-y'}
        />
    );
    return (
        <div className="relative flex flex-col gap-1.5 border-input dark:bg-input/30 w-full rounded-md border bg-transparent px-3 py-4 text-base shadow-xs overflow-hidden">
            {session ? (
                textareaEl
            ) : (
                <Tooltip>
                    <TooltipTrigger>{textareaEl}</TooltipTrigger>
                    <TooltipContent className="flex items-center gap-1">
                        <Mail className="size-4" />
                        <span className="font-medium">
                            Login is required to comment
                        </span>{' '}
                    </TooltipContent>
                </Tooltip>
            )}

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
