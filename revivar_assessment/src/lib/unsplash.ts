import { UnsplashImage, SearchResponse } from "./types";

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const BASE_URL = 'https://api.unsplash.com';

if (!UNSPLASH_ACCESS_KEY) {
  throw new Error('Missing NEXT_PUBLIC_UNSPLASH_ACCESS_KEY environment variable');
}

export class UnsplashService {
  private async fetchFromUnsplash(endpoint: string, params: Record<string, string> = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    console.log('Unsplash Access Key:', UNSPLASH_ACCESS_KEY);

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    return response.json();
  }

  async getRandomImages(count: number = 4): Promise<UnsplashImage[]> {
    return this.fetchFromUnsplash('/photos/random', {
      count: count.toString(),
      orientation: 'portrait',
    });
  }

  async searchImages(query: string, page: number = 1, perPage: number = 12): Promise<SearchResponse> {
    return this.fetchFromUnsplash('/search/photos', {
      query,
      page: page.toString(),
      per_page: perPage.toString(),
      orientation: 'portrait',
    });
  }
}

export const unsplashService = new UnsplashService();