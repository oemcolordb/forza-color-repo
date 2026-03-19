'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProgressiveImageLoader, generateBlurPlaceholder } from '../lib/progressiveImageLoading';

interface UseProgressiveImageResult {
  src: string | null;
  blurDataUrl: string | null;
  isLoading: boolean;
  progress: number;
  error: string | null;
  load: (file: File) => Promise<void>;
}

/**
 * React hook for progressive image loading
 * Provides blur placeholder and loading progress
 */
export function useProgressiveImage(): UseProgressiveImageResult {
  const [src, setSrc] = useState<string | null>(null);
  const [blurDataUrl, setBlurDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setSrc(null);

    try {
      // Generate blur placeholder first
      const blur = await generateBlurPlaceholder(file);
      setBlurDataUrl(blur);
      setProgress(30);

      // Load full image
      const loader = new ProgressiveImageLoader();
      await loader.load(
        file,
        (prog) => setProgress(prog),
        (dataUrl) => setSrc(dataUrl),
        (err) => setError(err.message)
      );

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load image');
      setIsLoading(false);
    }
  }, []);

  return {
    src,
    blurDataUrl,
    isLoading,
    progress,
    error,
    load
  };
}

/**
 * React hook for lazy loading images
 */
export function useLazyImage(src: string, threshold: number = 0.01) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
            };
            img.src = src;
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    // Create dummy element for observation
    const element = document.createElement('div');
    observer.observe(element);

    return () => {
      observer.disconnect();
      img.onload = null;
    };
  }, [src, threshold]);

  return { imageSrc, isLoaded };
}
