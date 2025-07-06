/**
 * Configuration management for EasyShare extension (JavaScript version)
 * Handles environment variables and default settings
 */

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
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
 * Load configuration for browser extension
 * Uses default values that can be overridden by user settings
 */
function loadBrowserConfig() {
  return DEFAULT_CONFIG;
}

/**
 * Get default settings for extension storage
 */
function getDefaultSettings() {
  const config = loadBrowserConfig();
  
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
 * Get service configuration
 */
function getServiceConfig() {
  const config = loadBrowserConfig();
  return {
    fileioUrl: config.services.fileioUrl,
    zeroxzeroUrl: config.services.zeroxzeroUrl,
    uploadTimeout: config.services.uploadTimeout,
    maxFileSize: config.extension.maxFileSize,
  };
}

/**
 * Get security configuration
 */
function getSecurityConfig() {
  const config = loadBrowserConfig();
  return {
    allowedFileTypes: config.security.allowedFileTypes,
    maxFileSize: config.extension.maxFileSize,
  };
}

// Export for use in browser extension
if (typeof window !== 'undefined') {
  window.EasyShareConfig = {
    DEFAULT_CONFIG,
    loadBrowserConfig,
    getDefaultSettings,
    getServiceConfig,
    getSecurityConfig,
  };
}

// Export for Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_CONFIG,
    loadBrowserConfig,
    getDefaultSettings,
    getServiceConfig,
    getSecurityConfig,
  };
}
