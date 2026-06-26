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
import ImageUploadButton from '@/components/garage/ImageUploadButton';

interface FavoriteColor {
  colorId: string;
  colorName: string;
  make: string;
  model?: string;
  colorType?: string;
  color1: { h: number; s: number; b: number };
  color2?: { h: number; s: number; b: number };
  imageUrl?: string;
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
        let apiFavorites = data.favorites || [];

        // Check local storage for legacy array of IDs
        try {
          const localFavoritesRaw = localStorage.getItem('forza-favorites');
          if (localFavoritesRaw) {
            const localIds = JSON.parse(localFavoritesRaw);
            if (Array.isArray(localIds) && localIds.length > 0) {
              // Fetch car colors to map IDs to full objects
              const colorsRes = await fetch('/carColors.json');
              if (colorsRes.ok) {
                const allColors = await colorsRes.json();
                
                // Extract API favorite IDs to avoid duplicates
                const apiFavIds = new Set(apiFavorites.map((f: any) => f.colorId));
                
                const localFavObjects = localIds
                  .filter((id: string) => !apiFavIds.has(id))
                  .map((id: string) => {
                    const color = allColors.find((c: any) => `${c.make}-${c.colorName}-${c.year || 'unknown'}` === id);
                    if (color) {
                      return {
                        colorId: id,
                        colorName: color.colorName,
                        make: color.make,
                        model: color.model,
                        colorType: color.colorType,
                        color1: color.color1,
                        color2: color.color2,
                      };
                    }
                    return null;
                  })
                  .filter(Boolean);
                
                apiFavorites = [...apiFavorites, ...localFavObjects];
              }
            }
          }
        } catch (e) {
          logger.warn('Failed to parse local favorites:', e);
        }

        setFavorites(apiFavorites);

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
        
        // Also update local storage if it's there
        try {
          const localRaw = localStorage.getItem('forza-favorites');
          if (localRaw) {
            const localIds = JSON.parse(localRaw);
            if (Array.isArray(localIds)) {
              localStorage.setItem('forza-favorites', JSON.stringify(localIds.filter(id => id !== colorId)));
            }
          }
        } catch (e) {}
      }
    } catch (err) {
      logger.error('Failed to remove favorite:', err);
    }
  };

  const handleImageUpload = async (colorId: string, url: string) => {
    const updatedFavorites = favorites.map(f => f.colorId === colorId ? { ...f, imageUrl: url } : f);
    setFavorites(updatedFavorites);
    
    try {
      const sessionId = localStorage.getItem('forza-session-id') || 'anonymous';
      await fetch(`/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: user?.id,
          favorites: updatedFavorites,
        })
      });
    } catch(err) {
      logger.error('Failed to sync updated favorite image:', err);
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
              aria-label="Toggle theme"
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((color) => (
              <div
                key={color.colorId}
                className="group relative flex h-64 flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800"
              >
                {/* Background Image or Gradient */}
                <div
                  className="absolute inset-0 z-0 transition-transform duration-500 group-hover:scale-105"
                  style={
                    color.imageUrl
                      ? {
                          backgroundImage: `url(${color.imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : {
                          background: `linear-gradient(135deg, hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%), hsl(${(color.color2?.h || color.color1.h) * 360}, ${(color.color2?.s || color.color1.s) * 100}%, ${(color.color2?.b || color.color1.b) * 100}%))`,
                        }
                  }
                />
                
                {/* Image Upload Button (Top Right) */}
                <div className="absolute right-3 top-3 z-20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <ImageUploadButton 
                    onUploadSuccess={(url) => handleImageUpload(color.colorId, url)} 
                  />
                </div>

                {/* Empty State Prompt (if no image) */}
                {!color.imageUrl && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/20 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                    <span className="mb-2 text-sm font-medium text-white shadow-black drop-shadow-md">
                      Upload a screenshot
                    </span>
                  </div>
                )}

                {/* Content Overlay (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-12">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="font-bold text-white shadow-black drop-shadow-md">
                        {color.colorName}
                      </h3>
                      <p className="text-xs text-gray-300 shadow-black drop-shadow-md">
                        {color.make} {color.model}
                      </p>
                      {/* HSB Mini Badges */}
                      <div className="mt-2 flex gap-2 text-[10px] font-mono text-white/80">
                        <span className="rounded bg-black/40 px-1.5 py-0.5 backdrop-blur-md">H:{(color.color1.h * 360).toFixed(0)}</span>
                        <span className="rounded bg-black/40 px-1.5 py-0.5 backdrop-blur-md">S:{(color.color1.s * 100).toFixed(0)}</span>
                        <span className="rounded bg-black/40 px-1.5 py-0.5 backdrop-blur-md">B:{(color.color1.b * 100).toFixed(0)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeFavorite(color.colorId)}
                      className="rounded-full bg-red-600/80 p-2 text-white backdrop-blur-md transition-colors hover:bg-red-600"
                      title="Remove from Garage"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
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
