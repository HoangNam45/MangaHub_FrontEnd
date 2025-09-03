'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select } from 'antd';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ChapterNavigationProps {
  mangaId: string;
  currentChapterId: string;
  chapters: any[];
  currentChapterIndex: number;
  currentChapterNumber: number;
}

export default function ChapterNavigation({
  mangaId,
  currentChapterId,
  chapters,
  currentChapterIndex,
  currentChapterNumber,
}: ChapterNavigationProps) {
  const router = useRouter();

  // Navigation functions
  const goToPrevChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const prevChapter = chapters[currentChapterIndex + 1];
      router.push(`/manga-detail/${mangaId}/chapter/${prevChapter.id}`);
    }
  };

  const goToNextChapter = () => {
    if (currentChapterIndex > 0) {
      const nextChapter = chapters[currentChapterIndex - 1];
      router.push(`/manga-detail/${mangaId}/chapter/${nextChapter.id}`);
    }
  };

  const handleChapterSelect = (selectedChapterId: string) => {
    router.push(`/manga-detail/${mangaId}/chapter/${selectedChapterId}`);
  };

  // Create chapter options for select
  const chapterOptions = chapters.map((chapter: any, index: number) => ({
    value: chapter.id,
    label: `Chapter ${chapters.length - index}`,
  }));

  return (
    <div className="flex items-center justify-center gap-4 py-4 bg-white shadow-sm">
      <Button
        variant="outline"
        onClick={goToPrevChapter}
        disabled={currentChapterIndex >= chapters.length - 1}
        className="flex items-center cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Select
        value={currentChapterId}
        onChange={handleChapterSelect}
        options={chapterOptions}
        className="w-60"
        placeholder={`Chapter ${currentChapterNumber}`}
      />

      <Button
        variant="outline"
        onClick={goToNextChapter}
        disabled={currentChapterIndex <= 0}
        className="flex items-center cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
