import { AppError } from '../types'

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export const validateImageFile = (file: File): void => {
  if (!file.type.startsWith('image/')) {
    throw new ValidationError('Please select a valid image file', 'file')
  }
  
  if (file.size > 10 * 1024 * 1024) {
    throw new ValidationError('Image file is too large. Please select a file under 10MB.', 'file')
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError('Unsupported image format. Please use JPEG, PNG, WebP, or GIF.', 'file')
  }
}

export const sanitizeSearchQuery = (query: string): string => {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .substring(0, 100) // Limit length
}

export const validateColorData = (color: unknown): boolean => {
  if (!color || typeof color !== 'object') return false
  
  const c = color as Record<string, unknown>
  return (
    typeof c.make === 'string' &&
    typeof c.colorName === 'string' &&
    typeof c.colorType === 'string' &&
    c.color1 && typeof c.color1 === 'object' &&
    c.color2 && typeof c.color2 === 'object'
  )
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof ValidationError) {
    return {
      message: error.message,
      code: 'VALIDATION_ERROR',
      details: { field: error.field }
    }
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'GENERIC_ERROR',
      details: error.stack
    }
  }
  
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: error
  }
}