"use client";

import { useState, useCallback } from 'react';
import { CardPreview } from '../components/CardPreview';
import { ImageGrid } from '../components/ImageGrid';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAnimation } from '../hooks/useAnimation';
import { useUnsplash } from '../hooks/useUnsplash';
import { UnsplashImage, CardDesign } from '../lib/types';

const FONT_OPTIONS = [
  'Arial, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'Helvetica, sans-serif',
  'Verdana, sans-serif',
  'Courier New, monospace',
];

const COLOR_OPTIONS = [
  '#FFFFFF', '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'
];

export default function Home() {
  const {
    randomImages,
    searchResults,
    searchQuery,
    pagination,
    isLoading,
    error,
    searchImages,
    clearSearch,
  } = useUnsplash();

  const { cardRef, gridRef, animateCardCreation } = useAnimation();

  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [fontFamily, setFontFamily] = useState<string>(FONT_OPTIONS[0]);
  const [textColor, setTextColor] = useState<string>(COLOR_OPTIONS[0]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const displayedImages = searchQuery ? searchResults : randomImages;

  const handleImageSelect = useCallback((image: UnsplashImage) => {
    setSelectedImage(image);
    animateCardCreation();
  }, [animateCardCreation]);

  const handleSearch = useCallback((query: string) => {
    searchImages(query, 1);
  }, [searchImages]);

  const handlePageChange = useCallback((page: number) => {
    searchImages(searchQuery, page);
  }, [searchImages, searchQuery]);

  const handleDownload = useCallback(async () => {
    if (!selectedImage || !userName.trim()) return;

    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Could not get canvas context');

      canvas.width = 800;
      canvas.height = 1000;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = selectedImage.urls.regular;
      });

      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Add overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Configure text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textColor;
      
      // Draw "Thank You"
      ctx.font = `bold 64px ${fontFamily}`;
      ctx.fillText('Thank You', canvas.width / 2, 120);
      
      // Draw user name
      ctx.font = `48px ${fontFamily}`;
      ctx.fillText(userName.trim(), canvas.width / 2, canvas.height - 80);

      // Create download link
      const link = document.createElement('a');
      link.download = `thank-you-card-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  }, [selectedImage, userName, fontFamily, textColor]);

  const currentDesign: CardDesign | null = selectedImage && userName.trim() ? {
    image: selectedImage,
    userName: userName.trim(),
    fontFamily,
    fontSize: 48,
    textColor,
    overlayOpacity: 0.3,
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Thank You Card Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create beautiful personalized thank you cards with stunning images from Unsplash
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Image Selection and Customization */}
          <div className="space-y-8">
            {/* Search */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">Find Images</h2>
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
              
              {searchQuery && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Showing results for "{searchQuery}"
                  </span>
                  <Button variant="outline" size="sm" onClick={clearSearch}>
                    Show Random
                  </Button>
                </div>
              )}
            </div>

            {/* Image Grid */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {searchQuery ? 'Search Results' : 'Featured Images'}
              </h2>
              <ImageGrid
                images={displayedImages}
                selectedImage={selectedImage}
                onImageSelect={handleImageSelect}
                isLoading={isLoading && displayedImages.length === 0}
              />
              
              {searchQuery && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>

            {/* Customization Options */}
            {selectedImage && (
              <div className="space-y-6 bg-white rounded-lg p-6 shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800">Customize Your Card</h2>
                
                <Input
                  label="Your Name"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="text-lg"
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font} value={font}>
                        {font.split(',')[0]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Text Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          textColor === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setTextColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Card Preview */}
          <div className="sticky top-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">Card Preview</h2>
              <div ref={cardRef}>
                <CardPreview
                  design={currentDesign}
                  onDownload={handleDownload}
                  isDownloading={isDownloading}
                />
              </div>
              
              {!userName.trim() && selectedImage && (
                <p className="text-orange-600 text-center">
                  Please enter your name to generate the card
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}