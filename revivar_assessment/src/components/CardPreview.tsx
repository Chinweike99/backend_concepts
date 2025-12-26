import { useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { CardDesign } from '../lib/types';

interface CardPreviewProps {
  design: CardDesign | null;
  onDownload: () => void;
  isDownloading?: boolean;
}

export const CardPreview: React.FC<CardPreviewProps> = ({
  design,
  onDownload,
  isDownloading = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (design && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Set canvas dimensions
          canvas.width = 800;
          canvas.height = 1000; // 4:5 aspect ratio
          
          // Draw image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Add overlay for better text readability
          ctx.fillStyle = `rgba(0, 0, 0, ${design.overlayOpacity})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Configure text styles
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Draw "Thank You" text at top
          ctx.font = `bold 64px ${design.fontFamily}`;
          ctx.fillStyle = design.textColor;
          ctx.fillText('Thank You', canvas.width / 2, 120);
          
          // Draw user name at bottom
          ctx.font = `48px ${design.fontFamily}`;
          ctx.fillText(design.userName, canvas.width / 2, canvas.height - 80);
        };
        img.src = design.image.urls.regular;
      }
    }
  }, [design]);

  if (!design) {
    return (
      <div className="w-full  aspect-[4/5]  bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-lg">Select an image to preview your card</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-[4/5] bg-white rounded-lg shadow-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>
      <Button
        onClick={onDownload}
        isLoading={isDownloading}
        className="w-full"
      >
        Download Card
      </Button>
    </div>
  );
};