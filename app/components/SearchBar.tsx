'use client';

import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  debounceMs?: number;
  additionalFilters?: React.ReactNode;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search...',
  onClear,
  debounceMs = 500,
  additionalFilters,
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const handleSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;

      return (value: string) => {
        setSearchValue(value);
        clearTimeout(timeoutId);

        if (value.trim()) {
          setIsSearching(true);
          timeoutId = setTimeout(() => {
            onSearch(value);
            setIsSearching(false);
          }, debounceMs);
        } else {
          setIsSearching(false);
          onSearch('');
          onClear?.();
        }
      };
    })(),
    [onSearch, onClear, debounceMs]
  );

  const handleClear = () => {
    setSearchValue('');
    setIsSearching(false);
    onClear?.();
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
        />
        {searchValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition"
          >
            <X size={18} className="text-slate-600 dark:text-slate-400" />
          </button>
        )}
      </div>

      {isSearching && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          Searching...
        </div>
      )}

      {additionalFilters && <div className="space-y-2">{additionalFilters}</div>}
    </div>
  );
}
