"'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '../components/AuthProvider';

function LoginContent() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=\"flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8\">
      <div className=\"w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800\">
        <div>
          <h2 className=\"mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white\">
            Sign in to your account
          </h2>
          <p className=\"mt-2 text-center text-sm text-gray-600 dark:text-gray-400\">
            Or{' '}
            <Link
              href=\"/signup\"
              className=\"font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400\"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className=\"mt-8 space-y-6\" onSubmit={handleSubmit}>
          {error && (
            <div className=\"rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-200\">
              {error}
            </div>
          )}

          <div className=\"space-y-4 rounded-md shadow-sm\">
            <div>
              <label htmlFor=\"email\" className=\"sr-only\">
                Email address
              </label>
              <input
                id=\"email\"
                name=\"email\"
                type=\"email\"
                autoComplete=\"email\"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className=\"relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm\"
                placeholder=\"Email address\"
              />
            </div>
            <div>
              <label htmlFor=\"password\" className=\"sr-only\">
                Password
              </label>
              <input
                id=\"password\"
                name=\"password\"
                type=\"password\"
                autoComplete=\"current-password\"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className=\"relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm\"
                placeholder=\"Password\"
              />
            </div>
          </div>

          <div className=\"flex items-center justify-between\">
            <div className=\"flex items-center\">
              <input
                id=\"remember-me\"
                name=\"remember-me\"
                type=\"checkbox\"
                className=\"h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600\"
              />
              <label
                htmlFor=\"remember-me\"
                className=\"ml-2 block text-sm text-gray-900 dark:text-gray-300\"
              >
                Remember me
              </label>
            </div>

            <div className=\"text-sm\">
              <Link
                href=\"/forgot-password\"
                className=\"font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400\"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type=\"submit\"
              disabled={isLoading}
              className=\"group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-blue-500\"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}"