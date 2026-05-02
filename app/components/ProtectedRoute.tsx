'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import LoadingSpinner from './ui/LoadingSpinner';

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
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Prevent the protected content from flashing before the router redirect kicks in
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
