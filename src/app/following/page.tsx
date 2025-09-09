'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Table, Pagination, Button as AntButton, Popconfirm, Tag } from 'antd';
import { Button } from '@/components/ui/button';
import { Heart, User, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFollowedManga, useToggleFollowManga } from '@/hooks/useMangaQuery';
import { useAuth } from '@/hooks/useAuth';
import type { Manga } from '@/types/manga';

const ITEMS_PER_PAGE = 8;

export default function FollowingPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  // Authentication check
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch followed manga using React Query
  const { data: followedManga = [], isLoading, error } = useFollowedManga();
  const { toggleFollow, isLoadingManga } = useToggleFollowManga();

  // Handle unfollow with confirmation
  const handleUnfollow = (mangaId: string) => {
    toggleFollow(mangaId);
  };

  // Pagination logic - reverse order to show newest first
  const reversedManga = [...followedManga].reverse();
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = reversedManga.slice(startIndex, endIndex);

  // Table columns configuration
  const columns = [
    {
      dataIndex: 'coverUrl',
      key: 'cover',
      width: 80,
      render: (coverUrl: string, record: Manga) => (
        <div className="w-12 h-16 overflow-hidden rounded">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={record.attributes.title.en || 'Manga'}
              width={48}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">No Cover</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Title',
      dataIndex: ['attributes', 'title', 'en'],
      key: 'title',
      render: (title: string, record: Manga) => (
        <Link
          href={`/manga-detail/${record.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
        >
          {title || 'No Title'}
        </Link>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: (author: string) => (
        <div className="flex items-center gap-1">
          <User className="h-4 w-4 text-gray-500" />
          <span>{author || 'Unknown'}</span>
        </div>
      ),
    },
    {
      title: 'Year',
      dataIndex: ['attributes', 'year'],
      key: 'year',
      width: 100,
      render: (year: number) =>
        year ? (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{year}</span>
          </div>
        ) : null,
    },
    {
      title: 'Status',
      dataIndex: ['attributes', 'status'],
      key: 'status',
      width: 120,
      render: (status: string) => {
        if (!status) return null;
        const color = status === 'completed' ? 'green' : status === 'ongoing' ? 'blue' : 'orange';
        return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
      },
    },
    {
      title: 'Tags',
      dataIndex: ['attributes', 'tags'],
      key: 'tags',
      render: (tags: any[]) => (
        <div className="flex flex-wrap gap-1">
          {tags?.slice(0, 2).map((tag, idx) => (
            <Tag key={idx}>{tag.attributes.name.en}</Tag>
          ))}
          {tags?.length > 2 && <Tag>+{tags.length - 2}</Tag>}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_: any, record: Manga) => (
        <Popconfirm
          title="Unfollow Manga"
          description={`Are you sure you want to unfollow "${record.attributes.title.en || 'this manga'}"?`}
          onConfirm={() => handleUnfollow(record.id)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{
            danger: true,
            loading: isLoadingManga(record.id),
          }}
        >
          <AntButton
            danger
            size="small"
            loading={isLoadingManga(record.id)}
            icon={<Heart className="h-4 w-4" />}
          >
            Unfollow
          </AntButton>
        </Popconfirm>
      ),
    },
  ];

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Following Manga</h1>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading your followed manga...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Following Manga</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error.message || 'Failed to load followed manga'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Following Manga</h1>
        <div className="text-gray-600">
          ({followedManga.length} manga{followedManga.length !== 1 ? 's' : ''})
        </div>
      </div>

      {/* Empty state */}
      {followedManga.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Followed Manga</h3>
          <p className="text-gray-600 mb-4">
            You haven't followed any manga yet. Start exploring and follow your favorite manga!
          </p>
          <Link href="/">
            <Button>Browse Manga</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Table */}
          <Table
            columns={columns}
            dataSource={currentPageData}
            pagination={false}
            rowKey="id"
            className="shadow-sm"
            scroll={{ x: 800 }}
          />

          {/* Pagination */}
          {followedManga.length > ITEMS_PER_PAGE && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={currentPage}
                pageSize={ITEMS_PER_PAGE}
                total={followedManga.length}
                showSizeChanger={false}
                showQuickJumper={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} manga`}
                onChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
