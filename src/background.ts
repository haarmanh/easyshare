// Background service worker for EasyShare extension

// Types defined inline to avoid import issues
interface ExtensionSettings {
  defaultService: string;
  defaultExpiration: string;
  showNotifications: boolean;
  autoCopyToClipboard: boolean;
  keepUploadHistory: boolean;
  maxHistoryItems: number;
}

interface UploadHistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: number;
  downloadLink: string;
  expirationDate?: number;
  downloadCount?: number;
  serviceName: string;
}

interface ChromeMessage {
  type: string;
  data?: any;
}

class BackgroundService {
  private defaultSettings: ExtensionSettings = {
    defaultService: '0x0.st',
    defaultExpiration: '1d',
    showNotifications: true,
    autoCopyToClipboard: true,
    keepUploadHistory: true,
    maxHistoryItems: 50
  };

  constructor() {
    this.setupEventListeners();
    this.initializeExtension();
  }

  private setupEventListeners(): void {
    // Extension installation/startup
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    chrome.runtime.onStartup.addListener(() => {
      this.handleStartup();
    });

    // Message handling from popup/content scripts
    chrome.runtime.onMessage.addListener((message: ChromeMessage, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Notification clicks
    chrome.notifications.onClicked.addListener((notificationId) => {
      this.handleNotificationClick(notificationId);
    });

    // Context menu (future feature)
    // chrome.contextMenus.onClicked.addListener((info, tab) => {
    //   this.handleContextMenuClick(info, tab);
    // });

    // Keyboard shortcuts
    chrome.commands.onCommand.addListener((command) => {
      this.handleCommand(command);
    });
  }

  private async initializeExtension(): Promise<void> {
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

      console.log('EasyShare extension initialized');
    } catch (error) {
      console.error('Failed to initialize extension:', error);
    }
  }

  private handleInstallation(details: chrome.runtime.InstalledDetails): void {
    if (details.reason === 'install') {
      // First time installation
      this.showWelcomeNotification();
    } else if (details.reason === 'update') {
      // Extension updated
      this.handleUpdate(details.previousVersion);
    }
  }

  private handleStartup(): void {
    console.log('EasyShare extension started');
  }

  private async handleMessage(
    message: ChromeMessage, 
    sender: chrome.runtime.MessageSender, 
    sendResponse: (response?: any) => void
  ): Promise<void> {
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

        case 'COPY_TO_CLIPBOARD':
          await this.copyToClipboard(message.data.text);
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

  private handleNotificationClick(notificationId: string): void {
    // Handle notification clicks - could open popup or perform actions
    console.log('Notification clicked:', notificationId);
    
    // Clear the notification
    chrome.notifications.clear(notificationId);
  }

  private handleCommand(command: string): void {
    switch (command) {
      case '_execute_action':
        // This is handled automatically by Chrome for opening the popup
        break;
      default:
        console.log('Unknown command:', command);
    }
  }

  private async getSettings(): Promise<ExtensionSettings> {
    try {
      const result = await chrome.storage.sync.get(['settings']);
      return result.settings || this.defaultSettings;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return this.defaultSettings;
    }
  }

  private async saveSettings(settings: ExtensionSettings): Promise<void> {
    try {
      await chrome.storage.sync.set({ settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  private async getUploadHistory(): Promise<UploadHistoryItem[]> {
    try {
      const result = await chrome.storage.local.get(['uploadHistory']);
      return result.uploadHistory || [];
    } catch (error) {
      console.error('Failed to get upload history:', error);
      return [];
    }
  }

  private async clearUploadHistory(): Promise<void> {
    try {
      await chrome.storage.local.set({ uploadHistory: [] });
    } catch (error) {
      console.error('Failed to clear upload history:', error);
      throw error;
    }
  }

  private async showNotification(options: {
    title: string;
    message: string;
    type?: 'basic' | 'image' | 'list' | 'progress';
    iconUrl?: string;
  }): Promise<void> {
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

  private async copyToClipboard(text: string): Promise<void> {
    try {
      // In a service worker, we need to use the offscreen API for clipboard access
      // For now, we'll rely on the popup to handle clipboard operations
      console.log('Clipboard copy requested:', text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw error;
    }
  }

  private showWelcomeNotification(): void {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Welcome to EasyShare!',
      message: 'Click the extension icon to start sharing files instantly.'
    });
  }

  private handleUpdate(previousVersion?: string): void {
    console.log(`EasyShare updated from version ${previousVersion}`);
    
    // Handle any migration logic here if needed
    // For example, updating storage schema, etc.
  }

  // Utility method to clean up old history items
  private async cleanupOldHistory(): Promise<void> {
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

  // Periodic cleanup (could be called on startup or periodically)
  private async performMaintenance(): Promise<void> {
    await this.cleanupOldHistory();
    
    // Could add other maintenance tasks here:
    // - Clean up expired links
    // - Update service availability
    // - etc.
  }
}

// Initialize the background service
new BackgroundService();
