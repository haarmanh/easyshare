// VS Code Integration for EasyShare Paste Command
// This file provides VS Code specific functionality for pasting files

class VSCodeIntegration {
  constructor() {
    this.isVSCode = this.detectVSCode();
    if (this.isVSCode) {
      this.setupVSCodeIntegration();
    }
  }

  detectVSCode() {
    // Check if we're running in VS Code context
    return typeof window !== 'undefined' && 
           (window.location.href.includes('vscode-webview') || 
            window.navigator.userAgent.includes('VSCode'));
  }

  setupVSCodeIntegration() {
    // Add VS Code specific paste handling
    this.addVSCodePasteCommand();
    this.setupVSCodeKeyboardShortcuts();
  }

  addVSCodePasteCommand() {
    // Register VS Code command for pasting files
    if (typeof acquireVsCodeApi !== 'undefined') {
      const vscode = acquireVsCodeApi();
      
      // Listen for messages from VS Code extension
      window.addEventListener('message', (event) => {
        const message = event.data;
        
        switch (message.command) {
          case 'pasteFiles':
            this.handleVSCodePastedFiles(message.files);
            break;
          case 'pasteClipboard':
            this.handleVSCodeClipboardPaste();
            break;
        }
      });

      // Send ready message to VS Code
      vscode.postMessage({
        command: 'ready',
        text: 'EasyShare webview ready for file paste'
      });
    }
  }

  setupVSCodeKeyboardShortcuts() {
    // Enhanced keyboard shortcuts for VS Code
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+V for VS Code paste (different from regular Ctrl+V)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        this.requestVSCodePaste();
      }
    });
  }

  requestVSCodePaste() {
    if (typeof acquireVsCodeApi !== 'undefined') {
      const vscode = acquireVsCodeApi();
      vscode.postMessage({
        command: 'requestPaste',
        text: 'Request file paste from VS Code'
      });
    }
  }

  handleVSCodePastedFiles(files) {
    // Convert VS Code file paths to File objects
    const filePromises = files.map(async (filePath) => {
      try {
        // Request file content from VS Code
        const vscode = acquireVsCodeApi();
        vscode.postMessage({
          command: 'readFile',
          filePath: filePath
        });
        
        // This would be handled by the VS Code extension
        // returning the file content as a message
        return null; // Placeholder
      } catch (error) {
        console.error('Failed to read file from VS Code:', error);
        return null;
      }
    });

    // Show feedback to user
    if (window.popupController) {
      window.popupController.showToast(
        `📋 Pasting ${files.length} file(s) from VS Code...`, 
        'info', 
        3000
      );
    }
  }

  handleVSCodeClipboardPaste() {
    // Handle clipboard paste in VS Code context
    if (window.popupController) {
      window.popupController.triggerPaste();
    }
  }

  // Utility method to create File objects from VS Code file data
  createFileFromVSCodeData(fileName, content, mimeType = 'application/octet-stream') {
    const blob = new Blob([content], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
  }
}

// VS Code Extension Command Template
const vsCodeExtensionCommand = `
// Add this to your VS Code extension's package.json commands:
{
  "command": "easyshare.pasteFiles",
  "title": "EasyShare: Paste Files",
  "category": "EasyShare"
}

// Add this to your VS Code extension's main.js:
vscode.commands.registerCommand('easyshare.pasteFiles', async () => {
  const panel = vscode.window.createWebviewPanel(
    'easyshare',
    'EasyShare',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'dist'))]
    }
  );

  // Get clipboard content
  const clipboardText = await vscode.env.clipboard.readText();
  
  // Send to webview
  panel.webview.postMessage({
    command: 'pasteClipboard',
    content: clipboardText
  });
});
`;

// Initialize VS Code integration if available
if (typeof window !== 'undefined') {
  window.vsCodeIntegration = new VSCodeIntegration();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VSCodeIntegration;
}
