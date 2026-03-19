/**
 * Retry Logic with Exponential Backoff
 * Automatically retries failed operations with increasing delays
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  onRetry: () => {}
};

/**
 * Calculate delay for exponential backoff with jitter
 * @param attempt - Current attempt number (0-indexed)
 * @param baseDelay - Base delay in milliseconds
 * @param multiplier - Backoff multiplier
 * @param maxDelay - Maximum delay cap
 * @returns Delay in milliseconds
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  multiplier: number,
  maxDelay: number
): number {
  // Exponential backoff: baseDelay * (multiplier ^ attempt)
  const exponentialDelay = baseDelay * Math.pow(multiplier, attempt);
  
  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter (±25% randomness) to prevent thundering herd
  const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
  
  return Math.floor(cappedDelay + jitter);
}

/**
 * Check if error is retryable
 * @param error - Error object
 * @param retryableStatuses - HTTP status codes that should be retried
 * @returns True if error should be retried
 */
function isRetryableError(error: any, retryableStatuses: number[]): boolean {
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // Timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return true;
  }
  
  // HTTP status codes
  if (error.status && retryableStatuses.includes(error.status)) {
    return true;
  }
  
  return false;
}

/**
 * Retry a function with exponential backoff
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Promise with function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if this is the last attempt
      if (attempt === opts.maxRetries) {
        throw lastError;
      }

      // Check if error is retryable
      if (!isRetryableError(error, opts.retryableStatuses)) {
        throw lastError;
      }

      // Calculate delay
      const delay = calculateDelay(
        attempt,
        opts.baseDelay,
        opts.backoffMultiplier,
        opts.maxDelay
      );

      console.log(
        `[Retry] Attempt ${attempt + 1}/${opts.maxRetries} failed. Retrying in ${delay}ms...`,
        lastError.message
      );

      // Call retry callback
      opts.onRetry(attempt + 1, lastError);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Fetch with retry and exponential backoff
 * @param url - Request URL
 * @param options - Fetch options
 * @param retryOptions - Retry options
 * @returns Promise with response
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return retryWithBackoff(async () => {
    const response = await fetch(url, options);

    // Throw error for non-OK responses
    if (!response.ok) {
      const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }

    return response;
  }, retryOptions);
}

/**
 * Fetch JSON with retry
 * @param url - Request URL
 * @param options - Fetch options
 * @param retryOptions - Retry options
 * @returns Promise with JSON data
 */
export async function fetchJsonWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, options, retryOptions);
  return response.json();
}

/**
 * Retry with timeout
 * @param fn - Async function to retry
 * @param timeoutMs - Timeout in milliseconds
 * @param retryOptions - Retry options
 * @returns Promise with function result
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return retryWithBackoff(async () => {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
      )
    ]);
  }, retryOptions);
}

/**
 * Batch retry multiple operations
 * @param operations - Array of async functions
 * @param retryOptions - Retry options
 * @returns Promise with array of results
 */
export async function batchRetry<T>(
  operations: Array<() => Promise<T>>,
  retryOptions: RetryOptions = {}
): Promise<T[]> {
  return Promise.all(
    operations.map(op => retryWithBackoff(op, retryOptions))
  );
}

/**
 * Circuit breaker pattern
 * Stops retrying after too many failures
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>, retryOptions?: RetryOptions): Promise<T> {
    // Check circuit state
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
        this.failures = 0;
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await retryWithBackoff(fn, retryOptions);
      
      // Success - reset circuit
      if (this.state === 'half-open') {
        this.state = 'closed';
      }
      this.failures = 0;
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      // Open circuit if threshold exceeded
      if (this.failures >= this.threshold) {
        this.state = 'open';
        console.error(`[Circuit Breaker] Opened after ${this.failures} failures`);
      }

      throw error;
    }
  }

  getState(): { state: string; failures: number } {
    return {
      state: this.state,
      failures: this.failures
    };
  }

  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}
