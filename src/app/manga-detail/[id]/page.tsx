'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import { Tag } from 'antd';
import { mangaService } from '@/services/mangaService';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MangaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manga, setManga] = useState<any>(null);
  const [recommendedManga, setRecommendedManga] = useState<any[]>([]);

  const { id } = use(params);

  useEffect(() => {
    async function fetchMangaDetail() {
      setLoading(true);
      setError(null);
      try {
        const [mangaDetail, recommendedList] = await Promise.all([
          mangaService.getMangaDetail(id),
          mangaService.fetchMangaList({ limit: 4, offset: 0 }), // Fetch 6 recommended manga
        ]);
        setManga(mangaDetail);
        setRecommendedManga(recommendedList.data);
        console.log(mangaDetail);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch manga data');
      } finally {
        setLoading(false);
      }
    }

    fetchMangaDetail();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!manga) return null;

  return (
    <div className="flex flex-col">
      {/* Cover background */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <Image
          src={manga.manga.coverUrl}
          alt="cover"
          fill
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      </div>
      {/* Small cover, pulled up */}
      <div className="-mt-42 ml-30 z-99 flex">
        <Image
          src={manga.manga.coverUrl}
          alt="manga cover"
          width={192}
          height={256}
          className="w-48 h-64 object-cover rounded-lg shadow-lg "
          priority
        />
        <div className="text-white text-2xl ml-4 mt-24">
          <div className="min-h-14">
            {manga.manga.attributes.title.en}
            <div className="text-base font-light">{manga.manga.author}</div>
          </div>
          <div className="flex flex-wrap gap-2 mt-7">
            {manga.manga.attributes.tags?.map((tag: any, index: number) => (
              <Tag
                key={index}
                style={{
                  backgroundColor: 'white',
                  color: 'black',
                  fontSize: '12px',
                  padding: '4px 8px',
                  border: '1px solid #d1d5db',
                }}
              >
                {tag.attributes.name.en}
              </Tag>
            ))}
          </div>
          <div className="mt-3">
            <Link
              href={`/manga-detail/${manga.manga.id}/chapter/${manga.chapters[manga.chapters.length - 1]?.id}`}
            >
              <Button
                variant="outline"
                className="!text-black cursor-pointer bg-[#E5E7EB]  !text-base w-full"
              >
                Read from Beginning
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Chapters and Recommendations Section */}
      <div className="ml-30 mt-8 flex gap-8">
        {/* Chapters List */}
        <div className="flex flex-col overflow-y-auto max-h-140 gap-1 w-[45%]">
          <h3 className="text-lg font-bold mb-3 text-black">Chapters</h3>
          {manga.chapters.map((chapter: any, index: number) => (
            <Link
              key={index}
              href={`/manga-detail/${manga.manga.id}/chapter/${chapter.id}`}
              className="min-h-12 relative flex justify-between items-center bg-[#F9FAFB] hover:bg-[#E5E7EB] cursor-pointer w-full"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-[#E5E7EB]"></div>
              <div className=" ml-5 font-bold ">Chapter {manga.chapters.length - index}</div>
              <div className="mr-5 text-sm text-gray-600">
                {new Date(chapter.attributes.publishAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>

        {/* Recommended Manga */}
        <div className="flex flex-col w-[40%]">
          <h3 className="text-lg font-bold mb-3 text-black">Latest Manga</h3>
          <div className="grid grid-cols-1 gap-2">
            {recommendedManga.map((recommendedItem: any, idx: number) => (
              <Link
                key={idx}
                href={`/manga-detail/${recommendedItem.id}`}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 flex items-center h-28">
                  <Image
                    src={recommendedItem.coverUrl}
                    alt={recommendedItem.attributes?.title?.en || 'Manga'}
                    width={96}
                    height={112}
                    className="h-full w-24 object-cover rounded mr-3 group-hover:scale-105 transition-transform"
                    style={{ minWidth: 96, maxWidth: 120 }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2 text-black">
                      {recommendedItem.attributes?.title?.en || 'No Title'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {recommendedItem.author || 'Unknown Author'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
