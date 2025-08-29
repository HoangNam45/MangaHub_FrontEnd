'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, Heart, Calendar, User } from 'lucide-react';
import { Pagination, Tag } from 'antd';
import { mangaService } from '@/services/mangaService';
import type { Manga } from '@/types/manga';

export default function Home() {
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log(mangaList);

  // MangaDex API có giới hạn offset tối đa khoảng 10000
  const MAX_OFFSET = 10000;

  useEffect(() => {
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
          includes: ['cover_art', 'author', 'artist'],
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
  }, [page]);

  return (
    <div className="max-w-6xl mx-auto p-2">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Latest Manga</h2>
        <div className="flex items-center gap-2">
          <Input placeholder="Search manga..." className="w-64" />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading manga...</div>
        </div>
      )}

      {/* Manga grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {mangaList.map((manga) => (
          <Card
            key={manga.id}
            className="relative cursor-pointer flex flex-col overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
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
              <p className="line-clamp-2 font-semibold text-sm mb-1">
                {manga.attributes.title.en || 'No Title'}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 mb-2">
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {manga.author || 'Unknown'}
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
              <div className="flex flex-wrap gap-1 mt-auto">
                {manga.attributes.tags?.slice(0, 2).map((tag, idx) => (
                  <Tag key={idx}>{tag.attributes.name.en}</Tag>
                ))}
              </div>
            </div>

            {/* Floating action (Follow) */}
            <Button
              size="sm"
              className="absolute cursor-pointer right-2 top-2 z-10 bg-white/90 text-black hover:bg-white shadow"
            >
              <Heart className="mr-1 h-4 w-4 text-red-500" />
              Follow
            </Button>
          </Card>
        ))}
      </div>

      {/* Ant Design Pagination */}
      <div className="flex justify-center mt-6">
        <Pagination
          current={page}
          pageSize={25}
          total={total}
          showSizeChanger={false}
          onChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
}
