import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import FilterControls from './components/FilterControls';
import ColorCard from './components/ColorCard';
import ColorCardSkeleton from './components/ColorCardSkeleton';
import ColorDetailsModal from './components/ColorDetailsModal';
import { getPaginatedColorData, getMakes } from './services/colorDataManager';
import { useDebounce } from './hooks/useDebounce';
import type { CarColor } from './types.ts';

const ITEMS_PER_PAGE = 50;

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedColor, setSelectedColor] = useState<CarColor | null>(null);
  const [colors, setColors] = useState<CarColor[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastColorRef = useRef<HTMLDivElement | null>(null);
  
  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('forza-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('forza-theme');
    return saved === 'dark';
  });

  // Load makes on component mount
  useEffect(() => {
    const loadMakes = async () => {
      try {
        const makesList = await getMakes();
        setMakes(makesList);
      } catch (error) {
        console.error('Error loading makes:', error);
      }
    };
    loadMakes();
  }, []);

  // Load initial data and reset on filter changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setPage(1);
      try {
        const result = await getPaginatedColorData(
          debouncedSearchQuery,
          selectedMake,
          1,
          ITEMS_PER_PAGE
        );
        setColors(result.colors);
        setHasMore(result.colors.length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error('Error loading color data:', error);
        setColors([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [debouncedSearchQuery, selectedMake]);

  // Load more data
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await getPaginatedColorData(
        debouncedSearchQuery,
        selectedMake,
        nextPage,
        ITEMS_PER_PAGE
      );
      setColors(prev => [...prev, ...result.colors]);
      setPage(nextPage);
      setHasMore(result.colors.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading more colors:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, debouncedSearchQuery, selectedMake]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (lastColorRef.current) {
      observerRef.current.observe(lastColorRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadMore, hasMore, loading]);

  useEffect(() => {
    localStorage.setItem('forza-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('forza-theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleFavorite = useCallback((colorId: string) => {
    setFavorites(prev => 
      prev.includes(colorId) 
        ? prev.filter(id => id !== colorId)
        : [...prev, colorId]
    );
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const themeClasses = isDarkMode 
    ? 'bg-slate-900 text-white' 
    : 'bg-gray-50 text-gray-900';
    
  const backgroundClasses = isDarkMode 
    ? 'bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)]'
    : 'bg-gray-100 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)]';

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${themeClasses}`}>
      <div className={`absolute inset-0 -z-10 h-full w-full ${backgroundClasses} bg-[size:14px_24px]`}></div>

      <Header isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      <FilterControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedMake={selectedMake}
        setSelectedMake={setSelectedMake}
        makes={makes}
        isDarkMode={isDarkMode}
      />

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {colors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {colors.map((color, index) => {
              const colorId = `${color.make}-${color.model}-${color.colorName}-${color.year}`;
              const isLast = index === colors.length - 1;
              return (
                <div 
                  key={`${colorId}-${index}`}
                  ref={isLast ? lastColorRef : null}
                >
                  <ColorCard 
                    color={color} 
                    onSelect={setSelectedColor}
                    isFavorite={favorites.includes(colorId)}
                    onToggleFavorite={() => toggleFavorite(colorId)}
                    isDarkMode={isDarkMode}
                  />
                </div>
              );
            })}
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <ColorCardSkeleton key={index} isDarkMode={isDarkMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              No Colors Found
            </h2>
            <p className={`mt-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
              Try adjusting your search or filters.
            </p>
          </div>
        )}
        
        {loading && colors.length > 0 && (
          <div className="flex justify-center py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
              {Array.from({ length: 10 }).map((_, index) => (
                <ColorCardSkeleton key={`loading-${index}`} isDarkMode={isDarkMode} />
              ))}
            </div>
          </div>
        )}
      </main>
      
      {selectedColor && <ColorDetailsModal color={selectedColor} onClose={() => setSelectedColor(null)} />}

      <footer className={`text-center py-6 text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
        <p>Forza Color Universe | Data sourced from community spreadsheets.</p>
      </footer>
    </div>
  );
};

export default App;