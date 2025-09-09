'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, Heart, Calendar, User, ArrowLeft } from 'lucide-react';
import { Pagination, Tag } from 'antd';
import type { Manga } from '@/types/manga';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MangaFilter from '@/components/MangaFilter/MangaFilter';
import SearchInput from '@/components/SearchInput/SearchInput';
import { AVAILABLE_TAGS } from '@/data/tags';
import { useSearch } from '@/hooks/useSearch';
import { useMangaList, useToggleFollowManga } from '@/hooks/useMangaQuery';
import { useAuth } from '@/hooks/useAuth';
import TrendingManga from '../components/TrendingManga/TrendingManga';

interface FilterState {
  tags: string[];
  status: string[];
}

export default function Home() {
  const router = useRouter();

  // Authentication
  const { isAuthenticated } = useAuth();

  // UI state
  const [page, setPage] = useState(1);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    tags: [],
    status: [],
  });

  // Search functionality
  const search = useSearch(activeFilters);

  // MangaDx API có giới hạn offset tối đa khoảng 10000
  const MAX_OFFSET = 10000;

  // React Query for manga list (only when not in search mode)
  const {
    data: mangaData,
    isLoading: mangaLoading,
    error: mangaError,
  } = useMangaList({
    limit: 15,
    offset: (page - 1) * 15,
    order: { latestUploadedChapter: 'desc' },
    availableTranslatedLanguage: ['en'],
    status: activeFilters.status.length > 0 ? activeFilters.status : undefined,
    includedTags: activeFilters.tags.length > 0 ? activeFilters.tags : undefined,
  });

  // Follow/Unfollow functionality with React Query (only if authenticated)
  const { toggleFollow, isLoadingManga, isFollowed } = useToggleFollowManga();

  // Handle follow/unfollow
  const handleFollow = (mangaId: string) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }
    toggleFollow(mangaId);
  };

  const handleApplyFilter = (filters: FilterState) => {
    setActiveFilters(filters);
    setPage(1); // Reset to first page when filters change

    // If in search mode, re-perform search with new filters
    if (search.isSearchMode && search.searchPerformed) {
      search.performSearch(search.searchPerformed, filters);
    }
  };

  // Handle back button click - exit search mode and clear everything
  const handleBackFromSearch = () => {
    search.clearSearch();
    setActiveFilters({ tags: [], status: [] });
    setPage(1);
  };

  const hasActiveFilters = activeFilters.tags.length > 0 || activeFilters.status.length > 0;

  // Get current data based on mode
  const currentMangaList = search.isSearchMode ? search.searchResults : mangaData?.data || [];
  const currentTotal = search.isSearchMode ? search.searchTotal : mangaData?.total || 0;
  const currentLoading = search.isSearchMode ? search.loadingSearch : mangaLoading;
  const currentError = search.isSearchMode ? search.searchError : mangaError?.message;

  // Check if offset exceeds limit for pagination
  const exceedsLimit = (page - 1) * 15 >= MAX_OFFSET;
  const limitedTotal = Math.min(currentTotal, MAX_OFFSET);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Trending Manga Carousel - chỉ hiển thị khi không search */}
      {!search.isSearchMode && (
        <div className="mb-8">
          <TrendingManga />
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {search.isSearchMode && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleBackFromSearch}
              className="flex cursor-pointer items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h2 className="text-2xl font-bold">
            {search.isSearchMode
              ? `Search Results for "${search.searchPerformed}"`
              : 'Latest Manga'}
          </h2>
          {(hasActiveFilters || search.isSearchMode) && (
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <>
                  <span className="text-sm text-gray-600">Filters:</span>
                  {activeFilters.status.map((status) => (
                    <Tag key={status}>{status}</Tag>
                  ))}
                  {activeFilters.tags.slice(0, 2).map((tagId) => {
                    const tag = AVAILABLE_TAGS.find((t) => t.id === tagId);
                    return <Tag key={tagId}>{tag?.name || tagId}</Tag>;
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
      {(currentError || exceedsLimit) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {exceedsLimit
            ? 'Cannot load more pages. You have reached the maximum limit.'
            : currentError}
        </div>
      )}

      {/* Loading state */}
      {currentLoading && (
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
        {currentMangaList.map((manga) => (
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

              {/* Floating action (Follow/Unfollow) */}
              <Button
                size="sm"
                className={`absolute cursor-pointer right-2 top-2 z-10 shadow transition-colors ${
                  isAuthenticated && isFollowed(manga.id)
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white/90 text-black hover:bg-white'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleFollow(manga.id);
                }}
                disabled={isAuthenticated && isLoadingManga(manga.id)}
              >
                {isAuthenticated && isLoadingManga(manga.id) ? (
                  <>
                    <div className="mr-1 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Heart
                      className={`mr-1 h-4 w-4 ${isAuthenticated && isFollowed(manga.id) ? 'fill-current' : ''}`}
                    />
                    {isAuthenticated && isFollowed(manga.id) ? 'Unfollow' : 'Follow'}
                  </>
                )}
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
          total={limitedTotal}
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
