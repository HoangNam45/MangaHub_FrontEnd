import React from 'react';
import Image from 'next/image';
import { Carousel } from 'antd';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { trendingManga } from '@/data/trending-manga';

const TrendingManga: React.FC = () => {
  const router = useRouter();

  const handleMangaClick = (mangaId: string) => {
    router.push(`/manga-detail/${mangaId}`);
  };

  return (
    <Carousel autoplay autoplaySpeed={4000} dots>
      {trendingManga.map((manga) => (
        <div key={manga.id}>
          <div className="relative h-[400px]  w-full">
            <Image
              src={manga.img}
              alt={manga.title}
              fill
              onClick={() => handleMangaClick(manga.id)}
              className="object-cover cursor-pointer"
              priority={manga.id === 'a1c7c817-4e59-43b7-9365-09675a149a6f'} // Priority cho ảnh đầu tiên
            />
            {/* Lớp phủ màu đen nhẹ */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-0 items-center justify-between flex left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div>
                <div className="text-3xl mb-2 font-bold text-white">{manga.title}</div>
                <div className="text-white text-sm ">{manga.author} </div>
              </div>
              <Button
                variant="primary"
                className="absolute cursor-pointer bottom-6 right-6"
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn không cho trigger click của div cha
                  handleMangaClick(manga.id);
                }}
              >
                Read Now
              </Button>
            </div>
          </div>
        </div>
      ))}
    </Carousel>
  );
};

export default TrendingManga;
