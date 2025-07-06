import { FileValidationResult } from '../types/index.js';

export class FileValidator {
  static validateFile(file: File, maxSize: number): FileValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

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

    const result: FileValidationResult = {
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

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    const iconMap: Record<string, string> = {
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

    return iconMap[extension] || iconMap['default']!;
  }
}
