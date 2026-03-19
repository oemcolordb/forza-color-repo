'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CameraManager, CameraOptions, CameraCapture } from '../lib/cameraIntegration';

interface UseCameraResult {
  isAvailable: boolean;
  isActive: boolean;
  videoElement: HTMLVideoElement | null;
  error: string | null;
  startCamera: (options?: CameraOptions) => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => Promise<CameraCapture | null>;
  switchCamera: () => Promise<void>;
}

/**
 * React hook for camera integration
 */
export function useCamera(): UseCameraResult {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const cameraManagerRef = useRef<CameraManager | null>(null);

  useEffect(() => {
    // Check camera availability
    CameraManager.isAvailable().then(setIsAvailable);

    // Cleanup on unmount
    return () => {
      if (cameraManagerRef.current) {
        cameraManagerRef.current.stop();
      }
    };
  }, []);

  const startCamera = useCallback(async (options?: CameraOptions) => {
    setError(null);
    
    try {
      if (!cameraManagerRef.current) {
        cameraManagerRef.current = new CameraManager();
      }

      const video = await cameraManagerRef.current.start(options);
      setVideoElement(video);
      setIsActive(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start camera';
      setError(errorMessage);
      setIsActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraManagerRef.current) {
      cameraManagerRef.current.stop();
      setVideoElement(null);
      setIsActive(false);
    }
  }, []);

  const capturePhoto = useCallback(async (): Promise<CameraCapture | null> => {
    if (!cameraManagerRef.current) {
      setError('Camera not started');
      return null;
    }

    try {
      return await cameraManagerRef.current.capture();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture photo';
      setError(errorMessage);
      return null;
    }
  }, []);

  const switchCamera = useCallback(async () => {
    if (!cameraManagerRef.current) {
      setError('Camera not started');
      return;
    }

    try {
      await cameraManagerRef.current.switchCamera();
      const video = cameraManagerRef.current['videoElement'];
      setVideoElement(video);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch camera';
      setError(errorMessage);
    }
  }, []);

  return {
    isAvailable,
    isActive,
    videoElement,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera
  };
}
