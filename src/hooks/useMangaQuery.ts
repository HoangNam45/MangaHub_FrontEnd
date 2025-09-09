import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mangaService } from '@/services/mangaService';
import { useAuth } from '@/hooks/useAuth';
import type { Manga, FetchMangaParams } from '@/types/manga';

// Query Keys
export const mangaKeys = {
  all: ['manga'] as const,
  lists: () => [...mangaKeys.all, 'list'] as const,
  list: (params: FetchMangaParams) => [...mangaKeys.lists(), params] as const,
  searches: () => [...mangaKeys.all, 'search'] as const,
  search: (query: string, params: FetchMangaParams) =>
    [...mangaKeys.searches(), query, params] as const,
  followed: () => [...mangaKeys.all, 'followed'] as const,
  followedIds: () => [...mangaKeys.all, 'followedIds'] as const,
  detail: (id: string) => [...mangaKeys.all, 'detail', id] as const,
};

// Fetch manga list with pagination
export function useMangaList(params: FetchMangaParams) {
  return useQuery({
    queryKey: mangaKeys.list(params),
    queryFn: () => mangaService.fetchMangaList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Search manga
export function useSearchManga(query: string, params: FetchMangaParams, enabled: boolean = true) {
  return useQuery({
    queryKey: mangaKeys.search(query, params),
    queryFn: () => mangaService.searchManga(query, params),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch followed manga IDs only (lightweight for main page and detail page)
export function useFollowedMangaIds() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: mangaKeys.followedIds(),
    queryFn: () => mangaService.getFollowedMangaIds(),
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch followed manga (only when authenticated) - For following page that needs full data
export function useFollowedManga() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: mangaKeys.followed(),
    queryFn: () => mangaService.getFollowedManga(100, 0), // Fetch 100 items to avoid the 20 limit
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Follow manga mutation
export function useFollowManga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mangaId: string) => mangaService.followingManga(mangaId),
    onSuccess: (_, mangaId) => {
      // Optimistically update followed manga IDs list
      queryClient.setQueryData(mangaKeys.followedIds(), (oldData: string[] | undefined) => {
        if (!oldData) return [mangaId];
        if (!oldData.includes(mangaId)) {
          return [...oldData, mangaId];
        }
        return oldData;
      });

      // Also update full followed manga list if it exists
      queryClient.setQueryData(mangaKeys.followed(), (oldData: Manga[] | undefined) => {
        if (!oldData) return oldData;
        // Find manga from cache
        const mangaFromCache = queryClient
          .getQueriesData({ queryKey: mangaKeys.lists() })
          .flatMap(([, data]) => (data as any)?.data || [])
          .find((manga: Manga) => manga.id === mangaId);

        if (mangaFromCache && !oldData.some((manga) => manga.id === mangaId)) {
          return [...oldData, mangaFromCache];
        }
        return oldData;
      });

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: mangaKeys.followedIds() });
      queryClient.invalidateQueries({ queryKey: mangaKeys.followed() });
    },
  });
}

// Unfollow manga mutation
export function useUnfollowManga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mangaId: string) => mangaService.unfollowingManga(mangaId),
    onSuccess: (_, mangaId) => {
      // Optimistically update followed manga IDs list
      queryClient.setQueryData(mangaKeys.followedIds(), (oldData: string[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter((id) => id !== mangaId);
      });

      // Also update full followed manga list if it exists
      queryClient.setQueryData(mangaKeys.followed(), (oldData: Manga[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter((manga) => manga.id !== mangaId);
      });

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: mangaKeys.followedIds() });
      queryClient.invalidateQueries({ queryKey: mangaKeys.followed() });
    },
  });
}

// Combined hook for follow/unfollow
export function useToggleFollowManga() {
  const followMutation = useFollowManga();
  const unfollowMutation = useUnfollowManga();
  const { data: followedMangaIds = [] } = useFollowedMangaIds();

  const toggleFollow = (mangaId: string) => {
    const isFollowed = followedMangaIds.includes(mangaId);

    if (isFollowed) {
      unfollowMutation.mutate(mangaId);
    } else {
      followMutation.mutate(mangaId);
    }
  };

  // Check if specific manga is loading
  const isLoadingManga = (mangaId: string) => {
    return (
      (followMutation.isPending && followMutation.variables === mangaId) ||
      (unfollowMutation.isPending && unfollowMutation.variables === mangaId)
    );
  };

  return {
    toggleFollow,
    isLoading: followMutation.isPending || unfollowMutation.isPending, // General loading state
    isLoadingManga, // Per-manga loading state
    isFollowed: (mangaId: string) => followedMangaIds.includes(mangaId),
    followedMangaIds,
  };
}
