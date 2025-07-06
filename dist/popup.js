// EasyShare Popup - Standalone version without ES modules

// File validation utilities
class FileValidator {
  static validateFile(file, maxSize) {
    const errors = [];
    const warnings = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size (${this.formatFileSize(file.size)}) exceeds the maximum limit of ${this.formatFileSize(maxSize)}`);
    }

    // Check if file is empty
    if (file.size === 0) {
      errors.push('File is empty');
    }

    // Warn about large files
    if (file.size > 100 * 1024 * 1024) { // 100MB
      warnings.push('Large files may take longer to upload');
    }

    // Check for potentially problematic file names
    if (file.name.length > 255) {
      warnings.push('File name is very long and may cause issues');
    }

    if (/[<>:"/\\|?*]/.test(file.name)) {
      warnings.push('File name contains special characters that may cause issues');
    }

    const result = {
      valid: errors.length === 0
    };

    if (errors.length > 0) {
      result.error = errors.join('; ');
    }

    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    return result;
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileIcon(fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    const iconMap = {
      // Images
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'bmp': '🖼️', 'svg': '🖼️', 'webp': '🖼️',
      // Documents
      'pdf': '📄', 'doc': '📝', 'docx': '📝', 'txt': '📄', 'rtf': '📄',
      // Spreadsheets
      'xls': '📊', 'xlsx': '📊', 'csv': '📊',
      // Presentations
      'ppt': '📊', 'pptx': '📊',
      // Archives
      'zip': '🗜️', 'rar': '🗜️', '7z': '🗜️', 'tar': '🗜️', 'gz': '🗜️',
      // Audio
      'mp3': '🎵', 'wav': '🎵', 'flac': '🎵', 'aac': '🎵', 'ogg': '🎵',
      // Video
      'mp4': '🎬', 'avi': '🎬', 'mkv': '🎬', 'mov': '🎬', 'wmv': '🎬', 'flv': '🎬',
      // Code
      'js': '💻', 'ts': '💻', 'html': '💻', 'css': '💻', 'py': '💻', 'java': '💻', 'cpp': '💻', 'c': '💻',
      // Default
      'default': '📁'
    };

    return iconMap[extension] || iconMap['default'];
  }
}

// Link validation utilities
class LinkValidator {
  static validateLink(link) {
    if (!link || typeof link !== 'string') {
      return { valid: false, error: 'Invalid link format' };
    }

    const trimmedLink = link.trim();

    // Check if it's a valid URL
    try {
      const url = new URL(trimmedLink.startsWith('http') ? trimmedLink : 'https://' + trimmedLink);

      // Check for common issues
      if (url.hostname.length === 0) {
        return { valid: false, error: 'Invalid hostname' };
      }

      // Check for suspicious patterns
      if (url.hostname.includes('localhost') || url.hostname.includes('127.0.0.1')) {
        return { valid: false, error: 'Local URLs are not shareable' };
      }

      return {
        valid: true,
        url: url.href,
        platform: this.detectPlatform(url.hostname)
      };
    } catch (error) {
      return { valid: false, error: 'Malformed URL' };
    }
  }

  static detectPlatform(hostname) {
    const platforms = {
      '0x0.st': '0x0.st',
      'file.io': 'File.io'
    };

    for (const [domain, platform] of Object.entries(platforms)) {
      if (hostname.includes(domain)) {
        return platform;
      }
    }

    return 'Unknown';
  }

  static generateShareableText(link, fileName, platform) {
    const templates = {
      whatsapp: `📎 ${fileName}\n${link}`,
      email: `Hi! I'm sharing a file with you: ${fileName}\n\nDownload link: ${link}\n\nNo registration required - just click to download!`,
      slack: `📎 Shared file: *${fileName}*\n${link}`,
      generic: `${fileName}\n${link}`
    };

    return templates;
  }
}

// Supabase Storage Service - Modern, reliable cloud storage
class SupabaseStorageService {
  constructor() {
    this.name = 'supabase';
    this.maxFileSize = 50 * 1024 * 1024; // 50MB default limit
    this.client = null;
    this.initialized = false;
  }

  async initialize(config) {
    if (this.initialized && this.client) return;

    try {
      // Check if Supabase is available (loaded from local libs)
      if (typeof window.supabase === 'undefined') {
        throw new Error('Supabase client not loaded. Please reload the extension.');
      }

      if (!config || !config.url || !config.anonKey) {
        throw new Error('Supabase configuration required (URL and API key)');
      }

      console.log('🔧 Creating Supabase client...');

      // Initialize Supabase client with timeout
      const initPromise = new Promise((resolve, reject) => {
        try {
          const client = window.supabase.createClient(config.url, config.anonKey);
          resolve(client);
        } catch (error) {
          reject(error);
        }
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Supabase initialization timeout')), 10000);
      });

      this.client = await Promise.race([initPromise, timeoutPromise]);
      this.bucketName = config.bucketName || 'uploads';
      this.linkExpiration = config.linkExpiration || 3600; // 1 hour default

      this.initialized = true;
      console.log('✅ Supabase Storage initialized for bucket:', this.bucketName);
    } catch (error) {
      console.error('❌ Supabase initialization failed:', error);
      throw error;
    }
  }

  async upload(file, options = {}) {
    try {
      console.log('🚀 Supabase Storage upload starting for file:', file.name, 'size:', file.size);

      // Check file size
      if (file.size > this.maxFileSize) {
        return {
          success: false,
          error: `File too large. Maximum size is ${Math.round(this.maxFileSize / 1024 / 1024)}MB`
        };
      }

      // Get Supabase config from options
      const supabaseConfig = options.supabaseConfig;

      if (!supabaseConfig || !supabaseConfig.url || !supabaseConfig.anonKey) {
        return {
          success: false,
          error: 'Supabase configuration missing. Please configure Supabase URL and API key in settings.'
        };
      }

      console.log('🔧 Initializing Supabase with config:', {
        url: supabaseConfig.url,
        bucket: supabaseConfig.bucketName || 'uploads',
        hasKey: !!supabaseConfig.anonKey
      });

      await this.initialize(supabaseConfig);

      // Create unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomId}.${fileExtension}`;
      const filePath = `uploads/${fileName}`;

      // Upload file to Supabase Storage with timeout
      console.log('📤 Uploading to Supabase bucket:', this.bucketName, 'path:', filePath);

      // Create upload promise with timeout
      const uploadPromise = this.client.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout after 60 seconds')), 60000);
      });

      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);

      if (error) {
        console.error('❌ Supabase upload failed:', error);
        let errorMessage = 'Supabase upload failed';

        if (error.message.includes('Bucket not found')) {
          errorMessage = 'Supabase: Bucket not found. Please check your bucket name.';
        } else if (error.message.includes('Unauthorized')) {
          errorMessage = 'Supabase: Unauthorized. Check your API key and bucket policies.';
        } else if (error.message.includes('Payload too large')) {
          errorMessage = 'Supabase: File too large for your plan.';
        } else {
          errorMessage = `Supabase: ${error.message}`;
        }

        return {
          success: false,
          error: errorMessage
        };
      }

      console.log('✅ File uploaded to Supabase:', data.path);

      // Create signed URL for download
      const { data: signedUrlData, error: urlError } = await this.client.storage
        .from(this.bucketName)
        .createSignedUrl(data.path, this.linkExpiration);

      if (urlError) {
        console.error('❌ Failed to create signed URL:', urlError);
        return {
          success: false,
          error: `Failed to create download link: ${urlError.message}`
        };
      }

      const downloadUrl = signedUrlData.signedUrl;
      console.log('✅ Supabase upload successful with signed URL:', downloadUrl);

      return {
        success: true,
        link: downloadUrl,
        message: '✅ File uploaded to Supabase Storage successfully!',
        expiresIn: this.linkExpiration
      };

    } catch (error) {
      console.error('❌ Supabase upload failed:', error);

      let errorMessage = 'Supabase upload failed';
      if (error.message.includes('Supabase client not loaded')) {
        errorMessage = 'Supabase client not loaded. Please check your internet connection.';
      } else if (error.message.includes('configuration required')) {
        errorMessage = 'Supabase configuration missing. Please check your settings.';
      } else {
        errorMessage = `Supabase error: ${error.message || 'Upload failed'}`;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }
}
// Test Upload Service (for debugging)
class TestUploadService {
  constructor() {
    this.name = 'Test Service';
    this.maxFileSize = 100 * 1024 * 1024; // 100MB for testing
  }

  async upload(file, options = {}) {
    console.log('🧪 Test upload service called with file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // Check if file is valid
    if (!file || file.size === 0) {
      console.error('❌ Test service: File is empty or invalid');
      return {
        success: false,
        error: 'File is empty or invalid'
      };
    }

    // Report progress
    if (options.onProgress) {
      options.onProgress({ percentage: 25 });
      await new Promise(resolve => setTimeout(resolve, 500));
      options.onProgress({ percentage: 50 });
      await new Promise(resolve => setTimeout(resolve, 500));
      options.onProgress({ percentage: 75 });
      await new Promise(resolve => setTimeout(resolve, 500));
      options.onProgress({ percentage: 100 });
    }

    return {
      success: true,
      link: `https://test-only.example.com/file-${Date.now()}`,
      message: '⚠️ Test upload completed! This is a fake link for testing only. Configure Supabase for real uploads.'
    };
  }
}





// Folder compression utility using JSZip
class FolderCompressor {
  constructor() {
    this.zip = null;

    // Check if JSZip is available
    if (typeof window.JSZip === 'undefined') {
      console.error('❌ JSZip library not loaded - folder compression will not work');
      throw new Error('JSZip library not loaded');
    }

    console.log('✅ FolderCompressor ready - JSZip available');
  }

  async compressFolder(files, folderName, onProgress) {
    try {
      console.log('📁 Starting folder compression for:', folderName, 'Files:', files.length);

      // Check if JSZip is available
      if (typeof window.JSZip === 'undefined') {
        throw new Error('JSZip library not loaded');
      }

      // Limit folder size for performance
      if (files.length > 100) {
        throw new Error(`Too many files (${files.length}). Maximum 100 files per folder.`);
      }

      // Check total size
      let totalSize = 0;
      for (const file of files) {
        totalSize += file.size;
      }

      if (totalSize > 50 * 1024 * 1024) { // 50MB limit
        throw new Error(`Folder too large (${Math.round(totalSize / 1024 / 1024)}MB). Maximum 50MB.`);
      }

      this.zip = new window.JSZip();
      let processedFiles = 0;
      const totalFiles = files.length;

      // Add files to zip with async breaks to prevent UI freezing
      for (const file of files) {
        const relativePath = file.webkitRelativePath || file.name;
        console.log('📄 Adding file to zip:', relativePath);

        this.zip.file(relativePath, file);
        processedFiles++;

        if (onProgress) {
          const progress = Math.round((processedFiles / totalFiles) * 50); // 50% for adding files
          onProgress({
            percentage: progress,
            message: `Adding files to archive... (${processedFiles}/${totalFiles})`
          });
        }

        // Add small delay every 10 files to prevent UI freezing
        if (processedFiles % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      console.log('🗜️ Generating zip file...');
      if (onProgress) {
        onProgress({
          percentage: 60,
          message: 'Compressing files...'
        });
      }

      // Generate zip file with timeout protection
      const zipPromise = this.zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      }, (metadata) => {
        if (onProgress) {
          const progress = 60 + Math.round(metadata.percent * 0.4); // 60-100%
          onProgress({
            percentage: progress,
            message: `Compressing... ${Math.round(metadata.percent)}%`
          });
        }
      });

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Compression timeout after 30 seconds')), 30000);
      });

      const zipBlob = await Promise.race([zipPromise, timeoutPromise]);

      console.log('✅ Folder compressed successfully. Size:', zipBlob.size);

      // Create a File object from the blob
      const zipFileName = `${folderName || 'folder'}-${Date.now()}.zip`;
      const zipFile = new File([zipBlob], zipFileName, { type: 'application/zip' });

      return zipFile;
    } catch (error) {
      console.error('❌ Folder compression failed:', error);
      throw error;
    }
  }
}
// Main popup controller
class PopupController {
  constructor() {
    this.services = {
      'supabase': new SupabaseStorageService(),
      'test': new TestUploadService()
    };
    this.currentFile = null;
    this.isUploading = false;

    // Initialize folder compressor with error handling
    try {
      this.folderCompressor = new FolderCompressor();
      console.log('✅ FolderCompressor initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize FolderCompressor:', error);
      this.folderCompressor = null;
    }
    this.settings = {
      defaultService: 'supabase' || 'supabase',
      supabaseConfig: {
        url: 'https://your-project.supabase.co' || '',
        anonKey: 'your_supabase_anon_key_here' || '',
        bucketName: 'uploads' || 'uploads',
        linkExpiration: parseInt(3600) || 3600
      },
      showNotifications: true === 'true' || true,
      autoCopyToClipboard: true === 'true' || false,
      keepUploadHistory: true === 'true' || true,
      maxHistoryItems: parseInt(50) || 50,
      debugMode: false === 'true' || false
    };

    this.initializeElements();
    this.setupEventListeners();
    this.setupSharingButtons();
    this.optimizeForBrowser();
    this.loadSettings();

    // Load settings
    this.loadSettings().then(() => {
      // Force reset if any old service is still the default (cleanup from old versions)
      if (!this.services[this.settings.defaultService]) {
        console.log('🚨 DETECTED OLD SERVICE - RESETTING TO Supabase');
        this.settings.defaultService = 'supabase';
        this.saveSettings();
      }
    });
  }

  initializeElements() {
    this.uploadArea = document.getElementById('uploadArea');
    this.fileInput = document.getElementById('fileInput');
    this.folderInput = document.getElementById('folderInput');
    this.uploadContent = document.getElementById('uploadContent');
    this.progressContent = document.getElementById('progressContent');
    this.successContent = document.getElementById('successContent');
    this.errorContent = document.getElementById('errorContent');
    this.settingsPanel = document.getElementById('settingsPanel');
  }

  setupEventListeners() {
    // Enhanced file selection - separate buttons for files and folders
    const selectFileBtn = document.getElementById('selectFileBtn');
    const selectFolderBtn = document.getElementById('selectFolderBtn');

    // File selection via button
    selectFileBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.fileInput.click();
    });

    // Folder selection via button
    selectFolderBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.folderInput.click();
    });

    // Make entire upload area clickable
    this.uploadArea.addEventListener('click', () => {
      if (!this.uploadArea.classList.contains('hidden')) {
        this.fileInput.click();
      }
    });

    this.fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        this.handleFileSelection(files);
      }
    });

    this.folderInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        this.handleFileSelection(files);
      }
    });

    // Enhanced drag and drop with better visual feedback
    this.uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.uploadArea.classList.add('drag-over');
    });

    this.uploadArea.addEventListener('dragenter', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.uploadArea.classList.add('drag-over');
    });

    this.uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Only remove drag-over if we're leaving the upload area entirely
      if (!this.uploadArea.contains(e.relatedTarget)) {
        this.uploadArea.classList.remove('drag-over');
      }
    });

    this.uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.uploadArea.classList.remove('drag-over');

      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        this.handleFileSelection(files);
      }
    });

    // Prevent default drag behaviors on the entire document
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());

    // Add paste functionality
    this.setupPasteHandler();

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

    // IMMEDIATE SETTINGS SAVE - Add event listeners for dropdown changes
    document.getElementById('serviceSelect')?.addEventListener('change', () => {
      console.log('Service changed - saving immediately');
      this.saveSettingsFromUI();
    });

    document.getElementById('expirationSelect')?.addEventListener('change', () => {
      console.log('Expiration changed - saving immediately');
      this.saveSettingsFromUI();
    });

    // Force reset button
    document.getElementById('forceResetBtn')?.addEventListener('click', () => {
      console.log('🔄 Force reset button clicked');
      this.forceReset0x0st();
    });

    // Supabase config save button
    document.getElementById('saveSupabaseConfig')?.addEventListener('click', () => {
      this.saveSupabaseConfiguration();
    });

    document.getElementById('notificationsCheck')?.addEventListener('change', () => {
      console.log('Notifications changed - saving immediately');
      this.saveSettingsFromUI();
    });

    document.getElementById('autoCopyCheck')?.addEventListener('change', () => {
      console.log('Auto-copy changed - saving immediately');
      this.saveSettingsFromUI();
    });

    // History
    document.getElementById('historyBtn')?.addEventListener('click', () => {
      this.showHistory();
    });
  }

  setupPasteHandler() {
    // Add paste button to the UI
    this.addPasteButton();

    // Listen for paste events on the document
    document.addEventListener('paste', (e) => {
      this.handlePasteEvent(e);
    });

    // Listen for keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+V or Cmd+V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        // Only handle if we're in the upload area and no input is focused
        if (!e.target.matches('input, textarea, [contenteditable]') &&
            !this.uploadContent.classList.contains('hidden')) {
          e.preventDefault();
          // Show instructions instead of trying clipboard API
          this.showPasteInstructions();
        }
      }
    });
  }

  addPasteButton() {
    // Find the upload area buttons container
    const buttonsContainer = document.querySelector('.upload-buttons');
    if (!buttonsContainer) return;

    // Create paste button
    const pasteBtn = document.createElement('button');
    pasteBtn.id = 'pasteBtn';
    pasteBtn.className = 'upload-btn paste-btn';
    pasteBtn.innerHTML = `
      <span class="icon">📋</span>
      <span class="text">Paste Help</span>
      <span class="shortcut">Ctrl+V</span>
    `;
    pasteBtn.title = 'Show paste instructions (Ctrl+V to paste)';

    // Add click handler
    pasteBtn.addEventListener('click', () => {
      this.showPasteInstructions();
    });

    // Insert after the folder button
    const folderBtn = document.getElementById('selectFolderBtn');
    if (folderBtn && folderBtn.parentNode) {
      folderBtn.parentNode.insertBefore(pasteBtn, folderBtn.nextSibling);
    } else {
      buttonsContainer.appendChild(pasteBtn);
    }
  }

  async triggerPaste() {
    // For browser extensions, always show instructions instead of trying clipboard API
    // The clipboard API doesn't work reliably in extension popups
    this.showPasteInstructions();
  }



  handlePasteEvent(e) {
    // Only handle paste in upload area
    if (this.uploadContent.classList.contains('hidden')) return;

    e.preventDefault();

    try {
      const items = e.clipboardData?.items;
      if (!items) {
        this.showPasteInstructions();
        return;
      }

      const files = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        } else if (item.kind === 'string' && item.type === 'text/plain') {
          // Handle pasted text
          item.getAsString((text) => {
            if (text.trim()) {
              const textFile = new File([text], `pasted-text-${Date.now()}.txt`, { type: 'text/plain' });
              this.handleFileSelection([textFile]);
            }
          });
        }
      }

      if (files.length > 0) {
        this.showToast(`📋 Pasted ${files.length} file(s) from clipboard`, 'success', 3000);
        this.handleFileSelection(files);
      } else {
        this.showPasteInstructions();
      }
    } catch (error) {
      console.warn('Paste event failed:', error);
      this.showPasteInstructions();
    }
  }

  showPasteInstructions() {
    this.showToast(`📋 How to paste files:
• Copy an image (screenshot, right-click → copy image)
• Copy text from any app
• Then press Ctrl+V in the upload area
• Or drag & drop files directly`, 'info', 8000);
  }

  getExtensionFromMimeType(mimeType) {
    const mimeToExt = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'text/plain': 'txt',
      'text/html': 'html',
      'application/json': 'json'
    };
    return mimeToExt[mimeType] || 'bin';
  }

  async handleFileSelection(files) {
    try {
      // Handle single file or array of files
      const fileArray = Array.isArray(files) ? files : [files];

      if (fileArray.length === 0) {
        this.showToast('❌ No files selected', 'error', 3000);
        return;
      }

      // Check if this is a folder (multiple files with webkitRelativePath)
      const isFolder = fileArray.length > 1 || (fileArray[0].webkitRelativePath && fileArray[0].webkitRelativePath.includes('/'));

      if (isFolder) {
        console.log('📁 Folder detected with', fileArray.length, 'files');
        this.showToast(`📁 Folder selected with ${fileArray.length} files. Compressing...`, 'info', 3000);

        try {
          // Check if folder compressor is available
          if (!this.folderCompressor) {
            throw new Error('Folder compression not available. JSZip library may not be loaded.');
          }

          // Extract folder name from first file's path
          const firstPath = fileArray[0].webkitRelativePath || fileArray[0].name;
          const folderName = firstPath.split('/')[0] || 'folder';

          // Show progress UI
          this.showProgress({ name: `${folderName}.zip`, size: 0 });

          // Compress folder to zip with timeout protection
          const compressionPromise = this.folderCompressor.compressFolder(fileArray, folderName, (progress) => {
            this.updateProgress(progress.percentage, progress.message);
          });

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Folder compression timeout')), 60000);
          });

          const zipFile = await Promise.race([compressionPromise, timeoutPromise]);

          this.currentFile = zipFile;
          this.showToast(`✅ Folder compressed to ${zipFile.name}. Starting upload...`, 'success', 3000);

          // Upload the zip file
          await this.uploadFile(zipFile);
        } catch (error) {
          console.error('❌ Folder compression failed:', error);

          // Fallback: upload the first file instead of the whole folder
          if (fileArray.length > 0) {
            console.log('🔄 Falling back to uploading first file only');
            this.showToast('⚠️ Folder compression failed. Uploading first file only...', 'warning', 4000);

            const firstFile = fileArray[0];
            this.currentFile = firstFile;
            await this.uploadFile(firstFile);
            return;
          }

          this.showError(`Folder compression failed: ${error.message}`);
          return;
        }
      } else {
        // Single file upload
        const file = fileArray[0];
        this.currentFile = file;

        // Debug file information
        console.log('📄 File selected:', {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        });

        this.showToast(`📄 Selected: ${file.name} (${FileValidator.formatFileSize(file.size)})`, 'info', 2000);

        // Get current service
        const uploadService = this.services[this.settings.defaultService] || this.services['supabase'];

        // Validate file with visual feedback
        console.log('🔍 Validating file with maxFileSize:', uploadService.maxFileSize);
        const validation = FileValidator.validateFile(file, uploadService.maxFileSize);
        console.log('🔍 Validation result:', validation);

        if (!validation.valid) {
          console.error('❌ File validation failed:', validation);
          this.showError(validation.error || 'File validation failed');
          return;
        }

        // Show warnings if any
        if (validation.warnings?.length) {
          const warningMessage = validation.warnings.join(', ');
          this.showToast(`⚠️ ${warningMessage}`, 'warning', 4000);
        }

        // Show upload starting feedback
        this.showToast('🚀 Starting upload...', 'info', 1500);

        // Start upload
        await this.uploadFile(file);
      }
    } catch (error) {
      console.error('❌ File selection failed:', error);
      this.showError(`File selection failed: ${error.message}`);
    }
  }

  async uploadFile(file) {
    try {
      // Prevent duplicate uploads
      if (this.isUploading) {
        console.log('⚠️ Upload already in progress, ignoring duplicate request');
        return;
      }

      this.isUploading = true;
      this.showProgress(file);

      // Check if Supabase is configured when it's the default service
      if (this.settings.defaultService === 'supabase') {
        const config = this.settings.supabaseConfig;
        if (!config || !config.url || !config.anonKey) {
          // Show configuration prompt instead of switching to test service
          console.log('⚠️ Supabase not configured, showing configuration prompt');
          this.showError('Please configure Supabase in Settings to upload files. Click the Settings button to get started.');
          return;
        }
      }

      // Try primary service first
      let uploadService = this.services[this.settings.defaultService] || this.services['supabase'];
      console.log('🚀 UPLOAD DEBUG:');
      console.log('- Settings defaultService:', this.settings.defaultService);
      console.log('- Available services:', Object.keys(this.services));
      console.log('- Selected service:', uploadService.name);
      console.log('- Service object:', uploadService);

      let result = await uploadService.upload(file, {
        supabaseConfig: this.settings.supabaseConfig,
        onProgress: (progress) => {
          this.updateProgress(progress.percentage);
        }
      });

      // If primary service fails, try fallbacks in order
      if (!result.success) {
        console.log('Primary service failed, trying fallbacks...');

        const fallbackServices = ['0x0.st', 'file.io'];
        for (const serviceName of fallbackServices) {
          if (serviceName !== this.settings.defaultService && this.services[serviceName]) {
            console.log(`Trying fallback service: ${serviceName}`);
            this.updateProgress(0); // Reset progress
            uploadService = this.services[serviceName];
            result = await uploadService.upload(file, {
              supabaseConfig: this.settings.supabaseConfig,
              onProgress: (progress) => {
                this.updateProgress(progress.percentage);
              }
            });

            if (result.success) {
              break; // Stop trying if we succeed
            }
          }
        }
      }

      if (result.success && result.link) {
        await this.handleUploadSuccess(file, result.link);
      } else {
        this.showError(result.error || 'Upload failed. Please check your internet connection and try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      this.showError('An unexpected error occurred: ' + error.message);
    } finally {
      // Reset upload flag
      this.isUploading = false;
    }
  }

  async handleUploadSuccess(file, link) {
    // Validate the link first
    const linkValidation = LinkValidator.validateLink(link);

    if (!linkValidation.valid) {
      this.showError(`Link validation failed: ${linkValidation.error}`);
      return;
    }

    const validatedLink = linkValidation.url;
    const platform = linkValidation.platform;

    // Copy to clipboard if enabled
    let clipboardSuccess = false;
    if (this.settings.autoCopyToClipboard) {
      try {
        clipboardSuccess = await this.copyToClipboard(validatedLink);
      } catch (error) {
        console.warn('⚠️ Auto-copy to clipboard failed:', error);
        clipboardSuccess = false;
      }
    }

    // Save to history if enabled
    if (this.settings.keepUploadHistory) {
      await this.saveToHistory(file, validatedLink);
    }

    // Test link accessibility (non-blocking)
    this.testLinkAccessibility(validatedLink);

    // Show notifications if enabled
    if (this.settings.showNotifications) {
      const message = clipboardSuccess
        ? `File uploaded to ${platform}! Link copied to clipboard.`
        : `File uploaded to ${platform}! Click to copy link.`;

      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'EasyShare - Upload Complete',
        message: message
      });
    }

    // Show success with enhanced feedback
    this.showSuccess(validatedLink, clipboardSuccess, platform, file);

    // Show toast notification with sharing tips
    if (clipboardSuccess) {
      this.showToast(`🎉 File uploaded to ${platform}! Link ready for universal sharing`, 'success', 5000);
    } else {
      this.showToast(`✅ File uploaded to ${platform} successfully!`, 'success', 3000);
    }
  }

  // Test link accessibility to ensure it works across platforms
  async testLinkAccessibility(link) {
    try {
      // Simple HEAD request to check if the link is accessible
      const response = await fetch(link, {
        method: 'HEAD',
        mode: 'no-cors' // Avoid CORS issues for testing
      });

      console.log('Link accessibility test completed for:', link);

      // Could add more sophisticated testing here
      // For now, we just verify the link format is correct

    } catch (error) {
      console.warn('Link accessibility test failed:', error);
      // Non-critical error, don't show to user
    }
  }

  showProgress(file) {
    this.hideAllStates();
    this.progressContent.classList.remove('hidden');

    // Update file info
    document.getElementById('fileIcon').textContent = FileValidator.getFileIcon(file.name);
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = FileValidator.formatFileSize(file.size);

    this.updateProgress(0);
  }

  updateProgress(percentage, customMessage = null) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    progressFill.style.width = `${percentage}%`;

    if (customMessage) {
      progressText.textContent = customMessage;
    } else {
      progressText.textContent = `Uploading... ${percentage}%`;
    }
  }

  showSuccess(link, clipboardSuccess = false, platform = 'Unknown', file = null) {
    this.hideAllStates();
    this.successContent.classList.remove('hidden');

    const linkInput = document.getElementById('linkInput');
    linkInput.value = link;

    // Update success title with platform info
    const successTitle = document.querySelector('.success-title');
    if (successTitle) {
      successTitle.textContent = `Ready to share! (via Supabase)`;
    }

    // Update success message based on clipboard status
    const successSubtitle = document.querySelector('.success-subtitle');
    if (successSubtitle) {
      if (clipboardSuccess) {
        successSubtitle.innerHTML = `
          🎉 Link copied! Works on all platforms:<br>
          <small style="opacity: 0.8;">WhatsApp • Email • Slack • Discord • Teams • SMS</small>
        `;
        successSubtitle.style.background = '#dcfce7';
        successSubtitle.style.color = '#059669';
      } else {
        successSubtitle.innerHTML = `
          📋 Click copy to share anywhere:<br>
          <small style="opacity: 0.8;">Universal link - no registration required for recipients</small>
        `;
        successSubtitle.style.background = '#fef3c7';
        successSubtitle.style.color = '#d97706';
      }
    }

    // Auto-select the link text for easy copying
    linkInput.select();
    linkInput.focus();

    // Add sharing tips after a delay
    setTimeout(() => {
      this.showSharingTips(platform, file);
    }, 3000);
  }

  showSharingTips(platform = 'Unknown', file = null) {
    // Platform-specific and general sharing tips
    const platformTips = {
      'File.io': [
        '🔒 File.io is privacy-focused - files auto-delete after download',
        '🚀 Supports up to 2GB files with fast global delivery',
        '🛡️ No registration required - completely anonymous sharing',
        '⏰ Files expire automatically for enhanced security'
      ],
      'Transfer.sh': [
        '💡 Transfer.sh links work for 14 days - perfect for long-term sharing',
        '🔗 This link supports up to 10GB files - great for large media',
        '🌍 Transfer.sh works globally - recipients anywhere can download'
      ],

      '0x0.st': [
        '💡 0x0.st provides reliable temporary file hosting',
        '⚡ Fast upload service - great for quick sharing',
        '🔗 Simple, clean links that work everywhere'
      ]
    };

    const generalTips = [
      '📱 Perfect for WhatsApp: Just paste and send!',
      '✉️ Email-friendly: Recipients click to download instantly',
      '💬 Works in Slack, Discord, Teams - any chat platform',
      '🌐 Universal compatibility: Works on any device, any browser',
      '🔒 No registration required for recipients - just click and download',
      '📲 Great for SMS: Short links that work on mobile'
    ];

    // Combine platform-specific and general tips
    const allTips = [
      ...(platformTips[platform] || []),
      ...generalTips
    ];

    const randomTip = allTips[Math.floor(Math.random() * allTips.length)];
    this.showToast(randomTip, 'info', 5000);
  }

  showError(message) {
    this.hideAllStates();
    this.errorContent.classList.remove('hidden');

    document.getElementById('errorMessage').textContent = message;

    // Show error toast
    this.showToast(message, 'error', 5000);

    // Add helpful suggestions based on error type
    const errorMessageEl = document.getElementById('errorMessage');
    if (message.includes('Network error') || message.includes('failed')) {
      errorMessageEl.innerHTML = `
        ${message}
        <br><br>
        <strong>Try these solutions:</strong><br>
        • Check your internet connection<br>
        • Try a different upload service in Settings<br>
        • Use a smaller file size
      `;
    } else if (message.includes('size exceeds')) {
      errorMessageEl.innerHTML = `
        ${message}
        <br><br>
        <strong>Suggestions:</strong><br>
        • Compress your file before uploading<br>
        • Try a different service with higher limits<br>
        • Split large files into smaller parts
      `;
    }
  }

  hideAllStates() {
    this.uploadContent.classList.add('hidden');
    this.progressContent.classList.add('hidden');
    this.successContent.classList.add('hidden');
    this.errorContent.classList.add('hidden');
  }

  resetToInitialState() {
    this.currentFile = null;
    this.hideAllStates();
    this.uploadContent.classList.remove('hidden');
    this.fileInput.value = '';
  }

  async copyToClipboard(text) {
    // Always use fallback method for extensions as it's more reliable
    return this.fallbackCopyToClipboard(text);
  }

  fallbackCopyToClipboard(text) {
    try {
      // Create a temporary input element (works better than textarea in extensions)
      const input = document.createElement('input');
      input.type = 'text';
      input.value = text;

      // Style to make it invisible but functional
      input.style.position = 'absolute';
      input.style.left = '-9999px';
      input.style.top = '0';
      input.style.opacity = '0';
      input.style.zIndex = '-1';

      // Add to DOM
      document.body.appendChild(input);

      // Focus and select - important for extensions
      input.focus();
      input.select();

      // For better browser compatibility
      if (input.setSelectionRange) {
        input.setSelectionRange(0, text.length);
      }

      // Execute copy command
      let successful = false;
      try {
        successful = document.execCommand('copy');
      } catch (execError) {
        console.warn('execCommand failed:', execError);
        successful = false;
      }

      // Clean up
      document.body.removeChild(input);

      if (successful) {
        console.log('✅ Fallback clipboard success');
        return true;
      } else {
        console.warn('⚠️ Copy command failed - clipboard may not be available');
        return false;
      }
    } catch (fallbackError) {
      console.warn('⚠️ Fallback copy failed:', fallbackError.message);
      return false;
    }
  }

  async copyLinkToClipboard() {
    const linkInput = document.getElementById('linkInput');
    const success = await this.copyToClipboard(linkInput.value);

    // Enhanced visual feedback
    const copyBtn = document.getElementById('copyBtn');
    const originalText = copyBtn.innerHTML;

    if (success) {
      copyBtn.innerHTML = '<span class="icon">✓</span>';
      copyBtn.classList.add('copied');

      // Show temporary success message
      this.showToast('Link copied to clipboard!', 'success');

      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.classList.remove('copied');
      }, 2000);
    } else {
      // Auto-select the text for manual copying
      linkInput.select();
      linkInput.focus();

      // Show helpful message instead of error
      this.showToast('Link selected - press Ctrl+C to copy manually', 'info', 4000);

      // Don't change button appearance for failed copy
    }
  }

  showSettings() {
    this.settingsPanel.classList.remove('hidden');
    this.loadSettingsUI();
  }

  hideSettings() {
    this.settingsPanel.classList.add('hidden');
    this.saveSettingsFromUI();
  }

  loadSettingsUI() {
    const serviceSelect = document.getElementById('serviceSelect');
    const notificationsCheck = document.getElementById('notificationsCheck');
    const autoCopyCheck = document.getElementById('autoCopyCheck');

    serviceSelect.value = this.settings.defaultService;
    notificationsCheck.checked = this.settings.showNotifications;
    autoCopyCheck.checked = this.settings.autoCopyToClipboard;

    // Load Supabase configuration
    if (this.settings.supabaseConfig) {
      const urlField = document.getElementById('supabaseUrl');
      const anonKeyField = document.getElementById('supabaseAnonKey');
      const bucketField = document.getElementById('supabaseBucket');
      const expirationField = document.getElementById('supabaseExpiration');

      if (urlField) urlField.value = this.settings.supabaseConfig.url || '';
      if (anonKeyField) anonKeyField.value = this.settings.supabaseConfig.anonKey || '';
      if (bucketField) bucketField.value = this.settings.supabaseConfig.bucketName || 'uploads';
      if (expirationField) expirationField.value = this.settings.supabaseConfig.linkExpiration || 3600;
    }
  }

  saveSettingsFromUI() {
    const serviceSelect = document.getElementById('serviceSelect');
    const notificationsCheck = document.getElementById('notificationsCheck');
    const autoCopyCheck = document.getElementById('autoCopyCheck');

    this.settings = {
      ...this.settings,
      defaultService: serviceSelect.value,
      showNotifications: notificationsCheck.checked,
      autoCopyToClipboard: autoCopyCheck.checked
    };

    this.saveSettings();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['settings']);
      console.log('🔍 SETTINGS DEBUG:');
      console.log('- Loaded from storage:', result.settings);
      console.log('- Current settings before merge:', this.settings);

      if (result.settings) {
        this.settings = { ...this.settings, ...result.settings };
      }

      console.log('- Settings after merge:', this.settings);
      console.log('- Available services:', Object.keys(this.services));

      // Ensure valid service is selected
      if (!this.settings.defaultService || !this.services[this.settings.defaultService]) {
        console.log('❌ Invalid service detected, setting 0x0.st as default (was:', this.settings.defaultService, ')');
        this.settings.defaultService = '0x0.st';
        await this.saveSettings();
      } else {
        console.log('✅ Valid service selected:', this.settings.defaultService);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Ensure 0x0.st is default even if storage fails
      this.settings.defaultService = '0x0.st';
    }
  }

  async saveSettings() {
    try {
      console.log('💾 Saving settings:', this.settings);
      await chrome.storage.sync.set({ settings: this.settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  // Save Supabase configuration
  async saveSupabaseConfiguration() {
    try {
      const url = document.getElementById('supabaseUrl')?.value?.trim();
      const anonKey = document.getElementById('supabaseAnonKey')?.value?.trim();
      const bucketName = document.getElementById('supabaseBucket')?.value?.trim() || 'uploads';
      const linkExpiration = parseInt(document.getElementById('supabaseExpiration')?.value) || 3600;

      if (!url || !anonKey) {
        this.showToast('❌ Please fill in Supabase URL and Anon Key', 'error', 3000);
        return;
      }

      // Basic URL validation
      try {
        const urlObj = new URL(url);
        if (!urlObj.hostname.includes('supabase.co') && !urlObj.hostname.includes('supabase.in')) {
          this.showToast('❌ Invalid Supabase URL format', 'error', 3000);
          return;
        }
      } catch (e) {
        this.showToast('❌ Invalid URL format', 'error', 3000);
        return;
      }

      // Validate expiration time
      if (linkExpiration < 60 || linkExpiration > 604800) {
        this.showToast('❌ Link expiration must be between 60 seconds and 7 days', 'error', 3000);
        return;
      }

      this.settings.supabaseConfig = {
        url: url,
        anonKey: anonKey,
        bucketName: bucketName,
        linkExpiration: linkExpiration
      };

      await this.saveSettings();
      this.showToast('✅ Supabase configuration saved!', 'success', 3000);
      console.log('Supabase config saved:', this.settings.supabaseConfig);
    } catch (error) {
      console.error('Failed to save Supabase config:', error);
      this.showToast('❌ Failed to save Supabase configuration', 'error', 3000);
    }
  }

  // Force reset to Supabase Storage - call this if there are persistent issues
  async forceReset0x0st() {
    console.log('🔄 FORCE RESET: Clearing all settings and setting Supabase as default');
    try {
      // Clear all stored settings
      await chrome.storage.sync.clear();
      await chrome.storage.local.clear();

      // Set fresh settings with Supabase using environment variables
      this.settings = {
        defaultService: 'supabase' || 'supabase',
        supabaseConfig: {
          url: 'https://your-project.supabase.co' || '',
          anonKey: 'your_supabase_anon_key_here' || '',
          bucketName: 'uploads' || 'uploads',
          linkExpiration: parseInt(3600) || 3600
        },
        showNotifications: true === 'true' || true,
        autoCopyToClipboard: true === 'true' || false,
        keepUploadHistory: true === 'true' || true,
        maxHistoryItems: parseInt(50) || 50,
        debugMode: false === 'true' || false
      };

      await this.saveSettings();
      this.loadSettingsUI();

      console.log('✅ Reset complete! Default service is now Supabase Storage');
      this.showToast('🔄 Settings reset! Now using Supabase Storage', 'success', 3000);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  }

  async saveToHistory(file, link) {
    try {
      const historyItem = {
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: file.size,
        uploadDate: Date.now(),
        downloadLink: link,
        serviceName: this.settings.defaultService
      };

      const result = await chrome.storage.local.get(['uploadHistory']);
      const history = result.uploadHistory || [];

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

  showHistory() {
    console.log('History feature - simplified for standalone version');
    this.showToast('Upload history feature coming soon!', 'info');
  }

  // Enhanced toast notification system
  showToast(message, type = 'success', duration = 3000) {
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };

    const colors = {
      success: { bg: '#10b981', border: '#059669' },
      error: { bg: '#ef4444', border: '#dc2626' },
      info: { bg: '#3b82f6', border: '#2563eb' },
      warning: { bg: '#f59e0b', border: '#d97706' }
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;

    const color = colors[type] || colors.info;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color.bg};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-left: 4px solid ${color.border};
      display: flex;
      align-items: center;
      gap: 8px;
      animation: toastSlideIn 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    `;

    // Add CSS animation
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastSlideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        .toast-icon { font-size: 14px; }
        .toast-message { flex: 1; }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, duration);

    // Click to dismiss
    toast.addEventListener('click', () => {
      toast.style.animation = 'toastSlideOut 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    });
  }

  // Interactive Sharing System
  setupSharingButtons() {
    // Update button icons with real platform icons
    this.updateSharingButtonIcons();

    // Email sharing
    document.getElementById('emailShareBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.shareViaEmail();
    });

    // Messaging sharing
    document.getElementById('messagingShareBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Messaging button clicked');
      this.shareViaMessaging();
    });

    // Team collaboration sharing
    document.getElementById('teamShareBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.shareViaTeamTools();
    });

    // Universal sharing
    document.getElementById('universalShareBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.shareUniversal();
    });
  }

  updateSharingButtonIcons() {
    // Update main sharing button icons with real platform icons
    const emailIcon = document.getElementById('emailIcon');
    const messagingIcon = document.getElementById('messagingIcon');
    const teamIcon = document.getElementById('teamIcon');
    const universalIcon = document.getElementById('universalIcon');

    // Check if PlatformIcons is available (loaded from global scope)
    const icons = window.PlatformIcons;

    if (emailIcon && icons?.email?.gmail) {
      emailIcon.innerHTML = `<img src="${icons.email.gmail}" alt="Email" width="20" height="20" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));">`;
    }

    if (messagingIcon && icons?.messaging?.whatsapp) {
      messagingIcon.innerHTML = `<img src="${icons.messaging.whatsapp}" alt="Messaging" width="20" height="20" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));">`;
    }

    if (teamIcon && icons?.team?.slack) {
      teamIcon.innerHTML = `<img src="${icons.team.slack}" alt="Team Tools" width="20" height="20" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));">`;
    }

    if (universalIcon && icons?.universal?.share) {
      universalIcon.innerHTML = `<img src="${icons.universal.share}" alt="Universal Share" width="20" height="20" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));">`;
    }
  }

  shareViaEmail() {
    const link = document.getElementById('linkInput').value;
    const fileName = this.currentFile?.name || 'Shared File';

    // Show email platform options
    this.showEmailOptions(link, fileName);
  }

  showEmailOptions(link, fileName) {
    const subject = encodeURIComponent(`Shared file: ${fileName}`);
    const body = encodeURIComponent(
      `Hi! I'm sharing a file with you: ${fileName}\n\n` +
      `Download link: ${link}\n\n` +
      `No registration required - just click to download!\n\n` +
      `Best regards`
    );

    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    const browser = this.getBrowserInfo();
    const icons = window.PlatformIcons || {};

    const options = [
      {
        name: 'Gmail',
        icon: icons.email?.gmail || '📧',
        url: `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`,
        description: 'Open Gmail in browser',
        color: '#EA4335'
      },
      {
        name: 'Outlook',
        icon: icons.email?.outlook || '📧',
        url: `https://outlook.live.com/mail/0/deeplink/compose?to=&subject=${subject}&body=${body}`,
        description: 'Open Outlook Web',
        color: '#0078D4'
      },
      {
        name: 'Default Email App',
        icon: icons.email?.generic || '📧',
        description: browser.name === 'edge' ? 'Open Outlook desktop app' : 'Open default email client',
        color: '#6B7280',
        action: () => {
          try {
            window.open(mailtoUrl, '_blank');
            this.showToast('Opening default email client...', 'success');
          } catch (error) {
            this.showBrowserSpecificError('Could not open email client.', 'email_client');
            this.copyToClipboard(link);
          }
        }
      },
      {
        name: 'Copy Email Template',
        icon: icons.universal?.copy || '📋',
        description: 'Copy formatted email to clipboard',
        color: '#6B7280',
        action: () => {
          const emailTemplate = `Subject: Shared file: ${fileName}\n\nHi! I'm sharing a file with you: ${fileName}\n\nDownload link: ${link}\n\nNo registration required - just click to download!\n\nBest regards`;
          this.copyToClipboard(emailTemplate);
          this.showToast('Email template copied to clipboard!', 'success');
        }
      }
    ];

    this.showSharingModal('Choose Email Platform', options);
  }

  shareViaMessaging() {
    console.log('shareViaMessaging called');

    const linkInput = document.getElementById('linkInput');
    if (!linkInput) {
      console.error('Link input not found');
      this.showToast('Error: Link input not found', 'error');
      return;
    }

    const link = linkInput.value;
    const fileName = this.currentFile?.name || 'Shared File';

    console.log('shareViaMessaging called with:', { link, fileName });

    // Validate that we have a link
    if (!link || link.trim() === '') {
      this.showToast('Please upload a file first!', 'error');
      return;
    }

    // Show messaging options
    this.showMessagingOptions(link, fileName);
  }

  showMessagingOptions(link, fileName) {
    const message = encodeURIComponent(`📎 ${fileName}\n${link}`);
    const icons = window.PlatformIcons || {};

    const options = [
      {
        name: 'WhatsApp Web',
        icon: icons.messaging?.whatsapp || '💬',
        url: `https://wa.me/?text=${message}`,
        description: 'Share via WhatsApp Web',
        color: '#25D366'
      },
      {
        name: 'Telegram',
        icon: icons.messaging?.telegram || '✈️',
        url: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(fileName)}`,
        description: 'Share via Telegram',
        color: '#0088CC'
      },
      {
        name: 'Signal',
        icon: icons.messaging?.signal || '🔒',
        url: `https://signal.me/#/compose?text=${message}`,
        description: 'Share via Signal (if installed)',
        color: '#3A76F0'
      }
    ];

    this.showSharingModal('Choose Messaging App', options);
  }

  shareViaTeamTools() {
    const link = document.getElementById('linkInput').value;
    const fileName = this.currentFile?.name || 'Shared File';

    // Show team collaboration options
    this.showTeamOptions(link, fileName);
  }

  showTeamOptions(link, fileName) {
    const message = `📎 Shared file: ${fileName}\n${link}\n\nNo registration required - direct download link.`;
    const icons = window.PlatformIcons || {};

    const options = [
      {
        name: 'Slack',
        icon: icons.team?.slack || '💼',
        url: `https://slack.com/intl/en-gb/`,
        description: 'Open Slack (message copied to clipboard)',
        color: '#4A154B',
        action: () => {
          this.copyToClipboard(message);
          window.open('https://slack.com/intl/en-gb/', '_blank');
          this.showToast('Message copied! Paste in Slack channel', 'success');
        }
      },
      {
        name: 'Microsoft Teams',
        icon: icons.team?.teams || '🏢',
        url: `https://teams.microsoft.com/`,
        description: 'Open Teams (message copied to clipboard)',
        color: '#5059C9',
        action: () => {
          this.copyToClipboard(message);
          window.open('https://teams.microsoft.com/', '_blank');
          this.showToast('Message copied! Paste in Teams chat', 'success');
        }
      },
      {
        name: 'Discord',
        icon: icons.team?.discord || '🎮',
        url: `https://discord.com/app`,
        description: 'Open Discord (message copied to clipboard)',
        color: '#5865F2',
        action: () => {
          this.copyToClipboard(message);
          window.open('https://discord.com/app', '_blank');
          this.showToast('Message copied! Paste in Discord channel', 'success');
        }
      }
    ];

    this.showSharingModal('Choose Team Platform', options);
  }

  shareUniversal() {
    const link = document.getElementById('linkInput').value;
    const fileName = this.currentFile?.name || 'Shared File';

    // Show universal sharing options
    this.showUniversalOptions(link, fileName);
  }

  showUniversalOptions(link, fileName) {
    const icons = window.PlatformIcons || {};

    const options = [
      {
        name: 'Copy Simple Link',
        icon: icons.universal?.link || '🔗',
        description: 'Just the download link',
        color: '#6B7280',
        action: () => {
          this.copyToClipboard(link);
          this.showToast('Simple link copied!', 'success');
        }
      },
      {
        name: 'Copy with Filename',
        icon: icons.universal?.copy || '📎',
        description: 'Filename + link',
        color: '#6B7280',
        action: () => {
          this.copyToClipboard(`${fileName}\n${link}`);
          this.showToast('Filename and link copied!', 'success');
        }
      },
      {
        name: 'Copy Formatted Message',
        icon: icons.universal?.share || '💬',
        description: 'Ready-to-send message',
        color: '#6B7280',
        action: () => {
          const message = `📎 ${fileName}\n${link}\n\nNo registration required - just click to download!`;
          this.copyToClipboard(message);
          this.showToast('Formatted message copied!', 'success');
        }
      },
      {
        name: 'Copy Professional Format',
        icon: icons.universal?.copy || '🏢',
        description: 'Business-friendly message',
        color: '#374151',
        action: () => {
          const message = `I'm sharing a file with you: ${fileName}\n\nDownload link: ${link}\n\nThis is a direct download link that works in any browser. No account registration required.`;
          this.copyToClipboard(message);
          this.showToast('Professional message copied!', 'success');
        }
      }
    ];

    this.showSharingModal('Universal Share Options', options);
  }

  showSharingModal(title, options) {
    console.log('showSharingModal called with:', { title, options });

    // Remove any existing modal
    const existingModal = document.querySelector('.sharing-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'sharing-modal';

    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" aria-label="Close">×</button>
        </div>
        <div class="modal-body">
          ${options.map(option => `
            <button class="modal-option" data-option="${option.name}" ${option.color ? `style="--option-color: ${option.color}"` : ''}>
              <span class="option-icon">
                ${option.icon.startsWith('data:image/svg+xml')
                  ? `<img src="${option.icon}" alt="${option.name}" width="24" height="24" style="filter: ${option.color ? `drop-shadow(0 0 2px ${option.color}30)` : 'none'};">`
                  : option.icon}
              </span>
              <div class="option-details">
                <span class="option-name">${option.name}</span>
                <span class="option-description">${option.description}</span>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Add modal styles
    if (!document.querySelector('#modal-styles')) {
      const style = document.createElement('style');
      style.id = 'modal-styles';
      style.textContent = `
        .sharing-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: modalFadeIn 0.3s ease;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .modal-content {
          position: relative;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          max-width: 320px;
          width: 90%;
          max-height: 80vh;
          overflow: hidden;
          animation: modalSlideIn 0.3s ease;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
        }

        .modal-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 20px;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .modal-body {
          padding: 16px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .modal-option {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 12px;
          margin-bottom: 8px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .modal-option:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
        }

        .modal-option:last-child {
          margin-bottom: 0;
        }

        .option-icon {
          font-size: 20px;
          margin-right: 12px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }

        .option-icon img {
          width: 24px;
          height: 24px;
          object-fit: contain;
          border-radius: 4px;
        }

        .option-details {
          flex: 1;
        }

        .option-name {
          display: block;
          font-weight: 500;
          color: #1f2937;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .option-description {
          display: block;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.3;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideIn {
          from { transform: translateY(-20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(modal);

    // Handle option clicks
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
        this.closeSharingModal(modal);
        return;
      }

      const optionButton = e.target.closest('.modal-option');
      if (optionButton) {
        const optionName = optionButton.dataset.option;
        const option = options.find(opt => opt.name === optionName);

        if (option) {
          if (option.action) {
            option.action();
          } else if (option.url) {
            window.open(option.url, '_blank');
            this.showToast(`Opening ${option.name}...`, 'info');
          }

          this.closeSharingModal(modal);
        }
      }
    });

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.closeSharingModal(modal);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  closeSharingModal(modal) {
    modal.style.animation = 'modalFadeIn 0.3s ease reverse';
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 300);
  }

  showShareFeedback(buttonId, message) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.classList.add('success');
      setTimeout(() => {
        button.classList.remove('success');
      }, 2000);
    }
    this.showToast(message, 'success');
  }

  // Browser detection and optimization utilities
  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Edg/')) return { name: 'edge', version: this.extractVersion(userAgent, 'Edg/') };
    if (userAgent.includes('Brave/')) return { name: 'brave', version: this.extractVersion(userAgent, 'Brave/') };
    if (userAgent.includes('Chrome/')) return { name: 'chrome', version: this.extractVersion(userAgent, 'Chrome/') };
    return { name: 'unknown', version: '0' };
  }

  extractVersion(userAgent, prefix) {
    const start = userAgent.indexOf(prefix) + prefix.length;
    const end = userAgent.indexOf(' ', start);
    return userAgent.substring(start, end === -1 ? undefined : end);
  }

  // Browser-specific optimizations
  optimizeForBrowser() {
    const browser = this.getBrowserInfo();

    switch (browser.name) {
      case 'edge':
        this.optimizeForEdge();
        break;
      case 'brave':
        this.optimizeForBrave();
        break;
      case 'chrome':
        this.optimizeForChrome();
        break;
      default:
        console.log('Running on unknown browser, using default settings');
    }
  }

  optimizeForEdge() {
    // Edge-specific optimizations
    console.log('Optimizing for Microsoft Edge');

    // Enhance Microsoft Teams integration
    this.edgeOptimizations = {
      preferredEmailClient: 'outlook',
      enhancedTeamsIntegration: true,
      windowsIntegration: true
    };
  }

  optimizeForBrave() {
    // Brave-specific optimizations
    console.log('Optimizing for Brave Browser');

    // Privacy-focused optimizations
    this.braveOptimizations = {
      respectPrivacyShields: true,
      minimizeExternalRequests: true,
      enhancedSecurityMode: true
    };

    // Show privacy-friendly messages
    this.privacyMode = true;
  }

  optimizeForChrome() {
    // Chrome-specific optimizations
    console.log('Optimizing for Google Chrome');

    // Standard Chrome optimizations
    this.chromeOptimizations = {
      fullFeatureSet: true,
      googleServicesIntegration: true,
      standardBehavior: true
    };
  }

  // Enhanced error handling with browser-specific messages
  showBrowserSpecificError(error, context) {
    const browser = this.getBrowserInfo();
    let message = error;
    let suggestions = [];

    if (browser.name === 'brave' && context === 'external_redirect') {
      message = 'Brave\'s privacy shields may have blocked this action.';
      suggestions = [
        'Try clicking the Brave shield icon and allowing redirects',
        'Use the Universal Share button as an alternative',
        'Copy the link manually from the input field'
      ];
    } else if (browser.name === 'edge' && context === 'email_client') {
      message = 'Having trouble opening your email client?';
      suggestions = [
        'Make sure Outlook is set as your default email app',
        'Try the Universal Share button for manual copying',
        'Check Windows default app settings'
      ];
    }

    this.showError(message);

    if (suggestions.length > 0) {
      setTimeout(() => {
        const suggestionText = suggestions.map(s => `• ${s}`).join('\n');
        this.showToast(`💡 Suggestions:\n${suggestionText}`, 'info', 8000);
      }, 2000);
    }
  }

  // VS Code Integration
  setupVSCodeIntegration() {
    console.log('🔧 Setting up VS Code integration');

    if (typeof acquireVsCodeApi !== 'undefined') {
      this.vscode = acquireVsCodeApi();

      // Listen for messages from VS Code extension
      window.addEventListener('message', (event) => {
        const message = event.data;

        switch (message.command) {
          case 'pasteFiles':
            this.handleVSCodePastedFiles(message.files);
            break;
          case 'pasteText':
            this.handleVSCodePastedText(message.text);
            break;
          case 'fileContent':
            this.handleVSCodeFileContent(message);
            break;
          case 'clipboardContent':
            this.handleVSCodeClipboardContent(message.content);
            break;
          case 'error':
            this.showToast(`VS Code Error: ${message.message}`, 'error', 5000);
            break;
        }
      });

      // Notify VS Code that webview is ready
      this.vscode.postMessage({ command: 'ready' });

      // Update paste button for VS Code
      this.updatePasteButtonForVSCode();
    }
  }

  updatePasteButtonForVSCode() {
    const pasteBtn = document.getElementById('pasteBtn');
    if (pasteBtn) {
      const shortcutSpan = pasteBtn.querySelector('.shortcut');
      if (shortcutSpan) {
        shortcutSpan.textContent = 'Ctrl+Shift+V';
      }
      pasteBtn.title = 'Paste files from VS Code clipboard (Ctrl+Shift+V)';
    }
  }

  handleVSCodePastedFiles(filePaths) {
    console.log('📁 VS Code pasted files:', filePaths);
    this.showToast(`📋 Processing ${filePaths.length} file(s) from VS Code...`, 'info', 3000);

    // Request file content from VS Code for each file
    filePaths.forEach(filePath => {
      if (this.vscode) {
        this.vscode.postMessage({
          command: 'readFile',
          filePath: filePath
        });
      }
    });
  }

  handleVSCodePastedText(text) {
    console.log('📝 VS Code pasted text:', text.substring(0, 100) + '...');

    if (text.trim()) {
      const textFile = new File([text], `vscode-paste-${Date.now()}.txt`, { type: 'text/plain' });
      this.showToast('📋 Creating text file from VS Code clipboard...', 'success', 3000);
      this.handleFileSelection([textFile]);
    }
  }

  handleVSCodeFileContent(data) {
    console.log('📄 VS Code file content received:', data.fileName);

    try {
      // Convert array back to Uint8Array
      const content = new Uint8Array(data.content);
      const file = new File([content], data.fileName);

      this.showToast(`📄 File loaded from VS Code: ${data.fileName}`, 'success', 3000);
      this.handleFileSelection([file]);
    } catch (error) {
      console.error('Failed to process VS Code file:', error);
      this.showToast(`❌ Failed to process file: ${data.fileName}`, 'error', 4000);
    }
  }

  handleVSCodeClipboardContent(content) {
    console.log('📋 VS Code clipboard content received');

    if (content.trim()) {
      const textFile = new File([content], `clipboard-${Date.now()}.txt`, { type: 'text/plain' });
      this.showToast('📋 Creating file from clipboard content...', 'success', 3000);
      this.handleFileSelection([textFile]);
    } else {
      this.showToast('📋 Clipboard is empty or contains no text', 'info', 3000);
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.popupController = new PopupController();

  // Initialize VS Code integration if available
  if (typeof acquireVsCodeApi !== 'undefined') {
    window.popupController.setupVSCodeIntegration();
  }
});
