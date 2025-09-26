import React, { useState, useEffect, useMemo } from 'react';
import ColorCard from './ColorCard';
import type { CarColor } from '../types';

interface VirtualizedColorGridProps {
  colors: CarColor[];
  onSelectColor: (color: CarColor) => void;
  favorites: string[];
  onToggleFavorite: (colorId: string) => void;
  isDarkMode: boolean;
}

const ITEM_HEIGHT = 280; // Approximate height of each color card
const ITEMS_PER_ROW = 5; // Default for xl screens
const BUFFER_SIZE = 5; // Number of rows to render outside viewport

const VirtualizedColorGrid: React.FC<VirtualizedColorGridProps> = ({
  colors,
  onSelectColor,
  favorites,
  onToggleFavorite,
  isDarkMode
}) => {
  const [containerHeight, setContainerHeight] = useState(600);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const endRow = Math.min(
      Math.ceil(colors.length / ITEMS_PER_ROW),
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
    );
    
    return {
      start: startRow * ITEMS_PER_ROW,
      end: Math.min(colors.length, endRow * ITEMS_PER_ROW)
    };
  }, [scrollTop, containerHeight, colors.length]);

  const visibleColors = colors.slice(visibleRange.start, visibleRange.end);
  const totalHeight = Math.ceil(colors.length / ITEMS_PER_ROW) * ITEM_HEIGHT;
  const offsetY = Math.floor(visibleRange.start / ITEMS_PER_ROW) * ITEM_HEIGHT;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    const updateHeight = () => {
      setContainerHeight(window.innerHeight - 200); // Account for header/footer
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div 
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            width: '100%'
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {visibleColors.map((color, index) => {
              const actualIndex = visibleRange.start + index;
              const colorId = `${color.make}-${color.model}-${color.colorName}-${color.year}`;
              return (
                <ColorCard
                  key={`${colorId}-${actualIndex}`}
                  color={color}
                  onSelect={onSelectColor}
                  isFavorite={favorites.includes(colorId)}
                  onToggleFavorite={() => onToggleFavorite(colorId)}
                  isDarkMode={isDarkMode}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedColorGrid;