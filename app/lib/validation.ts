import { z } from 'zod';

// HSB Color Schema
export const hsbColorSchema = z.object({
  h: z.number().min(0).max(1, 'Hue must be between 0 and 1'),
  s: z.number().min(0).max(1, 'Saturation must be between 0 and 1'),
  b: z.number().min(0).max(1, 'Brightness must be between 0 and 1')
});

// Car Color Schema
export const carColorSchema = z.object({
  make: z.string().min(1).max(100, 'Make must be 1-100 characters'),
  model: z.string().min(1).max(100, 'Model must be 1-100 characters'),
  year: z.number().int().min(1900).max(2100).nullable(),
  colorName: z.string().min(1).max(255, 'Color name must be 1-255 characters'),
  colorType: z.string().min(1).max(50, 'Color type must be 1-50 characters'),
  color1: hsbColorSchema,
  color2: hsbColorSchema
});

// Extracted Color Schema (for image extraction)
export const extractedColorSchema = z.object({
  rgb: z.tuple([
    z.number().int().min(0).max(255),
    z.number().int().min(0).max(255),
    z.number().int().min(0).max(255)
  ]),
  hsb: hsbColorSchema,
  percentage: z.number().min(0).max(100),
  pixelCount: z.number().int().min(0).optional(),
  name: z.string().max(100).optional()
});

// Scan Input Schema (for saving scans)
export const scanInputSchema = z.object({
  userId: z.string().min(1).max(100, 'User ID must be 1-100 characters'),
  imageName: z.string().min(1).max(255, 'Image name must be 1-255 characters'),
  extractedColors: z.array(extractedColorSchema).min(1).max(50, 'Must have 1-50 extracted colors'),
  matches: z.array(carColorSchema).max(100, 'Maximum 100 matches allowed'),
  imageData: z.string().max(10485760, 'Image data must be less than 10MB') // 10MB base64 limit
});

// Scan ID Schema (for GET/DELETE operations)
export const scanIdSchema = z.object({
  id: z.string().uuid('Invalid scan ID format')
});

// User ID Schema
export const userIdSchema = z.object({
  userId: z.string().min(1).max(100, 'User ID must be 1-100 characters')
});

// Export types
export type HSBColor = z.infer<typeof hsbColorSchema>;
export type CarColor = z.infer<typeof carColorSchema>;
export type ExtractedColor = z.infer<typeof extractedColorSchema>;
export type ScanInput = z.infer<typeof scanInputSchema>;
export type ScanId = z.infer<typeof scanIdSchema>;
export type UserId = z.infer<typeof userIdSchema>;

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // Remove non-printable characters
    .trim();
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters
    .replace(/\.{2,}/g, '.') // Prevent path traversal
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
}

export function sanitizeUserId(userId: string): string {
  return userId
    .replace(/[^a-zA-Z0-9_-]/g, '') // Only allow alphanumeric, underscore, hyphen
    .substring(0, 100);
}

/**
 * Sanitize search query
 * @param query - Search query string
 * @returns Sanitized query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[<>"']/g, '') // Remove potential XSS characters
    .trim()
    .substring(0, 200); // Limit length
}

/**
 * Validate image file
 * @param file - File to validate
 * @throws Error if file is invalid
 */
export function validateImageFile(file: File): void {
  // Check file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Image file is too large (max 50MB)');
  }

  // Check file extension
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    throw new Error('Invalid image format. Supported: JPG, PNG, GIF, WebP, BMP');
  }
}

/**
 * Handle error and return user-friendly message
 * @param error - Error object
 * @returns Error with user-friendly message
 */
export function handleError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  return new Error('An unexpected error occurred');
}
