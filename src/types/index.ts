// Core types for the EasyShare extension

export interface UploadResponse {
  success: boolean;
  link?: string;
  key?: string;
  expiry?: string;
  error?: string;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadService {
  name: string;
  maxFileSize: number; // in bytes
  supportedFormats: string[];
  upload: (file: File, options?: UploadOptions) => Promise<UploadResponse>;
}

export interface UploadOptions {
  expiration?: string;
  maxDownloads?: number;
  onProgress?: (progress: FileUploadProgress) => void;
}

export interface ExpirationOption {
  label: string;
  value: string;
  downloads?: number;
  duration?: string;
}

export interface ExtensionSettings {
  defaultService: string;
  defaultExpiration: string;
  showNotifications: boolean;
  autoCopyToClipboard: boolean;
  keepUploadHistory: boolean;
  maxHistoryItems: number;
}

export interface UploadHistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: number;
  downloadLink: string;
  expirationDate?: number;
  downloadCount?: number;
  serviceName: string;
}

export interface NotificationOptions {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

// Chrome extension specific types
export interface ChromeMessage {
  type: string;
  data?: any;
}

export interface StorageData {
  settings: ExtensionSettings;
  uploadHistory: UploadHistoryItem[];
}
