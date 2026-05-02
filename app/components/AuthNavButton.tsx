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
        className="px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-md hover:bg-red-700"
      >
        Logout
      </button>
    );
  }

  return (
    <Link
      href="/login"
      className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
    >
      Login
    </Link>
  );
}
