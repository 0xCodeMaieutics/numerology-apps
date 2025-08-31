import Link from "next/link";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  return (
    <div className="min-h-svh w-full max-w-3xl mx-auto">
      Profile: {profileId}
      <Link href="/" className="block">
        Go back home
      </Link>
    </div>
  );
}
