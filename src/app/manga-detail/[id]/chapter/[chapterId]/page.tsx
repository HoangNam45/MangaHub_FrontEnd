'use client';

import { useEffect, useState, use } from 'react';
import { mangaService } from '@/services/mangaService';
import ChapterNavigation from '@/components/ChapterNavigation/ChapterNavigation';

export default function MangaChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<any>([]);
  const [manga, setManga] = useState<any>(null);
  const { id, chapterId } = use(params);

  console.log(pages.images);
  console.log(manga);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch chapter images and manga details
        const [chapterImages, mangaDetail] = await Promise.all([
          mangaService.getChapterImages(chapterId),
          mangaService.getMangaDetail(id),
        ]);

        setPages(chapterImages);
        setManga(mangaDetail);
        console.log(chapterImages);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch chapter data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [chapterId, id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!manga || !pages.images) return null;

  // Find current chapter index
  const currentChapterIndex = manga.chapters.findIndex((ch: any) => ch.id === chapterId);
  const currentChapterNumber = manga.chapters.length - currentChapterIndex;

  return (
    <div className="flex flex-col">
      {/* Navigation at top */}
      <ChapterNavigation
        mangaId={id}
        currentChapterId={chapterId}
        chapters={manga.chapters}
        currentChapterIndex={currentChapterIndex}
        currentChapterNumber={currentChapterNumber}
      />

      {/* Chapter pages */}
      <div className="flex flex-col items-center">
        {pages.images?.map((image: any, idx: number) => (
          <img
            key={idx}
            src={image.url}
            alt={`Page ${idx + 1}`}
            className="w-full max-w-3xl"
            loading="lazy"
          />
        ))}
      </div>

      {/* Navigation at bottom */}
      <ChapterNavigation
        mangaId={id}
        currentChapterId={chapterId}
        chapters={manga.chapters}
        currentChapterIndex={currentChapterIndex}
        currentChapterNumber={currentChapterNumber}
      />
    </div>
  );
}
