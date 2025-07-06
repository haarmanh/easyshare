/**
 * API Service for Chrome Extension
 * Handles all communication with the Vercel backend
 */

class ApiService {
  constructor() {
    // Use environment variable for Vercel URL, fallback to your production URL
    this.baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://easyshare-vnbw.vercel.app';
    this.config = null;
    this.initialized = false;
  }

  /**
   * Initialize the API service by fetching configuration
   */
  async initialize() {
    if (this.initialized) return this.config;

    try {
      console.log('🔧 Initializing API service...');
      
      // Try to get the base URL from extension storage first
      const stored = await this.getStoredConfig();
      if (stored && stored.apiBaseUrl) {
        this.baseUrl = stored.apiBaseUrl;
      }

      // Fetch configuration from the API
      const response = await fetch(`${this.baseUrl}/api/config`);
      
      if (!response.ok) {
        throw new Error(`Config API returned ${response.status}: ${response.statusText}`);
      }

      this.config = await response.json();
      
      // Update base URL if provided in config
      if (this.config.api && this.config.api.baseUrl) {
        this.baseUrl = this.config.api.baseUrl;
      }

      this.initialized = true;
      console.log('✅ API service initialized:', this.config);
      
      return this.config;

    } catch (error) {
      console.error('❌ Failed to initialize API service:', error);
      
      // Return default config if API is unavailable
      this.config = this.getDefaultConfig();
      return this.config;
    }
  }

  /**
   * Upload a file through the Vercel API
   */
  async uploadFile(file, options = {}) {
    try {
      await this.initialize();

      console.log('📤 Uploading file via API:', file.name);

      // Convert file to base64
      const fileData = await this.fileToBase64(file);

      const payload = {
        fileName: file.name,
        fileData: fileData,
        fileType: file.type || 'application/octet-stream'
      };

      // Call the upload API
      const response = await fetch(`${this.baseUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ File uploaded successfully:', result);

      return {
        success: true,
        link: result.link,
        fileName: result.fileName,
        originalName: result.originalName,
        expiresIn: result.expiresIn,
        message: result.message
      };

    } catch (error) {
      console.error('❌ Upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check API health and connectivity
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const health = await response.json();
      
      console.log('🏥 API Health check:', health);
      return health;

    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Convert file to base64 string
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove the data URL prefix (data:type;base64,)
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get stored configuration from Chrome storage
   */
  async getStoredConfig() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.sync.get(['apiConfig']);
        return result.apiConfig || null;
      }
    } catch (error) {
      console.warn('Could not access Chrome storage:', error);
    }
    return null;
  }

  /**
   * Store configuration in Chrome storage
   */
  async storeConfig(config) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.sync.set({ apiConfig: config });
        console.log('✅ API config stored');
      }
    } catch (error) {
      console.warn('Could not store API config:', error);
    }
  }

  /**
   * Get default configuration when API is unavailable
   */
  getDefaultConfig() {
    return {
      version: '4.0.0',
      maxFileSize: 104857600, // 100MB
      maxHistoryItems: 50,
      linkExpiration: 3600,
      allowedFileTypes: ['*'],
      uploadTimeout: 300000,
      features: {
        showNotifications: true,
        autoCopyToClipboard: true,
        keepUploadHistory: true,
        debugMode: false
      },
      services: {
        primary: 'vercel-api'
      }
    };
  }

  /**
   * Update the API base URL
   */
  setBaseUrl(url) {
    this.baseUrl = url;
    this.initialized = false; // Force re-initialization
    console.log('🔧 API base URL updated:', url);
  }
}

// Export for use in browser extension
if (typeof window !== 'undefined') {
  window.ApiService = ApiService;
}

// Export for Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
}
