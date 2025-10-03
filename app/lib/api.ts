import { cache } from './cache'
import { handleError } from './validation'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  cache?: boolean
  timeout?: number
}

class ApiClient {
  private baseUrl: string
  private defaultTimeout = 10000

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      cache: useCache = true,
      timeout = this.defaultTimeout
    } = options

    const url = `${this.baseUrl}${endpoint}`
    const cacheKey = `api-${method}-${url}-${JSON.stringify(body)}`

    // Check cache for GET requests
    if (method === 'GET' && useCache) {
      const cached = cache.get<T>(cacheKey)
      if (cached) return cached
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Cache successful GET requests
      if (method === 'GET' && useCache) {
        cache.set(cacheKey, data, 5 * 60 * 1000) // 5 minutes
      }

      return data
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      
      throw handleError(error)
    }
  }

  get<T>(endpoint: string, options?: Omit<ApiOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  put<T>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  delete<T>(endpoint: string, options?: Omit<ApiOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const api = new ApiClient()

// Rate limiting utility
class RateLimiter {
  private requests = new Map<string, number[]>()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(key, validRequests)
    return true
  }

  getRemainingRequests(key: string): number {
    const requests = this.requests.get(key) || []
    const now = Date.now()
    const validRequests = requests.filter(time => now - time < this.windowMs)
    return Math.max(0, this.maxRequests - validRequests.length)
  }
}

export const rateLimiter = new RateLimiter()