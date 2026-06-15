'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import ClientOnly from '@/components/system/ClientOnly';
import PaletteCard from '@/components/palettes/PaletteCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function PalettesPage() {
  const [palettes, setPalettes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<'trending' | 'newest'>('trending');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
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
  }, []);

  useEffect(() => {
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

    fetchPalettes();
  }, [sort, activeTag]);

  return (
    <ClientOnly>
      <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Community <span className="text-blue-600 dark:text-blue-500">Palettes</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Browse custom livery mood boards and multi-color themes created by the community. 
              Find the perfect combination for your next masterpiece.
            </p>
          </div>

          <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex gap-2">
              <button
                onClick={() => setSort('trending')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  sort === 'trending'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                🔥 Trending
              </button>
              <button
                onClick={() => setSort('newest')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  sort === 'newest'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                ✨ Newest
              </button>
            </div>
            
            {activeTag && (
              <div className="flex items-center gap-2">
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
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-center text-red-800 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <LoadingSpinner size="xl" />
            </div>
          ) : palettes.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl bg-white p-8 text-center shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No palettes found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTag 
                  ? `We couldn't find any palettes tagged with #${activeTag}.` 
                  : "Be the first to create a palette!"}
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
