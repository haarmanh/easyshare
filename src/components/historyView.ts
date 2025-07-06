import { UploadHistoryItem } from '../types/index.js';
import { FileValidator } from '../utils/fileValidation.js';

export class HistoryView {
  private container: HTMLElement;
  private historyItems: UploadHistoryItem[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupHistoryView();
  }

  private setupHistoryView(): void {
    this.container.innerHTML = `
      <div class="history-panel">
        <div class="history-header">
          <h3>Upload History</h3>
          <div class="history-actions">
            <button class="clear-history-btn" id="clearHistoryBtn">Clear All</button>
            <button class="close-btn" id="closeHistoryBtn">×</button>
          </div>
        </div>
        <div class="history-content" id="historyContent">
          <div class="loading">Loading history...</div>
        </div>
      </div>
    `;

    this.setupEventListeners();
    this.loadHistory();
  }

  private setupEventListeners(): void {
    const closeBtn = this.container.querySelector('#closeHistoryBtn');
    const clearBtn = this.container.querySelector('#clearHistoryBtn');

    closeBtn?.addEventListener('click', () => {
      this.hide();
    });

    clearBtn?.addEventListener('click', () => {
      this.clearHistory();
    });
  }

  private async loadHistory(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['uploadHistory']);
      this.historyItems = result.uploadHistory || [];
      this.renderHistory();
    } catch (error) {
      console.error('Failed to load history:', error);
      this.showError('Failed to load upload history');
    }
  }

  private renderHistory(): void {
    const content = this.container.querySelector('#historyContent');
    if (!content) return;

    if (this.historyItems.length === 0) {
      content.innerHTML = `
        <div class="empty-history">
          <div class="empty-icon">📁</div>
          <p>No uploads yet</p>
          <p class="empty-subtitle">Your upload history will appear here</p>
        </div>
      `;
      return;
    }

    const historyHTML = this.historyItems.map(item => this.renderHistoryItem(item)).join('');
    content.innerHTML = `<div class="history-list">${historyHTML}</div>`;

    // Add event listeners for copy buttons
    content.querySelectorAll('.copy-link-btn').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        this.copyLink(this.historyItems[index]!.downloadLink);
      });
    });
  }

  private renderHistoryItem(item: UploadHistoryItem): string {
    const uploadDate = new Date(item.uploadDate).toLocaleDateString();
    const uploadTime = new Date(item.uploadDate).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const fileIcon = FileValidator.getFileIcon(item.fileName);
    const fileSize = FileValidator.formatFileSize(item.fileSize);
    
    const isExpired = item.expirationDate && item.expirationDate < Date.now();
    const statusClass = isExpired ? 'expired' : 'active';
    const statusText = isExpired ? 'Expired' : 'Active';

    return `
      <div class="history-item ${statusClass}">
        <div class="file-info">
          <span class="file-icon">${fileIcon}</span>
          <div class="file-details">
            <div class="file-name" title="${item.fileName}">${item.fileName}</div>
            <div class="file-meta">
              ${fileSize} • ${uploadDate} ${uploadTime} • ${item.serviceName}
            </div>
          </div>
        </div>
        <div class="item-actions">
          <span class="status ${statusClass}">${statusText}</span>
          <button class="copy-link-btn" ${isExpired ? 'disabled' : ''} title="Copy link">
            📋
          </button>
        </div>
      </div>
    `;
  }

  private async copyLink(link: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(link);
      this.showToast('Link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy link:', error);
      this.showToast('Failed to copy link', 'error');
    }
  }

  private async clearHistory(): Promise<void> {
    if (!confirm('Are you sure you want to clear all upload history?')) {
      return;
    }

    try {
      await chrome.storage.local.set({ uploadHistory: [] });
      this.historyItems = [];
      this.renderHistory();
      this.showToast('History cleared');
    } catch (error) {
      console.error('Failed to clear history:', error);
      this.showToast('Failed to clear history', 'error');
    }
  }

  private showError(message: string): void {
    const content = this.container.querySelector('#historyContent');
    if (content) {
      content.innerHTML = `
        <div class="error-state">
          <div class="error-icon">❌</div>
          <p>${message}</p>
        </div>
      `;
    }
  }

  private showToast(message: string, type: 'success' | 'error' = 'success'): void {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  show(): void {
    this.container.classList.remove('hidden');
    this.loadHistory();
  }

  hide(): void {
    this.container.classList.add('hidden');
  }
}
