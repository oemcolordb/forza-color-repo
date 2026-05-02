'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // The signup route expects name, email, and password
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Store the token in sessionStorage per your auth setup
      sessionStorage.setItem('forza-auth-token', data.token);

      // Redirect to home page or a protected dashboard
      router.push('/');
      router.refresh(); // Force a router refresh to update any layout auth states
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl flex flex-col-reverse md:flex-row rounded-2xl shadow-2xl overflow-hidden gpu-accelerated border border-gray-200 dark:border-slate-700">

        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 bg-white dark:bg-slate-800 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            Create Account
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
            Join the Forza Color Universe today.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200 border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-500 focus:border-[color:var(--bamboo-stalk)] focus:outline-none focus:ring-1 focus:ring-[color:var(--bamboo-stalk)] dark:border-slate-600 dark:bg-slate-700 dark:text-white sm:text-sm transition-colors"
                placeholder="Full Name"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-500 focus:border-[color:var(--bamboo-stalk)] focus:outline-none focus:ring-1 focus:ring-[color:var(--bamboo-stalk)] dark:border-slate-600 dark:bg-slate-700 dark:text-white sm:text-sm transition-colors"
                placeholder="Email address"
              />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-500 focus:border-[color:var(--bamboo-stalk)] focus:outline-none focus:ring-1 focus:ring-[color:var(--bamboo-stalk)] dark:border-slate-600 dark:bg-slate-700 dark:text-white sm:text-sm transition-colors"
                placeholder="Password (minimum 8 characters)"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-lg px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover-lift bg-gradient-to-r from-[color:var(--bamboo-stalk)] to-[color:var(--bamboo-moss)] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--bamboo-stalk)] focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500 dark:text-slate-400">Already have an account? </span>
              <Link
                href="/login"
                className="font-semibold text-[color:var(--bamboo-stalk)] hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>

        {/* Right Side: Incentives */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 bg-slate-50 dark:bg-slate-900 border-b md:border-b-0 md:border-l border-gray-200 dark:border-slate-700 flex flex-col justify-center relative">
          <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
            Unlock the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--bamboo-stalk)] to-[color:var(--bamboo-moss)]">Universe</span>
          </h3>

          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                ❤️
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Save Favorites</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Keep track of your top paint codes, color harmonies, and custom tunes in your personal garage.</p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500">
                🧠
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">ML Image Scanning</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Unlock our Python AI backend to extract highly accurate paint matches from your screenshots.</p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                🌍
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Join the Community</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Submit your own legendary tuning setups and vote on community paints.</p>
              </div>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
