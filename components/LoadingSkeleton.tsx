import React from 'react';

interface LoadingSkeletonProps {
  isDarkMode?: boolean;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ isDarkMode = true }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: 20 }).map((_, index) => (
        <div
          key={index}
          className={`rounded-lg overflow-hidden animate-pulse ${
            isDarkMode ? 'bg-slate-800' : 'bg-gray-200'
          }`}
        >
          <div className={`h-32 w-full ${
            isDarkMode ? 'bg-slate-700' : 'bg-gray-300'
          }`}></div>
          <div className="p-4">
            <div className={`h-4 rounded mb-2 ${
              isDarkMode ? 'bg-slate-700' : 'bg-gray-300'
            }`}></div>
            <div className={`h-3 rounded w-3/4 mb-4 ${
              isDarkMode ? 'bg-slate-700' : 'bg-gray-300'
            }`}></div>
            <div className="flex justify-between items-center">
              <div className={`h-6 w-16 rounded-full ${
                isDarkMode ? 'bg-slate-700' : 'bg-gray-300'
              }`}></div>
              <div className={`h-6 w-6 rounded ${
                isDarkMode ? 'bg-slate-700' : 'bg-gray-300'
              }`}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;