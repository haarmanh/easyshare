/**
 * Configuration management for EasyShare extension
 * Handles environment variables and default settings
 */

export interface ExtensionConfig {
  supabase: {
    url: string;
    anonKey: string;
    bucketName: string;
    linkExpiration: number;
  };
  extension: {
    defaultService: string;
    maxFileSize: number;
    maxHistoryItems: number;
    showNotifications: boolean;
    autoCopyToClipboard: boolean;
    keepUploadHistory: boolean;
    debugMode: boolean;
    version: string;
  };
  services: {
    fileioUrl: string;
    zeroxzeroUrl: string;
    uploadTimeout: number;
  };
  security: {
    allowedFileTypes: string[];
  };
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: ExtensionConfig = {
  supabase: {
    url: '',
    anonKey: '',
    bucketName: 'uploads',
    linkExpiration: 3600, // 1 hour
  },
  extension: {
    defaultService: 'supabase',
    maxFileSize: 104857600, // 100MB
    maxHistoryItems: 50,
    showNotifications: true,
    autoCopyToClipboard: true,
    keepUploadHistory: true,
    debugMode: false,
    version: '4.0.0',
  },
  services: {
    fileioUrl: 'https://file.io',
    zeroxzeroUrl: 'https://0x0.st',
    uploadTimeout: 300000, // 5 minutes
  },
  security: {
    allowedFileTypes: ['*'], // All file types allowed by default
  },
};

/**
 * Load configuration from environment variables or use defaults
 * In browser extension context, this will use stored settings
 */
export function loadConfig(): ExtensionConfig {
  // In browser extension, we'll load from chrome.storage
  // For now, return defaults that can be overridden by user settings
  return {
    supabase: {
      url: process.env.SUPABASE_URL || DEFAULT_CONFIG.supabase.url,
      anonKey: process.env.SUPABASE_ANON_KEY || DEFAULT_CONFIG.supabase.anonKey,
      bucketName: process.env.SUPABASE_BUCKET_NAME || DEFAULT_CONFIG.supabase.bucketName,
      linkExpiration: parseInt(process.env.SUPABASE_LINK_EXPIRATION || '') || DEFAULT_CONFIG.supabase.linkExpiration,
    },
    extension: {
      defaultService: process.env.DEFAULT_SERVICE || DEFAULT_CONFIG.extension.defaultService,
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '') || DEFAULT_CONFIG.extension.maxFileSize,
      maxHistoryItems: parseInt(process.env.MAX_HISTORY_ITEMS || '') || DEFAULT_CONFIG.extension.maxHistoryItems,
      showNotifications: process.env.SHOW_NOTIFICATIONS === 'true' || DEFAULT_CONFIG.extension.showNotifications,
      autoCopyToClipboard: process.env.AUTO_COPY_TO_CLIPBOARD === 'true' || DEFAULT_CONFIG.extension.autoCopyToClipboard,
      keepUploadHistory: process.env.KEEP_UPLOAD_HISTORY === 'true' || DEFAULT_CONFIG.extension.keepUploadHistory,
      debugMode: process.env.DEBUG_MODE === 'true' || DEFAULT_CONFIG.extension.debugMode,
      version: process.env.EXTENSION_VERSION || DEFAULT_CONFIG.extension.version,
    },
    services: {
      fileioUrl: process.env.FILEIO_API_URL || DEFAULT_CONFIG.services.fileioUrl,
      zeroxzeroUrl: process.env.ZEROXZERO_API_URL || DEFAULT_CONFIG.services.zeroxzeroUrl,
      uploadTimeout: parseInt(process.env.UPLOAD_TIMEOUT || '') || DEFAULT_CONFIG.services.uploadTimeout,
    },
    security: {
      allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || DEFAULT_CONFIG.security.allowedFileTypes,
    },
  };
}

/**
 * Get default settings for extension storage
 */
export function getDefaultSettings() {
  const config = loadConfig();
  
  return {
    defaultService: config.extension.defaultService,
    supabaseConfig: {
      url: config.supabase.url,
      anonKey: config.supabase.anonKey,
      bucketName: config.supabase.bucketName,
      linkExpiration: config.supabase.linkExpiration,
    },
    showNotifications: config.extension.showNotifications,
    autoCopyToClipboard: config.extension.autoCopyToClipboard,
    keepUploadHistory: config.extension.keepUploadHistory,
    maxHistoryItems: config.extension.maxHistoryItems,
    debugMode: config.extension.debugMode,
  };
}

/**
 * Browser extension compatible config loader
 * This version works without Node.js process.env
 */
export function loadBrowserConfig(): ExtensionConfig {
  // For browser extension, we use the defaults and let user settings override
  return DEFAULT_CONFIG;
}

export { DEFAULT_CONFIG };
