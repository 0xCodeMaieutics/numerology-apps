import { Button } from '@workspace/ui/components/button';
import { ComponentPropsWithRef } from 'react';

export const CommentTextarea = ({
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
