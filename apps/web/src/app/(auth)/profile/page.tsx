import Link from 'next/link';

export default function ProfilePage() {
    return (
        <div className="min-h-svh w-full mx-auto max-w-3xl space-y-6">
            <h1>Profile</h1>
            <Link href={'/'}>Go to Home</Link>
        </div>
    );
}
