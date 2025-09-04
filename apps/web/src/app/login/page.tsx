import { Logo } from '@/components/logo';

import { ClientContent } from './_/client-content';

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-sm mx-auto space-y-8">
            <div className="flex flex-col justify-center items-center space-y-2">
                <h1 className="flex gap-1.5 items-center text-2xl font-semibold">
                    Welcome to{' '}
                    <div className="relative -top-0.5 max-w-fit">
                        <Logo />
                    </div>
                </h1>
            </div>
            <ClientContent />
        </div>
    );
}
