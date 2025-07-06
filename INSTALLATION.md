# EasyShare Extension Installation Guide

## Quick Start

1. **Build the extension**:
   ```bash
   npm install
   npm run build
   ```

2. **Create icons** (temporary step for development):
   - Open `create-icons.html` in your browser
   - Right-click each canvas and save as PNG:
     - Save as `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
   - Copy these PNG files to `dist/icons/` directory
   - Delete the `.placeholder` files in `dist/icons/`

3. **Load in browser**:
   - Open Chrome/Edge/Brave
   - Go to `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `dist` folder

4. **Test the extension**:
   - Click the EasyShare icon in your browser toolbar
   - Try uploading a small test file
   - Verify the link is copied to clipboard

## Detailed Installation Steps

### Step 1: Prerequisites

- Node.js 16+ installed
- Chrome, Edge, or Brave browser
- Basic command line knowledge

### Step 2: Download and Build

```bash
# Clone or download the project
cd easyshare

# Install dependencies
npm install

# Build the extension
npm run build
```

This creates a `dist` folder with the compiled extension.

### Step 3: Create Icons

**Option A: Use the icon generator (recommended for testing)**
1. Open `create-icons.html` in any browser
2. Right-click each canvas and "Save image as..."
3. Save with exact names: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
4. Copy to `dist/icons/` directory
5. Delete `.placeholder` files

**Option B: Use your own icons**
- Create PNG files: 16x16, 32x32, 48x48, 128x128 pixels
- Name them: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
- Place in `dist/icons/` directory

### Step 4: Load Extension in Browser

#### Chrome:
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `dist` folder
5. Extension should appear in toolbar

#### Microsoft Edge:
1. Open `edge://extensions/`
2. Enable "Developer mode" (left sidebar)
3. Click "Load unpacked"
4. Select the `dist` folder
5. Extension should appear in toolbar

#### Brave Browser:
1. Open `brave://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `dist` folder
5. Extension should appear in toolbar

### Step 5: Test the Extension

1. **Click the EasyShare icon** in your browser toolbar
2. **Upload a test file**:
   - Click "Select File" or drag a small file into the popup
   - Watch the upload progress
   - Verify the link appears and is copied to clipboard
3. **Test the link**:
   - Open a new tab or incognito window
   - Paste the link and verify the file downloads

### Step 6: Configure Settings (Optional)

1. Click the gear icon in the EasyShare popup
2. Adjust settings:
   - Upload service (file.io vs 0x0.st)
   - Default expiration time
   - Notification preferences
   - Auto-copy behavior

## Troubleshooting

### Extension doesn't load
- Check that `dist` folder contains `manifest.json`
- Verify all icon files are present in `dist/icons/`
- Check browser console for errors

### Upload fails
- Test with a small file first (< 1MB)
- Check internet connection
- Try different upload service in settings
- Check browser console for network errors

### Icons don't appear
- Ensure PNG files are in `dist/icons/` directory
- Verify file names match exactly: `icon16.png`, etc.
- Remove any `.placeholder` files

### Popup doesn't open
- Check if extension is enabled in browser settings
- Try reloading the extension
- Check for JavaScript errors in browser console

## Development Mode

For active development:

```bash
# Watch for changes and rebuild automatically
npm run watch

# In another terminal, rebuild assets when needed
npm run copy-assets
```

After making changes:
1. Save your files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the EasyShare extension
4. Test your changes

## File Structure

After building, your `dist` folder should look like:

```
dist/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── styles/
│   └── popup.css
├── services/
│   └── uploadServices.js
├── types/
│   └── index.js
└── utils/
    └── fileValidation.js
```

## Next Steps

Once installed and working:
- Try uploading different file types and sizes
- Test the keyboard shortcut (Ctrl+Shift+S)
- Explore the settings panel
- Check upload history functionality
- Share feedback or report issues

## Production Deployment

For production use:
1. Create professional icons (consider hiring a designer)
2. Test thoroughly across different browsers
3. Package for Chrome Web Store submission
4. Add proper error tracking and analytics (optional)
5. Create user documentation and support channels
