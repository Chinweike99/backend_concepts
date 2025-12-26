// import { UnsplashImage } from '@/lib/types';
import { clsx } from 'clsx';
import { useRef } from 'react';
import { UnsplashImage } from '../lib/types';

interface ImageGridProps {
  images: UnsplashImage[];
  selectedImage: UnsplashImage | null;
  onImageSelect: (image: UnsplashImage) => void;
  isLoading?: boolean;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  selectedImage,
  onImageSelect,
  isLoading = false,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[4/5] bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" ref={gridRef}>
      {images.map((image) => (
        <button
          key={image.id}
          className={clsx(
            'image-card group relative aspect-[4/5] rounded-lg overflow-hidden shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500',
            selectedImage?.id === image.id
              ? 'ring-4 ring-blue-500 scale-105'
              : 'ring-2 ring-gray-200'
          )}
          onClick={() => onImageSelect(image)}
        >
          <img
            src={image.urls.thumb}
            alt={image.alt_description || 'Unsplash image'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
        </button>
      ))}
    </div>
  );
};