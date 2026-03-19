'use client';

import React, { useEffect, useRef } from 'react';
import { useCamera } from '../hooks/useCamera';

interface CameraCaptureProps {
  onCapture: (dataUrl: string, blob: Blob) => void;
  onClose: () => void;
  isDarkMode?: boolean;
}

export default function CameraCapture({ onCapture, onClose, isDarkMode = true }: CameraCaptureProps) {
  const { isAvailable, isActive, videoElement, error, startCamera, stopCamera, capturePhoto, switchCamera } = useCamera();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAvailable) {
      startCamera({ facingMode: 'environment' });
    }

    return () => {
      stopCamera();
    };
  }, [isAvailable, startCamera, stopCamera]);

  useEffect(() => {
    if (videoElement && containerRef.current) {
      containerRef.current.appendChild(videoElement);
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
    }
  }, [videoElement]);

  const handleCapture = async () => {
    const capture = await capturePhoto();
    if (capture) {
      onCapture(capture.dataUrl, capture.blob);
      stopCamera();
      onClose();
    }
  };

  if (!isAvailable) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="text-center p-6">
          <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            Camera not available on this device
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Video container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-600 text-white p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Close button */}
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Capture button */}
          <button
            onClick={handleCapture}
            disabled={!isActive}
            className="w-16 h-16 rounded-full bg-white border-4 border-white/50 disabled:opacity-50"
          />

          {/* Switch camera button */}
          <button
            onClick={switchCamera}
            disabled={!isActive}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center disabled:opacity-50"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <p className="text-center text-white text-sm mt-4">
          Tap the button to capture
        </p>
      </div>
    </div>
  );
}
