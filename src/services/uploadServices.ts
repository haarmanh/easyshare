import { UploadService, UploadResponse, UploadOptions, FileUploadProgress } from '../types/index.js';

// File.io service implementation
export class FileIOService implements UploadService {
  name = 'file.io';
  maxFileSize = 2 * 1024 * 1024 * 1024; // 2GB
  supportedFormats = ['*']; // Supports all file types

  async upload(file: File, options: UploadOptions = {}): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Set expiration (file.io uses 'expires' parameter)
      if (options.expiration) {
        formData.append('expires', options.expiration);
      }

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && options.onProgress) {
            const progress: FileUploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded * 100) / event.total)
            };
            options.onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              resolve({
                success: true,
                link: response.link,
                key: response.key,
                expiry: response.expiry
              });
            } else {
              resolve({
                success: false,
                error: response.message || 'Upload failed'
              });
            }
          } catch (error) {
            resolve({
              success: false,
              error: 'Invalid response from server'
            });
          }
        });

        xhr.addEventListener('error', () => {
          resolve({
            success: false,
            error: 'Network error occurred'
          });
        });

        xhr.addEventListener('timeout', () => {
          resolve({
            success: false,
            error: 'Upload timed out'
          });
        });

        xhr.open('POST', 'https://file.io');
        xhr.timeout = 300000; // 5 minutes timeout
        xhr.send(formData);
      });
    } catch (error) {
      return {
        success: false,
        error: 'Failed to initiate upload'
      };
    }
  }
}

// 0x0.st service implementation (alternative)
export class ZeroXZeroService implements UploadService {
  name = '0x0.st';
  maxFileSize = 512 * 1024 * 1024; // 512MB
  supportedFormats = ['*'];

  async upload(file: File, options: UploadOptions = {}): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && options.onProgress) {
            const progress: FileUploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded * 100) / event.total)
            };
            options.onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const link = xhr.responseText.trim();
            resolve({
              success: true,
              link: link
            });
          } else {
            resolve({
              success: false,
              error: `Upload failed with status ${xhr.status}`
            });
          }
        });

        xhr.addEventListener('error', () => {
          resolve({
            success: false,
            error: 'Network error occurred'
          });
        });

        xhr.open('POST', 'https://0x0.st');
        xhr.send(formData);
      });
    } catch (error) {
      return {
        success: false,
        error: 'Failed to initiate upload'
      };
    }
  }
}

// Service manager
export class UploadServiceManager {
  private services: Map<string, UploadService> = new Map();

  constructor() {
    this.registerService(new FileIOService());
    this.registerService(new ZeroXZeroService());
  }

  registerService(service: UploadService): void {
    this.services.set(service.name, service);
  }

  getService(name: string): UploadService | undefined {
    return this.services.get(name);
  }

  getAllServices(): UploadService[] {
    return Array.from(this.services.values());
  }

  getDefaultService(): UploadService {
    // Use 0x0.st as default since it's more reliable
    const zeroXZeroService = this.services.get('0x0.st');
    if (zeroXZeroService) {
      return zeroXZeroService;
    }
    // Fallback to file.io
    const fileIOService = this.services.get('file.io');
    if (fileIOService) {
      return fileIOService;
    }
    const firstService = this.services.values().next().value;
    if (!firstService) {
      throw new Error('No upload services available');
    }
    return firstService;
  }
}
