'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../components/AuthProvider';
import { CarColor } from '../types';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [favorites, setFavorites] = useState<CarColor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = sessionStorage.getItem('forza-auth-token');
        if (!token) return;

        // Fetch the user's saved favorites from your protected API route
        const response = await fetch('/api/user/favorites', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFavorites(data.favorites || []);
        }
      } catch (error) {
        console.error('Failed to fetch favorites', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const removeFavorite = async (colorId: string) => {
    // Optimistically update the UI
    setFavorites((prev) => prev.filter((c) => `${c.make}-${c.colorName}-${c.year || 'unknown'}` !== colorId));

    // TODO: Send DELETE request to your /api/user/favorites endpoint here
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Your Garage
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
              Manage your account settings and saved color combinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Left Column: Account Info */}
            <div className="col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[color:var(--bamboo-stalk)] to-[color:var(--bamboo-moss)] flex items-center justify-center text-2xl text-white font-bold shadow-inner">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{user?.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-sm rounded-xl text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Favorites */}
            <div className="col-span-1 md:col-span-2">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 min-h-[400px]">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  ❤️ <span>Saved Favorites</span>
                </h3>

                {isLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--bamboo-stalk)]"></div>
                  </div>
                ) : favorites.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favorites.map((fav, idx) => {
                      const colorId = `${fav.make}-${fav.colorName}-${fav.year || 'unknown'}`;
                      return (
                        <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center group transition-colors hover:border-[color:var(--bamboo-stalk)]">
                          <div className="overflow-hidden pr-4">
                            <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{fav.colorName}</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400 truncate">{fav.make}</div>
                          </div>
                          <button
                            onClick={() => removeFavorite(colorId)}
                            className="text-red-500 hover:scale-110 transition-transform p-2"
                            title="Remove from favorites"
                          >
                            ❤️
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 bg-gray-50 dark:bg-slate-900/30 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                    <div className="text-5xl opacity-80">🪹</div>
                    <div className="space-y-1">
                      <p className="text-gray-900 dark:text-white font-medium">Your garage is empty</p>
                      <p className="text-gray-500 dark:text-slate-400 text-sm max-w-xs">
                        Go find some awesome colors to save and they will appear here!
                      </p>
                    </div>
                    <Link href="/" className="mt-2 px-6 py-2.5 bg-gradient-to-r from-[color:var(--bamboo-stalk)] to-[color:var(--bamboo-moss)] text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all hover-lift">
                      Browse Colors
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
