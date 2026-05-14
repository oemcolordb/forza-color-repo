'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '../components/AuthProvider';
import GamingErrorBoundary from '../components/GamingErrorBoundary';

function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();
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
      // Use the auth context's signup method which handles token storage
      await signup(email, password, name);

      // Redirect to home page or a protected dashboard
      router.push('/');
      router.refresh(); // Force a router refresh to update any layout auth states
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#050a06]">
      <div className="w-full max-w-4xl flex flex-col-reverse md:flex-row rounded-2xl shadow-2xl overflow-hidden gpu-accelerated border border-white/10">

        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 bg-black/40 backdrop-blur-xl flex flex-col justify-center">
          <h2 className="text-3xl font-black text-white mb-2 italic tracking-tighter">
            CREATE <span className="text-blue-500">ACCOUNT</span>
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-white/50 mb-8 font-bold">
            Join the Forza Color Universe today.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-900/40 p-4 text-sm text-red-200 border border-red-800">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-4 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all"
                placeholder="Full Name"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-4 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all"
                placeholder="Email address"
              />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-4 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all"
                placeholder="Password (minimum 8 characters)"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-xl px-4 py-4 text-sm font-black italic tracking-tighter text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
            >
              {isLoading ? 'CREATING ACCOUNT...' : 'SIGN UP →'}
            </button>

            <div className="mt-6 text-center text-[10px] uppercase tracking-widest font-bold">
              <span className="text-white/40">Already have an account? </span>
              <Link
                href="/login"
                className="text-blue-500 hover:underline ml-1"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>

        {/* Right Side: Incentives */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 bg-black/60 backdrop-blur-md flex flex-col justify-center relative border-b md:border-b-0 md:border-l border-white/10">
          <h3 className="text-2xl font-black mb-8 text-white italic tracking-tighter">
            UNLOCK THE <span className="text-blue-500">UNIVERSE</span>
          </h3>

          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                ❤️
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white">Save Favorites</h4>
                <p className="text-[10px] text-white/50 mt-1 font-medium">Keep track of your top paint codes, color harmonies, and custom tunes in your personal garage.</p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                🤖
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white">AI Tuning Assistance</h4>
                <p className="text-[10px] text-white/50 mt-1 font-medium">Get real-time Expert advice from TuneBot AI for your specific builds.</p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                🏎️
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white">Join the Community</h4>
                <p className="text-[10px] text-white/50 mt-1 font-medium">Submit your own legendary setups and showcase your builds in the Pit Stop.</p>
              </div>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <AuthProvider>
      <GamingErrorBoundary>
        <SignupForm />
      </GamingErrorBoundary>
    </AuthProvider>
  );
}
