/**
 * Request Deduplication Utility
 * Prevents duplicate in-flight requests to the same endpoint
 */

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly maxAge: number;

  constructor(maxAge: number = 30000) { // 30 seconds default
    this.maxAge = maxAge;
    
    // Cleanup stale requests every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Execute a request with deduplication
   * If same request is in-flight, return existing promise
   * @param key - Unique key for the request
   * @param requestFn - Function that returns a promise
   * @returns Promise with request result
   */
  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already in-flight
    const pending = this.pendingRequests.get(key);
    
    if (pending) {
      // Check if request is still fresh
      if (Date.now() - pending.timestamp < this.maxAge) {
        console.log(`[Dedupe] Reusing in-flight request: ${key}`);
        return pending.promise;
      } else {
        // Stale request, remove it
        this.pendingRequests.delete(key);
      }
    }

    // Create new request
    console.log(`[Dedupe] Creating new request: ${key}`);
    const promise = requestFn()
      .finally(() => {
        // Remove from pending after completion
        this.pendingRequests.delete(key);
      });

    // Store pending request
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    return promise;
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pendingRequests.clear();
  }

  /**
   * Remove stale requests
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.maxAge) {
        this.pendingRequests.delete(key);
      }
    }
  }

  /**
   * Get statistics
   */
  getStats(): { pendingCount: number } {
    return {
      pendingCount: this.pendingRequests.size
    };
  }
}

// Singleton instance
const deduplicator = new RequestDeduplicator();

/**
 * Deduplicated fetch wrapper
 * @param url - Request URL
 * @param options - Fetch options
 * @returns Promise with response data
 */
export async function deduplicatedFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Create unique key from URL and method
  const method = options.method || 'GET';
  const key = `${method}:${url}`;

  return deduplicator.dedupe(key, async () => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  });
}

/**
 * Deduplicated fetch with custom key
 * Useful when you want to dedupe based on request body
 * @param key - Custom deduplication key
 * @param url - Request URL
 * @param options - Fetch options
 * @returns Promise with response data
 */
export async function deduplicatedFetchWithKey<T = any>(
  key: string,
  url: string,
  options: RequestInit = {}
): Promise<T> {
  return deduplicator.dedupe(key, async () => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  });
}

/**
 * Clear all pending requests
 */
export function clearPendingRequests(): void {
  deduplicator.clear();
}

/**
 * Get deduplication statistics
 */
export function getDedupeStats() {
  return deduplicator.getStats();
}

/**
 * React hook for deduplicated fetch
 */
export function useDedupedFetch() {
  return {
    fetch: deduplicatedFetch,
    fetchWithKey: deduplicatedFetchWithKey,
    clear: clearPendingRequests,
    stats: getDedupeStats
  };
}
