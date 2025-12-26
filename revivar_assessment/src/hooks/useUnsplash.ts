import { useState, useEffect, useCallback } from 'react';
import { unsplashService } from '../lib/unsplash';
import { UnsplashImage, PaginationInfo } from '../lib/types';

interface UseUnsplashReturn {
  randomImages: UnsplashImage[];
  searchResults: UnsplashImage[];
  searchQuery: string;
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
  fetchRandomImages: () => Promise<void>;
  searchImages: (query: string, page?: number) => Promise<void>;
  clearSearch: () => void;
}

export const useUnsplash = (): UseUnsplashReturn => {
  const [randomImages, setRandomImages] = useState<UnsplashImage[]>([]);
  const [searchResults, setSearchResults] = useState<UnsplashImage[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    perPage: 12,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const images = await unsplashService.getRandomImages(4);
      setRandomImages(images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchImages = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) {
      clearSearch();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await unsplashService.searchImages(query, page, pagination.perPage);
      setSearchResults(response.results);
      setPagination(prev => ({
        ...prev,
        page,
        total: response.total,
        totalPages: response.total_pages,
      }));
      setSearchQuery(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search images');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.perPage]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1, total: 0, totalPages: 0 }));
  }, []);

  useEffect(() => {
    fetchRandomImages();
  }, [fetchRandomImages]);

  return {
    randomImages,
    searchResults,
    searchQuery,
    pagination,
    isLoading,
    error,
    fetchRandomImages,
    searchImages,
    clearSearch,
  };
};