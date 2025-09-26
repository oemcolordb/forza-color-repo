
import React from 'react';

interface FilterControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedMake: string;
  setSelectedMake: (make: string) => void;
  makes: string[];
  isDarkMode?: boolean;
}

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);


const FilterControls: React.FC<FilterControlsProps> = ({
  searchQuery,
  setSearchQuery,
  selectedMake,
  setSelectedMake,
  makes,
  isDarkMode = true,
}) => {
  const bgClass = isDarkMode ? 'bg-slate-900/50' : 'bg-white/80';
  const inputBgClass = isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';
  const iconClass = isDarkMode ? 'text-slate-400' : 'text-gray-500';
  const focusClass = isDarkMode ? 'focus:ring-fuchsia-500 focus:border-fuchsia-500' : 'focus:ring-blue-500 focus:border-blue-500';
  
  return (
    <div className={`p-4 ${bgClass} backdrop-blur-sm sticky top-0 z-10`}>
      <div className="container mx-auto flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-1/2">
          <input
            type="text"
            placeholder="Search by color, make, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${inputBgClass} border-2 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 ${focusClass} transition-colors`}
          />
           <SearchIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${iconClass}`} />
        </div>
        <div className="relative w-full sm:w-1/2">
          <select
            value={selectedMake}
            onChange={(e) => setSelectedMake(e.target.value)}
            className={`w-full ${inputBgClass} border-2 rounded-md py-2 px-4 focus:outline-none focus:ring-2 ${focusClass} transition-colors appearance-none`}
          >
            <option value="">All Manufacturers</option>
            {makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
          <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${iconClass}`}>
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
