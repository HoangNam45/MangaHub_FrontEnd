import { useState, useEffect, useCallback, useRef } from 'react';
import { mangaService } from '@/services/mangaService';
import type { Manga } from '@/types/manga';

export interface SearchSuggestion {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
}

export interface UseSearchReturn {
  // Search input state
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Suggestions
  suggestions: SearchSuggestion[];
  showSuggestions: boolean;
  loadingSuggestions: boolean;

  // Search results
  searchResults: Manga[];
  searchTotal: number;
  searchPage: number;
  loadingSearch: boolean;
  searchError: string | null;
  isSearchMode: boolean;
  searchPerformed: string; // The actual search term that was performed

  // Actions
  performSearch: (query?: string, filters?: FilterState) => void;
  clearSearch: () => void;
  setSearchPage: (page: number) => void;

  // Suggestions actions
  hideSuggestions: () => void;
  selectSuggestion: (suggestion: SearchSuggestion) => void;
}

export interface FilterState {
  tags: string[];
  status: string[];
}

export const useSearch = (initialFilters?: FilterState): UseSearchReturn => {
  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Suggestions
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Search results
  const [searchResults, setSearchResults] = useState<Manga[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState('');
  const [currentFilters, setCurrentFilters] = useState<FilterState>(
    initialFilters || { tags: [], status: [] }
  );

  // Debounce timer
  const suggestionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (suggestionTimerRef.current) {
      clearTimeout(suggestionTimerRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    suggestionTimerRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        // Get suggestions từ search API với limit nhỏ
        const response = await mangaService.searchManga(searchQuery.trim(), {
          limit: 5, // Chỉ lấy 5 suggestions
          offset: 0,
        });

        const suggestions: SearchSuggestion[] = response.data.map((manga) => ({
          id: manga.id,
          title: manga.attributes.title.en || 'No Title',
          author: manga.author,
          coverUrl: manga.coverUrl,
        }));

        setSuggestions(suggestions);
        setShowSuggestions(true);
      } catch {
        // Silent fail for suggestions
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (suggestionTimerRef.current) {
        clearTimeout(suggestionTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Perform actual search
  const performSearch = useCallback(
    async (query?: string, filters?: FilterState) => {
      const searchTerm = query || searchQuery.trim();
      const searchFilters = filters || currentFilters;

      if (!searchTerm) return;

      setLoadingSearch(true);
      setSearchError(null);
      setSearchPerformed(searchTerm);
      setShowSuggestions(false);

      // Update current filters if provided
      if (filters) {
        setCurrentFilters(filters);
      }

      try {
        const searchParams: any = {
          limit: 15,
          offset: (searchPage - 1) * 15,
          availableTranslatedLanguage: ['en'],
        };

        // Add filters to search params
        if (searchFilters.status.length > 0) {
          searchParams.status = searchFilters.status;
        }
        if (searchFilters.tags.length > 0) {
          searchParams.includedTags = searchFilters.tags;
        }

        const response = await mangaService.searchManga(searchTerm, searchParams);

        setSearchResults(response.data);
        setSearchTotal(response.total);
      } catch (error: any) {
        setSearchError(error.message || 'Failed to search manga');
        setSearchResults([]);
        setSearchTotal(0);
      } finally {
        setLoadingSearch(false);
      }
    },
    [searchQuery, searchPage, currentFilters]
  );

  // Search when page changes (if already in search mode)
  useEffect(() => {
    if (searchPerformed && searchPage > 1) {
      // Recreate search call to avoid dependency issues
      const searchWithPage = async () => {
        setLoadingSearch(true);
        setSearchError(null);

        try {
          const searchParams: any = {
            limit: 15,
            offset: (searchPage - 1) * 15,
            availableTranslatedLanguage: ['en'],
          };

          // Add current filters to search params
          if (currentFilters.status.length > 0) {
            searchParams.status = currentFilters.status;
          }
          if (currentFilters.tags.length > 0) {
            searchParams.includedTags = currentFilters.tags;
          }

          const response = await mangaService.searchManga(searchPerformed, searchParams);

          setSearchResults(response.data);
          setSearchTotal(response.total);
        } catch (error: any) {
          setSearchError(error.message || 'Failed to search manga');
          setSearchResults([]);
          setSearchTotal(0);
        } finally {
          setLoadingSearch(false);
        }
      };

      searchWithPage();
    }
  }, [searchPage, searchPerformed, currentFilters]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchTotal(0);
    setSearchPage(1);
    setSearchError(null);
    setSearchPerformed('');
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  // Hide suggestions
  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  // Select suggestion
  const selectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      setSearchQuery(suggestion.title);
      setShowSuggestions(false);
      performSearch(suggestion.title, currentFilters);
    },
    [performSearch, currentFilters]
  );

  // Handle search page change
  const handleSetSearchPage = useCallback((page: number) => {
    setSearchPage(page);
  }, []);

  // Computed values
  const isSearchMode = searchPerformed.length > 0;

  return {
    // Search input state
    searchQuery,
    setSearchQuery,

    // Suggestions
    suggestions,
    showSuggestions,
    loadingSuggestions,

    // Search results
    searchResults,
    searchTotal,
    searchPage,
    loadingSearch,
    searchError,
    isSearchMode,
    searchPerformed,

    // Actions
    performSearch,
    clearSearch,
    setSearchPage: handleSetSearchPage,

    // Suggestions actions
    hideSuggestions,
    selectSuggestion,
  };
};
