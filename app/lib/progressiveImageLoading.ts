/**
 * Progressive Image Loading Utility
 * Provides blur placeholders and lazy loading for better UX
 */

/**
 * Generate a tiny blur placeholder from image
 * @param file - Image file
 * @returns Base64 blur placeholder
 */
export async function generateBlurPlaceholder(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const url = URL.createObjectURL(file);

    img.onload = () => {
      // Create tiny 10x10 placeholder
      canvas.width = 10;
      canvas.height = 10;

      // Draw scaled down image
      ctx.drawImage(img, 0, 0, 10, 10);

      // Get base64 data
      const blurDataUrl = canvas.toDataURL('image/jpeg', 0.1);

      URL.revokeObjectURL(url);
      resolve(blurDataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Progressive image loader with callbacks
 */
export class ProgressiveImageLoader {
  private img: HTMLImageElement | null = null;
  private objectUrl: string | null = null;

  /**
   * Load image progressively
   * @param file - Image file
   * @param onProgress - Progress callback (0-100)
   * @param onLoad - Load complete callback
   * @param onError - Error callback
   */
  async load(
    file: File,
    onProgress?: (progress: number) => void,
    onLoad?: (dataUrl: string) => void,
    onError?: (error: Error) => void
  ): Promise<string> {
    try {
      // Generate blur placeholder first
      onProgress?.(10);
      const blurPlaceholder = await generateBlurPlaceholder(file);
      onProgress?.(30);

      // Load full image
      const dataUrl = await this.loadFullImage(file, (progress) => {
        onProgress?.(30 + progress * 0.7); // 30-100%
      });

      onProgress?.(100);
      onLoad?.(dataUrl);

      return dataUrl;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      onError?.(err);
      throw err;
    }
  }

  /**
   * Load full image with progress tracking
   */
  private loadFullImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress?.(progress);
        }
      };

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Cancel loading
   */
  cancel(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    if (this.img) {
      this.img.onload = null;
      this.img.onerror = null;
      this.img.src = '';
      this.img = null;
    }
  }
}

/**
 * Lazy load image with Intersection Observer
 * @param element - Image element
 * @param src - Image source URL
 * @param options - Intersection observer options
 */
export function lazyLoadImage(
  element: HTMLImageElement,
  src: string,
  options: IntersectionObserverInit = {}
): () => void {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = src;
        observer.unobserve(img);
      }
    });
  }, defaultOptions);

  observer.observe(element);

  // Return cleanup function
  return () => {
    observer.unobserve(element);
    observer.disconnect();
  };
}

/**
 * Preload images in background
 * @param urls - Array of image URLs
 * @param onProgress - Progress callback
 */
export async function preloadImages(
  urls: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  let loaded = 0;
  const total = urls.length;

  const promises = urls.map((url) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        loaded++;
        onProgress?.(loaded, total);
        resolve();
      };

      img.onerror = () => {
        loaded++;
        onProgress?.(loaded, total);
        reject(new Error(`Failed to load: ${url}`));
      };

      img.src = url;
    });
  });

  await Promise.allSettled(promises);
}

/**
 * Create blur CSS filter for placeholder
 * @param intensity - Blur intensity (0-20)
 */
export function createBlurFilter(intensity: number = 10): string {
  return `blur(${intensity}px)`;
}

/**
 * Fade in animation for loaded images
 */
export function fadeInImage(element: HTMLImageElement, duration: number = 300): void {
  element.style.opacity = '0';
  element.style.transition = `opacity ${duration}ms ease-in-out`;

  // Trigger reflow
  element.offsetHeight;

  element.style.opacity = '1';
}
