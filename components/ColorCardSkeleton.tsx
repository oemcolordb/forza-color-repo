import React from 'react';

interface ColorCardSkeletonProps {
  isDarkMode: boolean;
}

const ColorCardSkeleton: React.FC<ColorCardSkeletonProps> = ({ isDarkMode }) => {
  const bgClass = isDarkMode ? 'bg-slate-800' : 'bg-white';
  const shimmerClass = isDarkMode ? 'bg-slate-700' : 'bg-gray-200';

  return (
    <div className={`${bgClass} rounded-xl shadow-lg overflow-hidden animate-pulse`}>
      <div className={`${shimmerClass} h-32 w-full`}></div>
      <div className="p-4 space-y-3">
        <div className={`${shimmerClass} h-4 w-3/4 rounded`}></div>
        <div className={`${shimmerClass} h-3 w-1/2 rounded`}></div>
        <div className="flex justify-between items-center">
          <div className={`${shimmerClass} h-3 w-1/3 rounded`}></div>
          <div className={`${shimmerClass} h-6 w-6 rounded`}></div>
        </div>
      </div>
    </div>
  );
};

export default ColorCardSkeleton;