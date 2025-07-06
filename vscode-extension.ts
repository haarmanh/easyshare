import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    console.log('EasyShare VS Code extension is now active!');

    // Register paste files command
    let pasteFilesCommand = vscode.commands.registerCommand('easyshare.pasteFiles', async () => {
        await handlePasteFiles(context);
    });

    // Register open panel command
    let openPanelCommand = vscode.commands.registerCommand('easyshare.openPanel', async () => {
        await openEasySharePanel(context);
    });

    context.subscriptions.push(pasteFilesCommand, openPanelCommand);
}

async function handlePasteFiles(context: vscode.ExtensionContext) {
    try {
        // Get clipboard content
        const clipboardText = await vscode.env.clipboard.readText();
        
        // Check if clipboard contains file paths
        const filePaths = parseFilePaths(clipboardText);
        
        if (filePaths.length > 0) {
            // Open EasyShare panel with files
            await openEasySharePanelWithFiles(context, filePaths);
        } else {
            // Open EasyShare panel and paste clipboard content as text
            await openEasySharePanelWithText(context, clipboardText);
        }
    } catch (error) {
        vscode.window.showErrorMessage(`EasyShare: Failed to paste files - ${error}`);
    }
}

async function openEasySharePanel(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'easyshare',
        'EasyShare - File Sharing',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, 'dist')),
                vscode.Uri.file(path.join(context.extensionPath, 'src'))
            ]
        }
    );

    // Set the HTML content
    panel.webview.html = getWebviewContent(context, panel.webview);

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
        async (message) => {
            switch (message.command) {
                case 'ready':
                    console.log('EasyShare webview ready');
                    break;
                case 'requestPaste':
                    await handleWebviewPasteRequest(panel);
                    break;
                case 'readFile':
                    await handleFileReadRequest(panel, message.filePath);
                    break;
            }
        },
        undefined,
        context.subscriptions
    );

    return panel;
}

async function openEasySharePanelWithFiles(context: vscode.ExtensionContext, filePaths: string[]) {
    const panel = await openEasySharePanel(context);
    
    // Send files to webview after a short delay to ensure it's ready
    setTimeout(() => {
        panel.webview.postMessage({
            command: 'pasteFiles',
            files: filePaths
        });
    }, 1000);
}

async function openEasySharePanelWithText(context: vscode.ExtensionContext, text: string) {
    const panel = await openEasySharePanel(context);
    
    // Send text to webview
    setTimeout(() => {
        panel.webview.postMessage({
            command: 'pasteText',
            text: text
        });
    }, 1000);
}

async function handleWebviewPasteRequest(panel: vscode.WebviewPanel) {
    try {
        const clipboardText = await vscode.env.clipboard.readText();
        panel.webview.postMessage({
            command: 'clipboardContent',
            content: clipboardText
        });
    } catch (error) {
        panel.webview.postMessage({
            command: 'error',
            message: `Failed to read clipboard: ${error}`
        });
    }
}

async function handleFileReadRequest(panel: vscode.WebviewPanel, filePath: string) {
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath);
            const fileName = path.basename(filePath);
            
            panel.webview.postMessage({
                command: 'fileContent',
                fileName: fileName,
                content: Array.from(content), // Convert Buffer to array for JSON serialization
                filePath: filePath
            });
        } else {
            panel.webview.postMessage({
                command: 'error',
                message: `File not found: ${filePath}`
            });
        }
    } catch (error) {
        panel.webview.postMessage({
            command: 'error',
            message: `Failed to read file: ${error}`
        });
    }
}

function parseFilePaths(text: string): string[] {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const filePaths: string[] = [];
    
    for (const line of lines) {
        // Check if line looks like a file path
        if (fs.existsSync(line)) {
            filePaths.push(line);
        }
    }
    
    return filePaths;
}

function getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview): string {
    // Get paths to resources
    const distPath = vscode.Uri.file(path.join(context.extensionPath, 'dist'));
    const distUri = webview.asWebviewUri(distPath);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EasyShare</title>
    <link rel="stylesheet" href="${distUri}/styles/popup.css">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #f8fafc;
        }
        .vscode-integration {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #3b82f6;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div class="vscode-integration">VS Code Integration Active</div>
    
    <!-- Include the EasyShare popup HTML content here -->
    <!-- This would be the content from popup.html -->
    
    <script src="${distUri}/libs/supabase.js"></script>
    <script src="${distUri}/libs/jszip.min.js"></script>
    <script src="${distUri}/icons/platform-icons.js"></script>
    <script>
        // VS Code API
        const vscode = acquireVsCodeApi();
        
        // Enhanced paste handling for VS Code
        window.addEventListener('message', (event) => {
            const message = event.data;
            
            switch (message.command) {
                case 'pasteFiles':
                    handleVSCodeFiles(message.files);
                    break;
                case 'pasteText':
                    handleVSCodeText(message.text);
                    break;
                case 'fileContent':
                    handleVSCodeFileContent(message);
                    break;
                case 'error':
                    console.error('VS Code error:', message.message);
                    break;
            }
        });
        
        function handleVSCodeFiles(filePaths) {
            console.log('Received files from VS Code:', filePaths);
            // Process files with EasyShare
        }
        
        function handleVSCodeText(text) {
            console.log('Received text from VS Code:', text);
            // Create text file and upload
            if (window.popupController && text.trim()) {
                const textFile = new File([text], \`vscode-paste-\${Date.now()}.txt\`, { type: 'text/plain' });
                window.popupController.handleFileSelection([textFile]);
            }
        }
        
        function handleVSCodeFileContent(data) {
            // Convert array back to Uint8Array
            const content = new Uint8Array(data.content);
            const file = new File([content], data.fileName);
            
            if (window.popupController) {
                window.popupController.handleFileSelection([file]);
            }
        }
        
        // Notify VS Code that webview is ready
        vscode.postMessage({ command: 'ready' });
    </script>
    <script src="${distUri}/popup.js"></script>
</body>
</html>`;
}

export function deactivate() {}
