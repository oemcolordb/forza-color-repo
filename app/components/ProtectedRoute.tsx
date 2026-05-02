'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the auth check has finished loading and there is no user, redirect
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show a loading state while checking sessionStorage to prevent layout shifting
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Prevent the protected content from flashing before the router redirect kicks in
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
