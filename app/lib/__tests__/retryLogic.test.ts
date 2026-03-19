/**
 * Unit tests for retry logic with exponential backoff
 */

import { retryWithBackoff, fetchWithRetry, CircuitBreaker } from '../retryLogic';

describe('Retry Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(fn);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const error: any = new Error('Fail 1');
      error.status = 500;
      const error2: any = new Error('Fail 2');
      error2.status = 500;
      
      const fn = jest.fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error2)
        .mockResolvedValue('success');
      
      const result = await retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      await expect(
        retryWithBackoff(fn, { maxRetries: 0, baseDelay: 10 })
      ).rejects.toThrow('Always fails');
      
      expect(fn).toHaveBeenCalledTimes(1); // Initial only, no retries
    });

    it('should call onRetry callback', async () => {
      const error: any = new Error('Fail');
      error.status = 500;
      
      const fn = jest.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');
      
      const onRetry = jest.fn();
      
      await retryWithBackoff(fn, { maxRetries: 2, baseDelay: 10, onRetry });
      
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });

    it('should not retry non-retryable errors', async () => {
      const error: any = new Error('Bad Request');
      error.status = 400;
      
      const fn = jest.fn().mockRejectedValue(error);
      
      await expect(
        retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 })
      ).rejects.toThrow('Bad Request');
      
      expect(fn).toHaveBeenCalledTimes(1); // No retries
    });
  });

  describe('fetchWithRetry', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('should fetch successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });
      
      const response = await fetchWithRetry('/api/test', {}, { maxRetries: 2, baseDelay: 10 });
      
      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 500 error', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' })
        .mockResolvedValue({ ok: true });
      
      await fetchWithRetry('/api/test', {}, { maxRetries: 2, baseDelay: 10 });
      
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('CircuitBreaker', () => {
    it('should allow requests when closed', async () => {
      const breaker = new CircuitBreaker(3, 1000);
      const fn = jest.fn().mockResolvedValue('success');
      
      const result = await breaker.execute(fn);
      
      expect(result).toBe('success');
      expect(breaker.getState().state).toBe('closed');
    });

    it('should open after threshold failures', async () => {
      const breaker = new CircuitBreaker(2, 1000);
      const fn = jest.fn().mockRejectedValue(new Error('Fail'));
      
      // First two failures
      await expect(breaker.execute(fn, { maxRetries: 0 })).rejects.toThrow();
      await expect(breaker.execute(fn, { maxRetries: 0 })).rejects.toThrow();
      
      expect(breaker.getState().state).toBe('open');
      expect(breaker.getState().failures).toBe(2);
    });

    it('should reject requests when open', async () => {
      const breaker = new CircuitBreaker(1, 100);
      const fn = jest.fn().mockRejectedValue(new Error('Fail'));
      
      // Trigger circuit open
      await expect(breaker.execute(fn, { maxRetries: 0 })).rejects.toThrow();
      
      // Should reject immediately
      await expect(breaker.execute(fn, { maxRetries: 0 })).rejects.toThrow('Circuit breaker is open');
    });

    it('should reset on success', async () => {
      const breaker = new CircuitBreaker(3, 1000);
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');
      
      await expect(breaker.execute(fn, { maxRetries: 0 })).rejects.toThrow();
      await breaker.execute(fn, { maxRetries: 0 });
      
      expect(breaker.getState().failures).toBe(0);
    });
  });
});
