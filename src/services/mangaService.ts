import axiosClient from '@/lib/axiosClient';
import type { Manga, MangaListResponse, FetchMangaParams } from '@/types/manga';

export const mangaService = {
  // Fetch manga list từ backend
  async fetchMangaList(params: FetchMangaParams = {}): Promise<MangaListResponse> {
    try {
      const {
        limit = 15,
        offset = 0,
        order = { latestUploadedChapter: 'desc' },
        availableTranslatedLanguage = ['en'],
        status,
        includedTags,
      } = params;

      const response = await axiosClient.get('/manga', {
        params: {
          limit,
          offset,
          order: order.latestUploadedChapter,
          language: availableTranslatedLanguage,
          status: status?.join(','),
          includedTags: includedTags?.join(','),
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch manga data');
      }

      return {
        data: response.data.data,
        total: response.data.pagination.total,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch manga data'
      );
    }
  },

  // Search manga từ backend
  async searchManga(
    query: string,
    params: Omit<FetchMangaParams, 'order'> = {}
  ): Promise<MangaListResponse> {
    try {
      const {
        limit = 25,
        offset = 0,
        availableTranslatedLanguage = ['en'],
        status,
        includedTags,
      } = params;

      const response = await axiosClient.get('/manga/search', {
        params: {
          q: query,
          limit,
          offset,
          language: availableTranslatedLanguage,
          status: status?.join(','),
          includedTags: includedTags?.join(','),
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to search manga');
      }

      return {
        data: response.data.data,
        total: response.data.pagination.total,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to search manga');
    }
  },

  // Fetch manga by ID từ backend
  async getMangaById(id: string): Promise<Manga> {
    try {
      const response = await axiosClient.get(`/manga/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch manga details');
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch manga details'
      );
    }
  },

  async getMangaDetail(id: string): Promise<Manga> {
    try {
      const response = await axiosClient.get(`/manga/${id}/detail`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch manga details');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch manga details'
      );
    }
  },

  async getChapterImages(chapterId: string): Promise<string[]> {
    try {
      const response = await axiosClient.get(`/manga/chapter/${chapterId}/images`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch chapter pages');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch chapter pages'
      );
    }
  },

  async followingManga(mangaId: string): Promise<void> {
    try {
      const response = await axiosClient.post(`/follow/${mangaId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to follow manga');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to follow manga');
    }
  },
  async unfollowingManga(mangaId: string): Promise<void> {
    try {
      const response = await axiosClient.delete(`/follow/${mangaId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to unfollow manga');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to unfollow manga');
    }
  },

  async getFollowedMangaIds(): Promise<string[]> {
    try {
      const response = await axiosClient.get('/follow');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch followed manga');
      }
      return response.data.data; // Expecting array of manga IDs
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch followed manga'
      );
    }
  },

  // Keep the original method for following page that needs full data
  async getFollowedManga(limit?: number, offset?: number): Promise<Manga[]> {
    try {
      const params: any = {};
      if (limit !== undefined) params.limit = limit;
      if (offset !== undefined) params.offset = offset;

      const response = await axiosClient.get('/follow/details', { params });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch followed manga');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch followed manga'
      );
    }
  },
};
