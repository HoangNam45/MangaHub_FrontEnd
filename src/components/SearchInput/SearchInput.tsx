'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from 'antd';
import { Search, X } from 'lucide-react';
import type { SearchSuggestion } from '@/hooks/useSearch';

interface FilterState {
  tags: string[];
  status: string[];
}

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  suggestions: SearchSuggestion[];
  showSuggestions: boolean;
  loadingSuggestions: boolean;
  onSearch: (query?: string, filters?: FilterState) => void;
  onClearSearch: () => void;
  onHideSuggestions: () => void;
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;
  isSearchMode: boolean;
  activeFilters?: FilterState;
  className?: string;
}

export default function SearchInput({
  searchQuery,
  setSearchQuery,
  suggestions,
  showSuggestions,
  loadingSuggestions,
  onSearch,
  onClearSearch,
  onHideSuggestions,
  onSelectSuggestion,
  isSearchMode,
  activeFilters,
  className,
}: SearchInputProps) {
  const [inputFocused, setInputFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  // Handle click outside to hide suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onHideSuggestions();
        setInputFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onHideSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(searchQuery, activeFilters);
      onHideSuggestions();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      onHideSuggestions();
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onSelectSuggestion(suggestion);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClear = () => {
    onClearSearch();
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Input
        ref={inputRef}
        placeholder="Search manga..."
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setInputFocused(true)}
        prefix={<Search className="h-4 w-4 text-gray-400" />}
        suffix={
          isSearchMode ? (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null
        }
        className="pr-10"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && inputFocused && (suggestions.length > 0 || loadingSuggestions) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {loadingSuggestions ? (
            <div className="p-3 text-center text-gray-500">
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                Loading suggestions...
              </div>
            </div>
          ) : (
            <>
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center gap-2">
                    {/* <Search className="h-4 w-4 text-gray-400 flex-shrink-0" /> */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {suggestion.title}
                      </div>
                      {suggestion.author && (
                        <div className="text-xs text-gray-500 truncate">by {suggestion.author}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
