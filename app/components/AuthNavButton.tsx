'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthNavButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Component has mounted on the client, safe to read sessionStorage
    setMounted(true);
    const token = sessionStorage.getItem('forza-auth-token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    // Clear the session token
    sessionStorage.removeItem('forza-auth-token');
    setIsLoggedIn(false);

    // Redirect to home/login page and force a router refresh
    // router.refresh() ensures the rest of the app updates its state
    router.push('/');
    router.refresh();
  };

  // Prevent hydration mismatch errors by returning a placeholder before mounting
  if (!mounted) {
    return <div className="px-4 py-2 opacity-0">...</div>;
  }

  if (isLoggedIn) {
    return (
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md border border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
      >
        Logout
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md text-gray-700 dark:text-gray-300 hover:text-[color:var(--bamboo-stalk)]"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="px-4 py-2 text-sm font-bold text-white transition-all duration-200 rounded-md bg-gradient-to-r from-[color:var(--bamboo-stalk)] to-[color:var(--bamboo-moss)] hover:scale-105 shadow-md hover:shadow-lg"
      >
        Sign up
      </Link>
    </div>
  );
}
