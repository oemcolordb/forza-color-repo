'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import ClientOnly from '@/components/system/ClientOnly';
import PaletteCard from '@/components/palettes/PaletteCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { indexedDBManager } from '@/lib/db/indexedDB';
import { getColorData } from '@/lib/services/colorDataLazy';
import { exportPresetsToFile, parseAndValidatePresets } from '@/lib/utils/presetUtility';

export default function PalettesPage() {
  const [palettes, setPalettes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<'trending' | 'newest' | 'highest-rated'>('trending');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    // Get session
    const id = localStorage.getItem('forza-session-id');
    if (id) {
      setSessionId(id);
    } else {
      const newId = `session_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('forza-session-id', newId);
      setSessionId(newId);
    }

    // Load favorites count for display
    const checkFavs = async () => {
      try {
        const favs = await indexedDBManager.getFavorites();
        setFavoritesCount(favs.length);
      } catch (err) {
        console.error(err);
      }
    };
    checkFavs();
  }, []);

  const fetchPalettes = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `/api/palettes?sort=${sort}`;
      if (activeTag) url += `&tag=${encodeURIComponent(activeTag)}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load palettes');
      
      const data = await res.json();
      setPalettes(data.palettes || []);
    } catch (err) {
      console.error(err);
      setError('Could not load community palettes at this time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPalettes();
  }, [sort, activeTag]);

  const handleExport = async (type: 'feed' | 'favorites') => {
    try {
      if (type === 'feed') {
        if (palettes.length === 0) {
          alert('No palettes in the current feed to export.');
          return;
        }
        const palettesToExport = palettes.map(p => ({
          name: p.name,
          description: p.description,
          tags: p.tags,
          colors: p.colors
        }));
        exportPresetsToFile({ palettes: palettesToExport }, 'forza-community-palettes.json');
      } else {
        const favIds = await indexedDBManager.getFavorites();
        if (favIds.length === 0) {
          alert("You don't have any favorite colors to export.");
          return;
        }
        
        const allColors = await getColorData();
        const favColors = allColors
          .filter(c => {
            const id = `${c.make}-${c.colorName}-${c.year || 'unknown'}`;
            return favIds.includes(id);
          })
          .map(c => ({
            colorId: `${c.make}-${c.colorName}-${c.year || 'unknown'}`,
            colorName: c.colorName,
            make: c.make,
            model: c.model,
            colorType: c.colorType,
            color1: c.color1,
            color2: c.color2,
            year: c.year ?? undefined
          }));
        
        exportPresetsToFile({ favorites: favColors }, 'forza-favorite-colors.json');
      }
    } catch (err) {
      alert('Failed to export presets.');
      console.error(err);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const { palettes: importedPalettes, favorites: importedFavorites } = parseAndValidatePresets(content);

        let summary = 'Import summary:\n';
        let importSuccess = false;

        // 1. Handle Favorites
        if (importedFavorites && importedFavorites.length > 0) {
          const currentFavorites = await indexedDBManager.getFavorites();
          const importedIds = importedFavorites.map(f => f.colorId);
          const mergedFavorites = Array.from(new Set([...currentFavorites, ...importedIds]));
          
          await indexedDBManager.storeFavorites(mergedFavorites);
          localStorage.setItem('forza-favorites', JSON.stringify(mergedFavorites));
          setFavoritesCount(mergedFavorites.length);
          
          summary += `- Added ${importedFavorites.length} favorite colors to your favorites.\n`;
          importSuccess = true;
        }

        // 2. Handle Palettes (publish them)
        if (importedPalettes && importedPalettes.length > 0) {
          let publishedCount = 0;
          for (const p of importedPalettes) {
            const res = await fetch('/api/palettes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: p.name,
                description: p.description,
                tags: p.tags,
                colors: p.colors,
                authorId: sessionId
              })
            });
            if (res.ok) {
              publishedCount++;
            }
          }
          summary += `- Successfully published ${publishedCount} / ${importedPalettes.length} palettes to the community.\n`;
          importSuccess = true;
        }

        if (importSuccess) {
          alert(`${summary}\nPresets imported successfully!`);
          fetchPalettes();
        } else {
          alert('No valid presets found in this file.');
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to import presets.');
      } finally {
        setIsImporting(false);
        // Clear input value to allow re-uploading same file
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <ClientOnly>
      <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
        
        <main id="main-content" tabIndex={-1} className="outline-none container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Community <span className="text-blue-600 dark:text-blue-500">Palettes & Presets</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Browse custom livery mood boards, multi-color themes, and preset setups shared by the community.
              Rate setups, or export and import files to share with others.
            </p>
          </div>

          {/* Import/Export & Sorting Toolbar */}
          <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 sm:flex-row">
            {/* Sorting controls */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSort('trending')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  sort === 'trending'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🔥 Trending
              </button>
              <button
                onClick={() => setSort('newest')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  sort === 'newest'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                ✨ Newest
              </button>
              <button
                onClick={() => setSort('highest-rated')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  sort === 'highest-rated'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                ⭐ Highest Rated
              </button>
            </div>

            {/* Presets utility controls */}
            <div className="flex flex-wrap gap-2 items-center justify-center">
              <button
                onClick={() => handleExport('feed')}
                disabled={palettes.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                title="Export currently visible community presets to a JSON file"
              >
                📤 Export Feed
              </button>
              <button
                onClick={() => handleExport('favorites')}
                disabled={favoritesCount === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                title="Export your favorite color schemes to a JSON file"
              >
                ⭐ Export Favorites ({favoritesCount})
              </button>
              <label className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50">
                {isImporting ? '⏳ Importing...' : '📥 Import Presets'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {activeTag && (
            <div className="mb-6 flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Filtering by:</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                #{activeTag}
                <button 
                  onClick={() => setActiveTag(null)}
                  className="ml-1 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  ×
                </button>
              </span>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-center text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-850">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <LoadingSpinner size="xl" />
            </div>
          ) : palettes.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl bg-white p-8 text-center shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No presets found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTag 
                  ? `We couldn't find any presets tagged with #${activeTag}.` 
                  : "Be the first to share a preset color scheme!"}
              </p>
              <a href="/favorites" className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                Go to Favorites to create one
              </a>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {palettes.map(palette => (
                <PaletteCard 
                  key={palette.id} 
                  palette={palette} 
                  sessionId={sessionId}
                  onTagClick={setActiveTag}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </ClientOnly>
  );
}
