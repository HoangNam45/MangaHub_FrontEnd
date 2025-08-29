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
      } = params;

      const response = await axiosClient.get('/manga', {
        params: {
          limit,
          offset,
          order: order.latestUploadedChapter,
          language: availableTranslatedLanguage,
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
      const { limit = 25, offset = 0, availableTranslatedLanguage = ['en'] } = params;

      const response = await axiosClient.get('/manga/search', {
        params: {
          q: query,
          limit,
          offset,
          language: availableTranslatedLanguage,
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
};
