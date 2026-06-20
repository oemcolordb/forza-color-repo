'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PaletteColor {
  colorId: string;
  colorName: string;
  make: string;
  model?: string;
  colorType?: string;
  color1: { h: number; s: number; b: number };
  color2?: { h: number; s: number; b: number };
}

interface Palette {
  id: string;
  name: string;
  description: string;
  tags: string[];
  colors: PaletteColor[];
  authorId: string;
  likes: number;
  createdAt: string;
}

interface PaletteCardProps {
  palette: Palette;
  sessionId: string;
  onTagClick?: (tag: string) => void;
}

export default function PaletteCard({ palette, sessionId, onTagClick }: PaletteCardProps) {
  const [likes, setLikes] = useState(palette.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    // Check initial like status
    const checkLike = async () => {
      try {
        const res = await fetch(`/api/palettes/${palette.id}/like?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setIsLiked(data.liked);
        }
      } catch (err) {
        console.error('Failed to check like status', err);
      }
    };
    if (sessionId) {
      checkLike();
    }
  }, [palette.id, sessionId]);

  const handleLike = async () => {
    if (isLiking || !sessionId) return;
    setIsLiking(true);

    // Optimistic UI
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikes(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);

    try {
      const res = await fetch(`/api/palettes/${palette.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) throw new Error('Failed to toggle like');
      const data = await res.json();
      setIsLiked(data.liked);
    } catch (err) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikes(prev => wasLiked ? prev + 1 : Math.max(0, prev - 1));
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {/* Colors Strip */}
      <div className="flex h-32 w-full">
        {palette.colors.map((color, idx) => {
          const h1 = color.color1.h * 360;
          const s1 = color.color1.s * 100;
          const b1 = color.color1.b * 100;
          
          const h2 = (color.color2?.h ?? color.color1.h) * 360;
          const s2 = (color.color2?.s ?? color.color1.s) * 100;
          const b2 = (color.color2?.b ?? color.color1.b) * 100;

          const bgStyle = {
            background: `linear-gradient(135deg, hsl(${h1}, ${s1}%, ${b1}%), hsl(${h2}, ${s2}%, ${b2}%))`
          };

          return (
            <div
              key={idx}
              className="group relative flex-1 border-r border-white/10 last:border-0"
              style={bgStyle}
            >
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {color.colorName} ({color.make})
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1" title={palette.name}>
              {palette.name}
            </h3>
            {palette.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {palette.description}
              </p>
            )}
          </div>
          <button
            onClick={handleLike}
            disabled={isLiking || !sessionId}
            aria-label={isLiked ? `Unlike palette, ${likes} likes` : `Like palette, ${likes} likes`}
            aria-pressed={isLiked}
            className={`ml-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              isLiked 
                ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            {likes}
          </button>
        </div>

        <div className="mt-auto pt-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {palette.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
              >
                #{tag}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Added {formatDistanceToNow(new Date(palette.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
}
