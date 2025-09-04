export interface Manga {
  id: string;
  attributes: {
    title: { en?: string };
    year?: number;
    status?: string;
    tags?: { attributes: { name: { en?: string } } }[];
  };
  relationships: {
    id: string;
    type: 'cover_art' | 'author' | 'artist' | string;
    attributes?: {
      fileName?: string;
      name?: { en?: string } | string;
    };
  }[];
  coverUrl?: string;
  author?: string;
}

export interface MangaListResponse {
  data: Manga[];
  total: number;
}

export interface FetchMangaParams {
  limit?: number;
  offset?: number;
  order?: Record<string, string>;
  availableTranslatedLanguage?: string[];
  includes?: string[];
  status?: string[]; // Keep as array for API compatibility
  includedTags?: string[];
}

export interface Tag {
  id: string;
  attributes: {
    name: { en: string };
  };
}

export interface MangaFilterProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: FilterState) => void;
  availableTags: Array<{ id: string; name: string }>;
  currentFilters: FilterState;
}

export interface FilterState {
  tags: string[];
  status: string[]; // Change back to string[] for multiple selection
}
