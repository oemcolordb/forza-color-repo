/**
 * Camera Integration Utility
 * Provides access to device camera for image capture
 */

export interface CameraOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
  aspectRatio?: number;
}

export interface CameraCapture {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

export class CameraManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  /**
   * Check if camera is available
   */
  static async isAvailable(): Promise<boolean> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch {
      return false;
    }
  }

  /**
   * Start camera stream
   */
  async start(options: CameraOptions = {}): Promise<HTMLVideoElement> {
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: options.facingMode || 'environment',
        width: options.width ? { ideal: options.width } : undefined,
        height: options.height ? { ideal: options.height } : undefined,
        aspectRatio: options.aspectRatio ? { ideal: options.aspectRatio } : undefined
      }
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.setAttribute('playsinline', 'true');
      this.videoElement.setAttribute('autoplay', 'true');
      
      await this.videoElement.play();
      
      return this.videoElement;
    } catch (error) {
      throw new Error(`Failed to start camera: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Capture photo from camera
   */
  async capture(): Promise<CameraCapture> {
    if (!this.videoElement || !this.stream) {
      throw new Error('Camera not started');
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(this.videoElement, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        resolve({
          dataUrl,
          blob,
          width: canvas.width,
          height: canvas.height
        });
      }, 'image/jpeg', 0.9);
    });
  }

  /**
   * Switch camera (front/back)
   */
  async switchCamera(): Promise<void> {
    const currentFacingMode = this.getCurrentFacingMode();
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    
    await this.stop();
    await this.start({ facingMode: newFacingMode });
  }

  /**
   * Get current facing mode
   */
  private getCurrentFacingMode(): 'user' | 'environment' {
    if (!this.stream) return 'environment';
    
    const videoTrack = this.stream.getVideoTracks()[0];
    const settings = videoTrack.getSettings();
    return (settings.facingMode as 'user' | 'environment') || 'environment';
  }

  /**
   * Stop camera stream
   */
  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  /**
   * Get available cameras
   */
  static async getAvailableCameras(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  }
}

/**
 * Request camera permissions
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch {
    return false;
  }
}

/**
 * Check camera permission status
 */
export async function checkCameraPermission(): Promise<PermissionState | 'unsupported'> {
  if (!navigator.permissions) {
    return 'unsupported';
  }

  try {
    const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
    return result.state;
  } catch {
    return 'unsupported';
  }
}
