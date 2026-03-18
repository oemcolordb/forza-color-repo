import imageCompression from 'browser-image-compression';

/**
 * Image compression options
 */
export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
  quality?: number;
}

/**
 * Default compression options
 */
const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 1, // 1MB max file size
  maxWidthOrHeight: 1920, // Max dimension
  useWebWorker: true, // Use web worker for better performance
  fileType: 'image/jpeg', // Convert to JPEG for better compression
  quality: 0.85 // 85% quality
};

/**
 * Compress an image file
 * @param file - Image file to compress
 * @param options - Compression options
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    console.time('Image Compression');
    
    const compressedFile = await imageCompression(file, mergedOptions);
    
    console.timeEnd('Image Compression');
    console.log('Original size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Compressed size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '%');
    
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Compress image and convert to base64
 * @param file - Image file to compress
 * @param options - Compression options
 * @returns Base64 data URL
 */
export async function compressImageToBase64(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const compressedFile = await compressImage(file, options);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert to base64'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(compressedFile);
  });
}

/**
 * Compress image for thumbnail (smaller size)
 * @param file - Image file
 * @returns Compressed thumbnail file
 */
export async function compressImageForThumbnail(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 0.1, // 100KB max
    maxWidthOrHeight: 300, // Small thumbnail
    quality: 0.7
  });
}

/**
 * Compress image for preview (medium size)
 * @param file - Image file
 * @returns Compressed preview file
 */
export async function compressImageForPreview(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 0.5, // 500KB max
    maxWidthOrHeight: 800, // Medium preview
    quality: 0.8
  });
}

/**
 * Check if image needs compression
 * @param file - Image file
 * @param maxSizeMB - Maximum size in MB
 * @returns True if compression is needed
 */
export function needsCompression(file: File, maxSizeMB: number = 1): boolean {
  return file.size > maxSizeMB * 1024 * 1024;
}

/**
 * Get image dimensions without loading full image
 * @param file - Image file
 * @returns Promise with width and height
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Validate and compress image in one step
 * @param file - Image file
 * @param options - Compression options
 * @returns Compressed file or throws error
 */
export async function validateAndCompressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size (before compression)
  const maxOriginalSize = 50 * 1024 * 1024; // 50MB max original
  if (file.size > maxOriginalSize) {
    throw new Error('Image file is too large (max 50MB)');
  }

  // Get dimensions
  const dimensions = await getImageDimensions(file);
  console.log('Image dimensions:', dimensions);

  // Compress if needed
  if (needsCompression(file, options.maxSizeMB || 1)) {
    return compressImage(file, options);
  }

  return file;
}
