'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated]);

  if (!ready) return <div>Loading...</div>;

  if (!authenticated) return null;

  return <>{children}</>;
}