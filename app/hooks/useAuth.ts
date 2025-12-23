'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function useAuth(redirectToLogin = false) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (redirectToLogin && status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsLoading(false);
  }, [status, redirectToLogin, router]);

  return {
    session,
    isAuthenticated: status === 'authenticated',
    isLoading,
  };
}
