'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, Heart, Calendar, User } from 'lucide-react';
import { Pagination, Tag } from 'antd';
import { mangaService } from '@/services/mangaService';
import type { Manga } from '@/types/manga';
import Link from 'next/link';
import MangaFilter from '@/components/MangaFilter/MangaFilter';
import SearchInput from '@/components/SearchInput/SearchInput';
import { AVAILABLE_TAGS } from '@/data/tags';
import { useSearch } from '@/hooks/useSearch';
import TrendingManga from '../components/TrendingManga/TrendingManga';

// Hardcoded tags từ MangaDx API

interface FilterState {
  tags: string[];
  status: string[]; // Change back to string[] for multiple selection
}

export default function Home() {
  // Browse manga states (không thay đổi fetchMangaList logic)
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    tags: [],
    status: [],
  });

  // Search functionality (riêng biệt)
  const search = useSearch(activeFilters);
  const { isSearchMode, searchPerformed, performSearch } = search;

  // Update search filters when activeFilters change
  useEffect(() => {
    if (isSearchMode && searchPerformed) {
      // Re-perform search with new filters
      performSearch(searchPerformed, activeFilters);
    }
  }, [activeFilters, performSearch, isSearchMode, searchPerformed]);

  // MangaDx API có giới hạn offset tối đa khoảng 10000
  const MAX_OFFSET = 10000;

  useEffect(() => {
    // Không gọi browse API khi đang ở search mode
    if (isSearchMode) {
      return;
    }

    async function fetchManga() {
      const limit = 15;
      const offset = (page - 1) * limit;

      // Kiểm tra offset không vượt quá giới hạn
      if (offset >= MAX_OFFSET) {
        setError('Cannot load more pages. You have reached the maximum limit.');
        setMangaList([]);
        setTotal(MAX_OFFSET);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await mangaService.fetchMangaList({
          limit,
          offset,
          order: { latestUploadedChapter: 'desc' },
          availableTranslatedLanguage: ['en'],
          includes: ['cover_art', 'author'],
          status: activeFilters.status.length > 0 ? activeFilters.status : undefined,
          includedTags: activeFilters.tags.length > 0 ? activeFilters.tags : undefined,
        });

        setMangaList(response.data);
        // Giới hạn total để không vượt quá MAX_OFFSET
        const limitedTotal = Math.min(response.total, MAX_OFFSET);
        setTotal(limitedTotal);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch manga data');
        setMangaList([]);
      } finally {
        setLoading(false);
      }
    }

    fetchManga();
  }, [page, activeFilters, isSearchMode]);

  const handleApplyFilter = (filters: FilterState) => {
    setActiveFilters(filters);
    setPage(1); // Reset to first page when filters change
  };

  const hasActiveFilters = activeFilters.tags.length > 0 || activeFilters.status.length > 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Trending Manga Carousel - chỉ hiển thị khi không search */}
      {!search.isSearchMode && (
        <div className="mb-6">
          <TrendingManga />
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {search.isSearchMode
              ? `Search Results for "${search.searchPerformed}"`
              : 'Latest Manga'}
          </h2>
          {(hasActiveFilters || search.isSearchMode) && (
            <div className="flex items-center gap-2">
              {search.isSearchMode && <Tag color="blue">Search: {search.searchPerformed}</Tag>}
              {hasActiveFilters && (
                <>
                  <span className="text-sm text-gray-600">Filters:</span>
                  {activeFilters.status.map((status) => (
                    <Tag key={status} color="green">
                      {status}
                    </Tag>
                  ))}
                  {activeFilters.tags.slice(0, 2).map((tagId) => {
                    const tag = AVAILABLE_TAGS.find((t) => t.id === tagId);
                    return (
                      <Tag key={tagId} color="green">
                        {tag?.name || tagId}
                      </Tag>
                    );
                  })}
                  {activeFilters.tags.length > 2 && (
                    <Tag>+{activeFilters.tags.length - 2} more</Tag>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            searchQuery={search.searchQuery}
            setSearchQuery={search.setSearchQuery}
            suggestions={search.suggestions}
            showSuggestions={search.showSuggestions}
            loadingSuggestions={search.loadingSuggestions}
            onSearch={search.performSearch}
            onClearSearch={search.clearSearch}
            onHideSuggestions={search.hideSuggestions}
            onSelectSuggestion={search.selectSuggestion}
            isSearchMode={search.isSearchMode}
            activeFilters={activeFilters}
            className="w-64"
          />
          <Button variant="outline" size="icon" onClick={() => setFilterModalOpen(true)}>
            <Filter className="h-4 w-4" />
          </Button>
          {(hasActiveFilters || search.isSearchMode) && (
            <Button
              variant="outline"
              onClick={() => {
                setActiveFilters({ tags: [], status: [] });
                search.clearSearch();
              }}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Error message */}
      {(error || search.searchError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error || search.searchError}
        </div>
      )}

      {/* Loading state */}
      {(loading || search.loadingSearch) && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">
            {search.isSearchMode ? 'Searching manga...' : 'Loading manga...'}
          </div>
        </div>
      )}

      {/* Results info */}
      {search.isSearchMode && !search.loadingSearch && (
        <div className="mb-4 text-sm text-gray-600">
          Found {search.searchTotal} manga matching "{search.searchPerformed}"
          {hasActiveFilters && ' with applied filters'}
        </div>
      )}

      {/* Manga grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {(search.isSearchMode ? search.searchResults : mangaList).map((manga) => (
          <Link key={manga.id} href={`/manga-detail/${manga.id}`} className="block">
            <Card className="relative max-h-114 cursor-pointer flex flex-col overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              {/* Cover */}
              {manga.coverUrl && (
                <Image
                  src={manga.coverUrl}
                  alt={manga.attributes.title.en || 'Manga'}
                  width={600}
                  height={800}
                  className="h-64 w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              )}

              {/* Info section */}
              <div className="p-3 flex flex-col flex-1">
                <p className="line-clamp-2 min-h-[40px] font-semibold text-sm mb-1">
                  {manga.attributes.title.en || 'No Title'}
                </p>

                <div className="flex flex-wrap min-h-[36px] items-center gap-x-3 gap-y-1 text-xs text-gray-600 mb-2">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5 " />
                    <span className="line-clamp-1">{manga.author || 'Unknown'}</span>
                  </span>
                  {manga.attributes.year && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {manga.attributes.year}
                    </span>
                  )}
                  {manga.attributes.status && (
                    <span className="capitalize">{manga.attributes.status}</span>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-auto ">
                  {manga.attributes.tags?.slice(0, 2).map((tag, idx) => (
                    <Tag key={idx}>{tag.attributes.name.en}</Tag>
                  ))}
                </div>
              </div>

              {/* Floating action (Follow) */}
              <Button
                size="sm"
                className="absolute cursor-pointer right-2 top-2 z-10 bg-white/90 text-black hover:bg-white shadow"
                onClick={(e) => {
                  e.preventDefault(); /* handle follow here */
                }}
              >
                <Heart className="mr-1 h-4 w-4 text-red-500" />
                Follow
              </Button>
            </Card>
          </Link>
        ))}
      </div>

      {/* Ant Design Pagination */}
      <div className="flex justify-center mt-6">
        <Pagination
          current={search.isSearchMode ? search.searchPage : page}
          pageSize={15}
          total={search.isSearchMode ? search.searchTotal : total}
          showSizeChanger={false}
          onChange={(p) => (search.isSearchMode ? search.setSearchPage(p) : setPage(p))}
        />
      </div>

      {/* Filter Modal */}
      <MangaFilter
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApplyFilter={handleApplyFilter}
        availableTags={AVAILABLE_TAGS}
        currentFilters={activeFilters}
      />
    </div>
  );
}
