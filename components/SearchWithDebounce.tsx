import React, { useState, useEffect } from 'react';

interface SearchWithDebounceProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
  isDarkMode?: boolean;
}

const SearchWithDebounce: React.FC<SearchWithDebounceProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  delay = 300,
  isDarkMode = true
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, onChange, delay]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      className={`w-full py-2 pl-10 pr-4 rounded-md transition-colors focus:outline-none focus:ring-2 ${
        isDarkMode
          ? 'bg-slate-800 border-2 border-slate-700 text-slate-100 placeholder-slate-400 focus:ring-fuchsia-500 focus:border-fuchsia-500'
          : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
      }`}
    />
  );
};

export default SearchWithDebounce;