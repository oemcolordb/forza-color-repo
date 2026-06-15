'use client'



import { useState, useEffect } from 'react';
import ClientOnly from '@/components/system/ClientOnly';
import { logger } from '@/lib/utils/logger';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import GamingErrorBoundary from '@/components/error/GamingErrorBoundary';
import CreatePaletteModal from '@/components/palettes/CreatePaletteModal';
import PaletteCard from '@/components/palettes/PaletteCard';

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
  const [myPalettes, setMyPalettes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'favorites' | 'palettes'>('favorites');

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

        // Also fetch user's palettes
        const palettesResponse = await fetch(`/api/palettes?authorId=${sessionId}`);
        if (palettesResponse.ok) {
          const palettesData = await palettesResponse.json();
          setMyPalettes(palettesData.palettes || []);
        }
      } catch (err) {
        // Gracefully degrade to local storage if API is unavailable
        logger.warn('Could not sync favorites with cloud, relying on local storage:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user || !user) { // Always fetch using sessionId even if no user
      fetchFavorites();
    }
  }, [user]);

  const refreshPalettes = async () => {
    const sessionId = localStorage.getItem('forza-session-id') || 'anonymous';
    const res = await fetch(`/api/palettes?authorId=${sessionId}`);
    if (res.ok) {
      const data = await res.json();
      setMyPalettes(data.palettes || []);
    }
  };

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
        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Garage
          </h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              Saved Colors
            </button>
            <button
              onClick={() => setActiveTab('palettes')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'palettes'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              My Palettes
            </button>
          </div>
        </div>

        {activeTab === 'favorites' && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
            >
              + Create Palette
            </button>
          </div>
        )}

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

        {activeTab === 'palettes' && (
          <div className="mt-4">
            {myPalettes.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
                <p className="text-gray-600 dark:text-gray-400">
                  You haven&apos;t created any palettes yet.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('favorites');
                    setIsModalOpen(true);
                  }}
                  className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Create Your First Palette
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {myPalettes.map(palette => (
                  <PaletteCard 
                    key={palette.id} 
                    palette={palette} 
                    sessionId={localStorage.getItem('forza-session-id') || 'anonymous'}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <CreatePaletteModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          favorites={favorites}
          sessionId={localStorage.getItem('forza-session-id') || 'anonymous'}
          onSuccess={() => {
            setActiveTab('palettes');
            refreshPalettes();
          }}
        />
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 Forza Color Universe. Not affiliated with Microsoft or Turn 10 Studios.</p>
        </div>
      </footer>
    </div>
  );
}

function FavoritesPageInner() {
  return (
    <AuthProvider>
      <GamingErrorBoundary>
        <FavoritesContent />
      </GamingErrorBoundary>
    </AuthProvider>
  );
}

;

export default function FavoritesPage() {
  return <ClientOnly>
        <FavoritesPageInner />
      </ClientOnly>;
}
