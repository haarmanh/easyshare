// Background service worker for EasyShare extension
// Standalone version without ES modules

console.log('🚀 EasyShare background service worker loading...');

class BackgroundService {
  constructor() {
    // Load configuration from environment variables or defaults
    this.defaultSettings = {
      defaultService: 'supabase' || 'supabase',
      supabaseConfig: {
        url: 'https://avrmsyqizgyxtldtmyyr.supabase.co' || '',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cm1zeXFpemd5eHRsZHRteXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzMzODYsImV4cCI6MjA2NzMwOTM4Nn0.lHA8s8iiMdHGFd7SIs0kK9Spo1xafEC3z-x8aitouz0' || '',
        bucketName: 'uploads' || 'uploads',
        linkExpiration: parseInt(3600) || 3600
      },
      showNotifications: true === 'true' || true,
      autoCopyToClipboard: true === 'true' || true,
      keepUploadHistory: true === 'true' || true,
      maxHistoryItems: parseInt(50) || 50,
      debugMode: false === 'true' || false
    };
    
    this.setupEventListeners();
    this.initializeExtension();
  }

  setupEventListeners() {
    // Extension installation/startup
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    chrome.runtime.onStartup.addListener(() => {
      this.handleStartup();
    });

    // Message handling from popup/content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Notification clicks
    chrome.notifications.onClicked.addListener((notificationId) => {
      this.handleNotificationClick(notificationId);
    });

    // Keyboard shortcuts
    chrome.commands.onCommand.addListener((command) => {
      this.handleCommand(command);
    });
  }

  async initializeExtension() {
    try {
      // Initialize default settings if not present
      const result = await chrome.storage.sync.get(['settings']);
      if (!result.settings) {
        await chrome.storage.sync.set({ settings: this.defaultSettings });
      }

      // Initialize upload history if not present
      const historyResult = await chrome.storage.local.get(['uploadHistory']);
      if (!historyResult.uploadHistory) {
        await chrome.storage.local.set({ uploadHistory: [] });
      }

      console.log('✅ EasyShare extension initialized successfully');

      // Keep service worker alive
      this.setupKeepAlive();
    } catch (error) {
      console.error('❌ Failed to initialize extension:', error);
    }
  }

  setupKeepAlive() {
    // Keep service worker alive by setting up a periodic alarm
    chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'keepAlive') {
        console.log('🔄 Service worker keep-alive ping');
      }
    });
  }

  handleInstallation(details) {
    if (details.reason === 'install') {
      // First time installation
      this.showWelcomeNotification();
    } else if (details.reason === 'update') {
      // Extension updated
      this.handleUpdate(details.previousVersion);
    }
  }

  handleStartup() {
    console.log('EasyShare extension started');
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'GET_SETTINGS':
          const settings = await this.getSettings();
          sendResponse({ success: true, data: settings });
          break;

        case 'SAVE_SETTINGS':
          await this.saveSettings(message.data);
          sendResponse({ success: true });
          break;

        case 'GET_UPLOAD_HISTORY':
          const history = await this.getUploadHistory();
          sendResponse({ success: true, data: history });
          break;

        case 'CLEAR_UPLOAD_HISTORY':
          await this.clearUploadHistory();
          sendResponse({ success: true });
          break;

        case 'SHOW_NOTIFICATION':
          await this.showNotification(message.data);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendResponse({ success: false, error: errorMessage });
    }
  }

  handleNotificationClick(notificationId) {
    console.log('Notification clicked:', notificationId);
    chrome.notifications.clear(notificationId);
  }

  handleCommand(command) {
    switch (command) {
      case '_execute_action':
        // This is handled automatically by Chrome for opening the popup
        break;
      default:
        console.log('Unknown command:', command);
    }
  }

  async getSettings() {
    try {
      const result = await chrome.storage.sync.get(['settings']);
      return result.settings || this.defaultSettings;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return this.defaultSettings;
    }
  }

  async saveSettings(settings) {
    try {
      await chrome.storage.sync.set({ settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async getUploadHistory() {
    try {
      const result = await chrome.storage.local.get(['uploadHistory']);
      return result.uploadHistory || [];
    } catch (error) {
      console.error('Failed to get upload history:', error);
      return [];
    }
  }

  async clearUploadHistory() {
    try {
      await chrome.storage.local.set({ uploadHistory: [] });
    } catch (error) {
      console.error('Failed to clear upload history:', error);
      throw error;
    }
  }

  async showNotification(options) {
    try {
      await chrome.notifications.create({
        type: options.type || 'basic',
        iconUrl: options.iconUrl || 'icons/icon48.png',
        title: options.title,
        message: options.message
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
      throw error;
    }
  }

  showWelcomeNotification() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Welcome to EasyShare!',
      message: 'Click the extension icon to start sharing files instantly.'
    });
  }

  handleUpdate(previousVersion) {
    console.log(`EasyShare updated from version ${previousVersion}`);
  }

  async cleanupOldHistory() {
    try {
      const settings = await this.getSettings();
      const history = await this.getUploadHistory();
      
      if (history.length > settings.maxHistoryItems) {
        const trimmedHistory = history.slice(0, settings.maxHistoryItems);
        await chrome.storage.local.set({ uploadHistory: trimmedHistory });
      }
    } catch (error) {
      console.error('Failed to cleanup old history:', error);
    }
  }
}

// Initialize the background service
new BackgroundService();
