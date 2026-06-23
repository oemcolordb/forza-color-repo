'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getAdvancedMaterialStyle } from '@/lib/utils/colorUtils';

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
  rating_avg?: number;
  rating_count?: number;
  createdAt: string;
}

interface PaletteCardProps {
  palette: Palette;
  sessionId: string;
  onTagClick?: (_tag: string) => void;
}

export default function PaletteCard({ palette, sessionId, onTagClick }: PaletteCardProps) {
  const [likes, setLikes] = useState(palette.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Rating State
  const [ratingAvg, setRatingAvg] = useState(palette.rating_avg || 0);
  const [ratingCount, setRatingCount] = useState(palette.rating_count || 0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isRating, setIsRating] = useState(false);

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

    // Check initial rating status
    const checkRating = async () => {
      try {
        const res = await fetch(`/api/palettes/${palette.id}/rate?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setRatingAvg(data.rating_avg);
          setRatingCount(data.rating_count);
          setUserRating(data.userRating);
        }
      } catch (err) {
        console.error('Failed to check rating status', err);
      }
    };

    if (sessionId) {
      checkLike();
      checkRating();
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

  const handleRate = async (ratingVal: number) => {
    if (isRating || !sessionId) return;
    setIsRating(true);

    try {
      const res = await fetch(`/api/palettes/${palette.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, rating: ratingVal }),
      });

      if (!res.ok) throw new Error('Failed to submit rating');
      const data = await res.json();
      setRatingAvg(data.rating_avg);
      setRatingCount(data.rating_count);
      setUserRating(data.userRating);
    } catch (err) {
      console.error('Failed to submit rating', err);
    } finally {
      setIsRating(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {/* Colors Strip */}
      <div className="flex h-32 w-full">
        {palette.colors.map((color, idx) => {
          const style = getAdvancedMaterialStyle(
            color.color1,
            color.color2,
            color.colorType
          );

          return (
            <div
              key={idx}
              className="group relative flex-1 border-r border-white/10 last:border-0"
              style={style}
            >
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {color.colorName} ({color.make})
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1" title={palette.name}>
              {palette.name}
            </h3>
            {palette.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {palette.description}
              </p>
            )}

            {/* Average rating star display */}
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-sm">
                    {ratingAvg >= star ? '★' : ratingAvg >= star - 0.5 ? '½' : '☆'}
                  </span>
                ))}
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200">{ratingAvg ? ratingAvg.toFixed(1) : 'Unrated'}</span>
              <span>({ratingCount})</span>
            </div>
          </div>
          <button
            onClick={handleLike}
            disabled={isLiking || !sessionId}
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

        {/* Interactive User Rating Stars */}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {userRating ? 'Your rating:' : 'Rate setup:'}
          </span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = hoverRating !== null ? hoverRating >= star : (userRating ?? 0) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  disabled={!sessionId || isRating}
                  className={`text-lg transition-all hover:scale-125 focus:outline-none disabled:opacity-50 ${
                    active
                      ? 'text-amber-400 font-bold drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]'
                      : 'text-gray-300 dark:text-gray-600 hover:text-amber-300'
                  }`}
                  title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
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
