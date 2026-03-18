'use client';

import { useState, useEffect, useCallback } from 'react';

interface CsrfTokenState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to manage CSRF tokens
 * Fetches token on mount and provides methods to refresh
 */
export function useCsrfToken() {
  const [state, setState] = useState<CsrfTokenState>({
    token: null,
    loading: true,
    error: null
  });

  const fetchToken = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/csrf-token');
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      
      const data = await response.json();
      
      setState({
        token: data.token,
        loading: false,
        error: null
      });
      
      return data.token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        token: null,
        loading: false,
        error: errorMessage
      });
      return null;
    }
  }, []);

  // Fetch token on mount
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Refresh token (useful after failed requests)
  const refreshToken = useCallback(() => {
    return fetchToken();
  }, [fetchToken]);

  return {
    token: state.token,
    loading: state.loading,
    error: state.error,
    refreshToken
  };
}

/**
 * Helper function to add CSRF token to fetch options
 * @param token - CSRF token
 * @param options - Fetch options
 * @returns Modified fetch options with CSRF header
 */
export function withCsrfToken(token: string | null, options: RequestInit = {}): RequestInit {
  if (!token) return options;

  return {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': token
    }
  };
}
