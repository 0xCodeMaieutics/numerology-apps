'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Separator } from '@workspace/ui/components/separator';
import { Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { authClient } from '@/lib/auth-client';

const isDevelopment = process.env.NODE_ENV === 'development';
const DEV_EMAIL = 'gio.shara12345@gmail.com';
const DEV_PASSWORD = '12345678';
const DEV_NAME = 'Gio Shara';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 64;

const formSchema = z.object({
    email: z
        .string()
        .email('Invalid email address')
        .min(1, 'Email is required'),
    password: z
        .string()
        .min(
            MIN_PASSWORD_LENGTH,
            `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        )
        .max(
            MAX_PASSWORD_LENGTH,
            `Password must be at most ${MAX_PASSWORD_LENGTH} characters`,
        ),
    name: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export const ClientContent = () => {
    const params = useSearchParams();
    const router = useRouter();
    const [loginType, setLoginType] = useState<'sign-up' | 'login'>('login');

    const isRedirectVulnerable = (redirect: string) =>
        ['http://', 'https://']
            .map((prefix) => redirect.startsWith(prefix))
            .some(Boolean);
    const { mutate: signInWithGoogle, isPending: isGooglePending } =
        useMutation({
            mutationFn: () => {
                const redirect = params.get('redirect');
                const isVulnerableRedirect = redirect
                    ? isRedirectVulnerable(redirect)
                    : false;
                return authClient.signIn.social({
                    provider: 'google',
                    callbackURL: redirect
                        ? isVulnerableRedirect
                            ? '/'
                            : redirect
                        : '/',
                });
            },
            onError: () => {
                toast('Failed to sign in with Google');
            },
        });

    const { mutate: signInWithEmail, isPending: isEmailPending } = useMutation<
        {},
        Error,
        {
            email: string;
            name?: string;
            password: string;
            type: 'login' | 'sign-up';
        }
    >({
        mutationFn: async ({ email, password, name, type }) => {
            if (type === 'login')
                return authClient.signIn.email({
                    email,
                    password,
                });

            return authClient.signUp.email({
                email,
                password,
                name: name ?? '',
            });
        },
        onSuccess: () => {
            const redirect = params.get('redirect');
            if (redirect) {
                if (isRedirectVulnerable(redirect)) router.push('/');
                else router.push(redirect);
            } else {
                router.push('/');
            }
        },
        onError: () => {
            toast('Failed to sign in with Email');
        },
    });

    const onSubmit = async (values: FormSchema) => {
        signInWithEmail({
            email: values.email,
            password: values.password,
            name: values.name,
            type: loginType,
        });
    };

    const getButtonText = () => {
        if (loginType === 'sign-up') return 'Sign up';
        return 'Log in';
    };

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: isDevelopment ? DEV_EMAIL : '',
            password: isDevelopment ? DEV_PASSWORD : '',
            name: isDevelopment ? DEV_NAME : '',
        },
    });

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full px-3 space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address*</FormLabel>
                                <FormControl>
                                    <Input className="h-12" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password*</FormLabel>
                                <FormControl>
                                    <Input
                                        className="h-12"
                                        {...field}
                                        type="password"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {loginType === 'sign-up' ? (
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Name{' '}
                                        <span className="text-muted-foreground">
                                            (optional)
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            className="h-12"
                                            type="text"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ) : null}

                    <Button
                        disabled={isEmailPending}
                        className="w-full"
                        type="submit"
                        size="lg"
                    >
                        {isEmailPending ? (
                            <Loader2Icon className="animate-spin" />
                        ) : null}
                        {getButtonText()}
                    </Button>
                </form>
            </Form>

            <div className="w-full px-3 flex items-center gap-2">
                <Separator className="flex-1" />
                <span>or</span>
                <Separator className="flex-1" />
            </div>

            <div className="w-full px-3 space-y-3">
                <Button
                    variant={'secondary'}
                    onClick={() => {
                        signInWithGoogle();
                    }}
                    size={'lg'}
                    className="w-full"
                    disabled={isGooglePending}
                >
                    {isGooglePending ? (
                        <Loader2Icon className="animate-spin" />
                    ) : null}
                    <Image
                        width={16}
                        height={16}
                        alt="Google icon"
                        src={'/socials/google.svg'}
                    />
                    Sign up with Google
                </Button>
            </div>

            <div className="text-sm">
                <span className="text-muted-foreground">Switch to</span>{' '}
                <button
                    onClick={() =>
                        setLoginType(
                            loginType === 'sign-up' ? 'login' : 'sign-up',
                        )
                    }
                    className="underline font-medium"
                >
                    {loginType === 'sign-up' ? 'Log in' : 'Sign up'}
                </button>
            </div>
        </>
    );
};
