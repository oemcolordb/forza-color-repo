'use client';

import { useState, useEffect } from 'react';
import { logger } from '../lib/logger';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider, useAuth } from '../components/AuthProvider';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import GamingErrorBoundary from '../components/GamingErrorBoundary';

interface FavoriteColor {
  colorId: string;
  colorName: string;
  make: string;
  model?: string;
  colorType?: string;
  color1: { h: number; s: number; b: number };
  color2?: { h: number; s: number; b: number };
}

function FavoritesContent() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        // Get session ID from storage
        const sessionId = localStorage.getItem('forza-session-id') || 'anonymous';

        const response = await fetch(`/api/favorites?sessionId=${sessionId}&userId=${user?.id || ''}`);

        if (!response.ok) {
          throw new Error('Failed to fetch favorites');
        }

        const data = await response.json();
        setFavorites(data.favorites || []);
      } catch (err) {
        setError('Could not load your favorites');
        logger.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const removeFavorite = async (colorId: string) => {
    try {
      const sessionId = localStorage.getItem('forza-session-id') || 'anonymous';

      const response = await fetch(`/api/favorites?sessionId=${sessionId}&colorId=${colorId}&userId=${user?.id || ''}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites(favorites.filter(f => f.colorId !== colorId));
      }
    } catch (err) {
      logger.error('Failed to remove favorite:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <header className="border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Forza Color Universe
          </a>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Back to Colors
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          My Favorite Colors
        </h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/50 dark:text-red-200">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-400">
              You haven&apos;t saved any favorites yet.
            </p>
            <a
              href="/forza-color-sheet"
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Browse Colors
            </a>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((color) => (
              <div
                key={color.colorId}
                className="rounded-lg bg-white p-4 shadow dark:bg-gray-800"
              >
                <div
                  className="mb-3 h-24 rounded-md"
                  style={{
                    background: `linear-gradient(135deg, hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%), hsl(${(color.color2?.h || color.color1.h) * 360}, ${(color.color2?.s || color.color1.s) * 100}%, ${(color.color2?.b || color.color1.b) * 100}%))`,
                  }}
                />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {color.colorName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {color.make} {color.model}
                </p>
                <button
                  onClick={() => removeFavorite(color.colorId)}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 Forza Color Universe. Not affiliated with Microsoft or Turn 10 Studios.</p>
        </div>
      </footer>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <GamingErrorBoundary>
          <FavoritesContent />
        </GamingErrorBoundary>
      </ProtectedRoute>
    </AuthProvider>
  );
}
