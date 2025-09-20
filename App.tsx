import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import FilterControls from './components/FilterControls';
import ColorCard from './components/ColorCard';
import ColorDetailsModal from './components/ColorDetailsModal';
import Pagination from './components/Pagination';
import { colorData } from './services/colorData';
import type { CarColor } from './types';

const ITEMS_PER_PAGE = 50;

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedColor, setSelectedColor] = useState<CarColor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const makes = useMemo(() => {
    const uniqueMakes = [...new Set(colorData.map((color) => color.make))];
    return uniqueMakes.sort();
  }, []);

  const filteredColors = useMemo(() => {
    return colorData.filter((color) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        color.colorName.toLowerCase().includes(searchLower) ||
        color.make.toLowerCase().includes(searchLower) ||
        color.model.toLowerCase().includes(searchLower) ||
        (color.year && color.year.toString().includes(searchLower)) ||
        (color.colorType && color.colorType.toLowerCase().includes(searchLower));

      const matchesMake = selectedMake ? color.make === selectedMake : true;

      return matchesSearch && matchesMake;
    });
  }, [searchQuery, selectedMake]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMake]);

  const totalPages = Math.ceil(filteredColors.length / ITEMS_PER_PAGE);
  const paginatedColors = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredColors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredColors, currentPage]);


  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
        <div className="absolute inset-0 -z-10 h-full w-full bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      <Header />
      <FilterControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedMake={selectedMake}
        setSelectedMake={setSelectedMake}
        makes={makes}
      />

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {paginatedColors.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {paginatedColors.map((color, index) => (
                <ColorCard 
                  key={`${color.make}-${color.model}-${color.colorName}-${color.year}-${index}-${currentPage}`} 
                  color={color} 
                  onSelect={setSelectedColor}
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-slate-400">No Colors Found</h2>
            <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </main>
      
      {selectedColor && <ColorDetailsModal color={selectedColor} onClose={() => setSelectedColor(null)} />}

      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Forza Color Universe | Data sourced from community spreadsheets.</p>
      </footer>
    </div>
  );
};

export default App;