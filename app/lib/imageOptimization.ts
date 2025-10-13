// Image optimization utilities for WebP/AVIF support
import { useState, useEffect, useCallback } from 'react'

export class ImageOptimizer {
  private static supportsWebP: boolean | null = null
  private static supportsAVIF: boolean | null = null

  static async checkWebPSupport(): Promise<boolean> {
    if (this.supportsWebP !== null) return this.supportsWebP

    return new Promise((resolve) => {
      const webP = new Image()
      webP.onload = webP.onerror = () => {
        this.supportsWebP = webP.height === 2
        resolve(this.supportsWebP)
      }
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }

  static async checkAVIFSupport(): Promise<boolean> {
    if (this.supportsAVIF !== null) return this.supportsAVIF

    return new Promise((resolve) => {
      const avif = new Image()
      avif.onload = avif.onerror = () => {
        this.supportsAVIF = avif.height === 2
        resolve(this.supportsAVIF)
      }
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
    })
  }

  static async getOptimalFormat(): Promise<'avif' | 'webp' | 'jpg'> {
    const [supportsAVIF, supportsWebP] = await Promise.all([
      this.checkAVIFSupport(),
      this.checkWebPSupport()
    ])

    if (supportsAVIF) return 'avif'
    if (supportsWebP) return 'webp'
    return 'jpg'
  }

  static getOptimizedImageUrl(baseUrl: string, width?: number, quality?: number): string {
    const url = new URL(baseUrl, window.location.origin)
    
    if (width) url.searchParams.set('w', width.toString())
    if (quality) url.searchParams.set('q', quality.toString())
    
    return url.toString()
  }

  static async loadOptimizedImage(src: string, width?: number, quality = 75): Promise<string> {
    const format = await this.getOptimalFormat()
    
    // If it's already an optimized format or external URL, return as-is
    if (src.includes('http') && !src.includes(window.location.hostname)) {
      return src
    }

    // Generate optimized URL
    const optimizedUrl = this.getOptimizedImageUrl(src, width, quality)
    
    // Add format parameter if supported
    if (format !== 'jpg') {
      const url = new URL(optimizedUrl)
      url.searchParams.set('f', format)
      return url.toString()
    }

    return optimizedUrl
  }

  static preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  }

  static async preloadOptimizedImages(sources: string[], width?: number): Promise<void> {
    const format = await this.getOptimalFormat()
    
    const preloadPromises = sources.map(async (src) => {
      const optimizedSrc = await this.loadOptimizedImage(src, width)
      return this.preloadImage(optimizedSrc)
    })

    await Promise.all(preloadPromises)
  }

  static createResponsiveImageSrcSet(baseSrc: string, sizes: number[] = [320, 640, 1024, 1280]): string {
    return sizes
      .map(size => `${this.getOptimizedImageUrl(baseSrc, size)} ${size}w`)
      .join(', ')
  }

  static async compressImage(file: File, maxWidth = 1024, quality = 0.8): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio

        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(resolve!, 'image/jpeg', quality)
      }

      img.src = URL.createObjectURL(file)
    })
  }
}

// React hook for image optimization
export function useImageOptimization() {
  const [format, setFormat] = useState<'avif' | 'webp' | 'jpg'>('jpg')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ImageOptimizer.getOptimalFormat().then((optimalFormat) => {
      setFormat(optimalFormat)
      setIsLoading(false)
    })
  }, [])

  const getOptimizedSrc = useCallback(async (src: string, width?: number, quality?: number) => {
    return ImageOptimizer.loadOptimizedImage(src, width, quality)
  }, [])

  return { format, isLoading, getOptimizedSrc }
}