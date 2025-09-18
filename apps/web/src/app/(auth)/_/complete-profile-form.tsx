'use client';

import { isDevelopment } from '@/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Calendar } from '@workspace/ui/components/calendar';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import { format } from 'date-fns';
import { ChevronDownIcon, Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { updateUserProfile } from '@/utils/server-actions/update-user-profile';

const formSchema = z.object({
    dob: z.date({
        required_error: 'A date of birth is required.',
    }),
    nickname: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export const CompleteProfileForm = () => {
    const router = useRouter();
    const { mutate: updateUserProfileMutate, isPending: isUserProfilePending } =
        useMutation<
            unknown,
            Error,
            {
                nickname?: string;
                birthDate: Date;
            }
        >({
            mutationFn: ({ birthDate, nickname }) =>
                updateUserProfile({
                    birthDate: format(birthDate, 'yyyy-MM-dd'),
                    nickname,
                }),
            onSuccess: () => {
                const searchParams = new URLSearchParams();
                searchParams.set('onboarding', 'success');
                router.push(`/?${searchParams.toString()}`);
            },
            onError: () => {
                toast('Failed updating profile. Please try again.');
            },
        });

    const onSubmit = (values: FormSchema) => {
        updateUserProfileMutate({
            birthDate: values.dob,
            ...(values.nickname?.trim()
                ? { nickname: values.nickname.trim() }
                : {}),
        });
    };

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nickname: isDevelopment ? 'Gio' : '',
        },
    });

    const [open, setOpen] = React.useState(false);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col justify-center items-center h-full w-full max-w-sm mx-auto px-3 space-y-4"
            >
                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem className="w-full flex flex-col">
                            <FormLabel>Date of birth*</FormLabel>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            id="date"
                                            className="w-full h-12 justify-between font-normal"
                                        >
                                            {field.value
                                                ? field.value.toLocaleDateString()
                                                : 'Select your date of birth'}
                                            <ChevronDownIcon />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        captionLayout="dropdown"
                                        onSelect={(date) => {
                                            field.onChange(date);
                                            setOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormDescription>
                                Your date of birth is used to calculate your
                                numerological profile. :)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nickname"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Nickname</FormLabel>
                            <FormControl>
                                <Input className="h-12" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    disabled={isUserProfilePending}
                    className="w-full"
                    type="submit"
                    size="lg"
                >
                    {isUserProfilePending ? (
                        <Loader2Icon className="animate-spin" />
                    ) : null}
                    {'Complete Profile'}
                </Button>
            </form>
        </Form>
    );
};
