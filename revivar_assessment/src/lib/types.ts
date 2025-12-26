export interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  width: number;
  height: number;
  color: string | null;
  user: {
    name: string;
    username: string;
  };
}

export interface SearchResponse {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
}

export interface CardDesign {
  image: UnsplashImage;
  userName: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  overlayOpacity: number;
}

export interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}