import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogProps,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { ChevronRight, Mail } from 'lucide-react';
import Link from 'next/link';

import { navigation } from '@/utils/navigation';

import { useCelebrityProps } from '@/lib/context/celebrity-props';

export const LoginRequiredAlertDialog = ({ ...props }: AlertDialogProps) => {
    const celebrityProps = useCelebrityProps();
    return (
        <AlertDialog {...props}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-1.5">
                        <Mail className="size-5" />
                        <span>Login required to perform the action</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        In order to like or comment you need to be logged in.
                        Click on the button down below to continue to the login
                        page.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Link
                            href={navigation.login.redirect(
                                navigation.celebrity.detail(
                                    celebrityProps.celebProfile.id,
                                ),
                            )}
                            className="flex items-center"
                        >
                            <span>Login</span>
                            <ChevronRight />
                        </Link>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
