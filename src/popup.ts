// All code will be included inline to avoid module import issues

class PopupController {
  private uploadManager: UploadServiceManager;
  private currentFile: File | null = null;
  private settings: ExtensionSettings;
  private historyView: HistoryView;

  // DOM elements
  private uploadArea!: HTMLElement;
  private fileInput!: HTMLInputElement;
  private uploadContent!: HTMLElement;
  private progressContent!: HTMLElement;
  private successContent!: HTMLElement;
  private errorContent!: HTMLElement;
  private settingsPanel!: HTMLElement;

  constructor() {
    this.uploadManager = new UploadServiceManager();
    this.settings = this.getDefaultSettings();
    this.initializeElements();
    this.setupEventListeners();
    this.loadSettings();

    // Initialize history view
    const historyContainer = document.getElementById('historyContainer')!;
    this.historyView = new HistoryView(historyContainer);
  }

  private initializeElements(): void {
    this.uploadArea = document.getElementById('uploadArea')!;
    this.fileInput = document.getElementById('fileInput') as HTMLInputElement;
    this.uploadContent = document.getElementById('uploadContent')!;
    this.progressContent = document.getElementById('progressContent')!;
    this.successContent = document.getElementById('successContent')!;
    this.errorContent = document.getElementById('errorContent')!;
    this.settingsPanel = document.getElementById('settingsPanel')!;
  }

  private setupEventListeners(): void {
    // File selection
    document.getElementById('selectFileBtn')?.addEventListener('click', () => {
      this.fileInput.click();
    });

    this.fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.handleFileSelection(file);
      }
    });

    // Drag and drop
    this.uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadArea.classList.add('drag-over');
    });

    this.uploadArea.addEventListener('dragleave', () => {
      this.uploadArea.classList.remove('drag-over');
    });

    this.uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadArea.classList.remove('drag-over');
      const file = e.dataTransfer?.files[0];
      if (file) {
        this.handleFileSelection(file);
      }
    });

    // Action buttons
    document.getElementById('copyBtn')?.addEventListener('click', () => {
      this.copyLinkToClipboard();
    });

    document.getElementById('newUploadBtn')?.addEventListener('click', () => {
      this.resetToInitialState();
    });

    document.getElementById('retryBtn')?.addEventListener('click', () => {
      if (this.currentFile) {
        this.uploadFile(this.currentFile);
      }
    });

    // Settings
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
      this.showSettings();
    });

    document.getElementById('settingsBtn2')?.addEventListener('click', () => {
      this.showSettings();
    });

    document.getElementById('closeSettingsBtn')?.addEventListener('click', () => {
      this.hideSettings();
    });

    // History
    document.getElementById('historyBtn')?.addEventListener('click', () => {
      this.showHistory();
    });
  }

  private async handleFileSelection(file: File): Promise<void> {
    this.currentFile = file;
    
    // Get current service
    const service = this.uploadManager.getService(this.settings.defaultService) || 
                   this.uploadManager.getDefaultService();

    // Validate file
    const validation = FileValidator.validateFile(file, service.maxFileSize);
    
    if (!validation.valid) {
      this.showError(validation.error || 'File validation failed');
      return;
    }

    // Show warnings if any
    if (validation.warnings?.length) {
      // Could show warnings in a toast or similar
      console.warn('File warnings:', validation.warnings);
    }

    // Start upload
    await this.uploadFile(file);
  }

  private async uploadFile(file: File): Promise<void> {
    try {
      this.showProgress(file);

      const service = this.uploadManager.getService(this.settings.defaultService) || 
                     this.uploadManager.getDefaultService();

      const result = await service.upload(file, {
        expiration: this.settings.defaultExpiration,
        onProgress: (progress) => {
          this.updateProgress(progress.percentage);
        }
      });

      if (result.success && result.link) {
        await this.handleUploadSuccess(file, result.link);
      } else {
        this.showError(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      this.showError('An unexpected error occurred');
    }
  }

  private async handleUploadSuccess(file: File, link: string): Promise<void> {
    // Copy to clipboard if enabled
    if (this.settings.autoCopyToClipboard) {
      await this.copyToClipboard(link);
    }

    // Save to history if enabled
    if (this.settings.keepUploadHistory) {
      await this.saveToHistory(file, link);
    }

    // Show notifications if enabled
    if (this.settings.showNotifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'EasyShare',
        message: 'File uploaded successfully! Link copied to clipboard.'
      });
    }

    this.showSuccess(link);
  }

  private showProgress(file: File): void {
    this.hideAllStates();
    this.progressContent.classList.remove('hidden');

    // Update file info
    document.getElementById('fileIcon')!.textContent = FileValidator.getFileIcon(file.name);
    document.getElementById('fileName')!.textContent = file.name;
    document.getElementById('fileSize')!.textContent = FileValidator.formatFileSize(file.size);
    
    this.updateProgress(0);
  }

  private updateProgress(percentage: number): void {
    const progressFill = document.getElementById('progressFill')!;
    const progressText = document.getElementById('progressText')!;
    
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `Uploading... ${percentage}%`;
  }

  private showSuccess(link: string): void {
    this.hideAllStates();
    this.successContent.classList.remove('hidden');

    const linkInput = document.getElementById('linkInput') as HTMLInputElement;
    linkInput.value = link;
  }

  private showError(message: string): void {
    this.hideAllStates();
    this.errorContent.classList.remove('hidden');

    document.getElementById('errorMessage')!.textContent = message;
  }

  private hideAllStates(): void {
    this.uploadContent.classList.add('hidden');
    this.progressContent.classList.add('hidden');
    this.successContent.classList.add('hidden');
    this.errorContent.classList.add('hidden');
  }

  private resetToInitialState(): void {
    this.currentFile = null;
    this.hideAllStates();
    this.uploadContent.classList.remove('hidden');
    this.fileInput.value = '';
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }

  private async copyLinkToClipboard(): Promise<void> {
    const linkInput = document.getElementById('linkInput') as HTMLInputElement;
    await this.copyToClipboard(linkInput.value);
    
    // Visual feedback
    const copyBtn = document.getElementById('copyBtn')!;
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<span class="icon">✓</span>';
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
    }, 1000);
  }

  private showSettings(): void {
    this.settingsPanel.classList.remove('hidden');
    this.loadSettingsUI();
  }

  private hideSettings(): void {
    this.settingsPanel.classList.add('hidden');
    this.saveSettingsFromUI();
  }

  private loadSettingsUI(): void {
    const serviceSelect = document.getElementById('serviceSelect') as HTMLSelectElement;
    const expirationSelect = document.getElementById('expirationSelect') as HTMLSelectElement;
    const notificationsCheck = document.getElementById('notificationsCheck') as HTMLInputElement;
    const autoCopyCheck = document.getElementById('autoCopyCheck') as HTMLInputElement;

    serviceSelect.value = this.settings.defaultService;
    expirationSelect.value = this.settings.defaultExpiration;
    notificationsCheck.checked = this.settings.showNotifications;
    autoCopyCheck.checked = this.settings.autoCopyToClipboard;
  }

  private saveSettingsFromUI(): void {
    const serviceSelect = document.getElementById('serviceSelect') as HTMLSelectElement;
    const expirationSelect = document.getElementById('expirationSelect') as HTMLSelectElement;
    const notificationsCheck = document.getElementById('notificationsCheck') as HTMLInputElement;
    const autoCopyCheck = document.getElementById('autoCopyCheck') as HTMLInputElement;

    this.settings = {
      ...this.settings,
      defaultService: serviceSelect.value,
      defaultExpiration: expirationSelect.value,
      showNotifications: notificationsCheck.checked,
      autoCopyToClipboard: autoCopyCheck.checked
    };

    this.saveSettings();
  }

  private async loadSettings(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get(['settings']);
      if (result.settings) {
        this.settings = { ...this.settings, ...result.settings };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      await chrome.storage.sync.set({ settings: this.settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  private async saveToHistory(file: File, link: string): Promise<void> {
    try {
      const historyItem: UploadHistoryItem = {
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: file.size,
        uploadDate: Date.now(),
        downloadLink: link,
        serviceName: this.settings.defaultService
      };

      const result = await chrome.storage.local.get(['uploadHistory']);
      const history: UploadHistoryItem[] = result.uploadHistory || [];
      
      history.unshift(historyItem);
      
      // Keep only the latest items based on settings
      if (history.length > this.settings.maxHistoryItems) {
        history.splice(this.settings.maxHistoryItems);
      }

      await chrome.storage.local.set({ uploadHistory: history });
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  }

  private showHistory(): void {
    this.historyView.show();
  }

  private getDefaultSettings(): ExtensionSettings {
    return {
      defaultService: '0x0.st',
      defaultExpiration: '1d',
      showNotifications: true,
      autoCopyToClipboard: true,
      keepUploadHistory: true,
      maxHistoryItems: 50
    };
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
