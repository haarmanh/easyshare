# EasyShare Extension Testing Guide

## Pre-Testing Setup

1. **Build the extension**:
   ```bash
   npm run build
   ```

2. **Create icons**:
   - Open `create-icons.html` in browser
   - Save each canvas as PNG: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
   - Copy to `dist/icons/` directory
   - Remove `.placeholder` files

3. **Load in browser**:
   - Chrome: `chrome://extensions/` → Developer mode → Load unpacked → Select `dist`
   - Edge: `edge://extensions/` → Developer mode → Load unpacked → Select `dist`
   - Brave: `brave://extensions/` → Developer mode → Load unpacked → Select `dist`

## Core Functionality Tests

### Test 1: Basic File Upload
1. Click EasyShare icon in toolbar
2. Click "Select File" button
3. Choose a small test file (< 1MB)
4. Verify:
   - Upload progress shows
   - Link appears when complete
   - Link is copied to clipboard
   - Success message displays

### Test 2: Drag & Drop Upload
1. Open EasyShare popup
2. Drag a file from desktop into the popup area
3. Verify:
   - Drag-over visual feedback works
   - Upload starts automatically
   - Progress and completion work as expected

### Test 3: Large File Handling
1. Try uploading a file > 100MB
2. Verify:
   - Warning message appears
   - Upload still proceeds (if under 2GB)
   - Progress updates smoothly

### Test 4: File Size Limits
1. Try uploading a file > 2GB
2. Verify:
   - Error message appears
   - Upload is prevented
   - Clear error explanation provided

### Test 5: Network Error Handling
1. Disconnect internet
2. Try uploading a file
3. Verify:
   - Appropriate error message
   - Retry button appears
   - Works when connection restored

## User Interface Tests

### Test 6: Popup Responsiveness
1. Test popup on different screen sizes
2. Verify:
   - 400x300px popup size maintained
   - All elements visible and accessible
   - Text doesn't overflow
   - Buttons are clickable

### Test 7: Settings Panel
1. Click settings gear icon
2. Verify:
   - Settings panel opens
   - All options are functional
   - Changes are saved
   - Panel closes properly

### Test 8: Upload History
1. Upload several files
2. Click history button
3. Verify:
   - History panel opens
   - Files are listed correctly
   - Copy buttons work
   - Clear history functions

### Test 9: Visual States
1. Test all UI states:
   - Initial upload area
   - Progress state
   - Success state
   - Error state
2. Verify smooth transitions between states

## Advanced Features Tests

### Test 10: Clipboard Integration
1. Upload a file successfully
2. Verify:
   - Link automatically copied to clipboard
   - Manual copy button works
   - Visual feedback on copy action

### Test 11: Notifications
1. Enable notifications in settings
2. Upload a file
3. Verify:
   - Browser notification appears
   - Notification content is correct
   - Clicking notification works

### Test 12: Keyboard Shortcuts
1. Press `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac)
2. Verify:
   - EasyShare popup opens
   - Shortcut works from any tab

### Test 13: Multiple Upload Services
1. Go to settings
2. Switch between file.io and 0x0.st
3. Upload files with each service
4. Verify:
   - Both services work
   - File size limits respected
   - Links are generated correctly

### Test 14: Expiration Options
1. Test different expiration settings:
   - After 1 download
   - 1 hour, 1 day, 1 week, 2 weeks
2. Verify settings are applied to uploads

## Browser Compatibility Tests

### Test 15: Chrome Compatibility
- Test on Chrome 88+
- Verify all features work
- Check console for errors

### Test 16: Microsoft Edge Compatibility
- Test on Edge 88+
- Verify all features work
- Check for Edge-specific issues

### Test 17: Brave Browser Compatibility
- Test on Brave browser
- Verify all features work
- Check privacy features don't interfere

## Error Scenarios Tests

### Test 18: Invalid Files
1. Try uploading:
   - Empty files (0 bytes)
   - Files with special characters in names
   - Very long filenames
2. Verify appropriate handling

### Test 19: Service Unavailability
1. Block access to upload services (using browser dev tools)
2. Try uploading
3. Verify:
   - Clear error messages
   - Retry functionality
   - Graceful degradation

### Test 20: Storage Limits
1. Fill up browser storage
2. Try saving settings/history
3. Verify graceful handling

## Performance Tests

### Test 21: Upload Speed
1. Upload files of various sizes
2. Monitor:
   - Upload progress accuracy
   - Time to completion
   - Memory usage

### Test 22: Extension Startup
1. Restart browser
2. Click extension icon immediately
3. Verify:
   - Quick popup opening
   - No loading delays
   - Settings preserved

## Security Tests

### Test 23: File Content Privacy
1. Upload sensitive test file
2. Verify:
   - File is uploaded securely (HTTPS)
   - No local caching of file content
   - Proper cleanup after upload

### Test 24: Link Security
1. Generate upload links
2. Verify:
   - Links use HTTPS
   - Links are properly formatted
   - No sensitive data in URLs

## Regression Tests

### Test 25: Settings Persistence
1. Change all settings
2. Close and reopen extension
3. Restart browser
4. Verify settings are preserved

### Test 26: History Persistence
1. Upload several files
2. Close and reopen extension
3. Restart browser
4. Verify history is preserved

## Production Readiness Tests

### Test 27: Icon Quality
1. Check extension icons in:
   - Browser toolbar
   - Extension management page
   - Various zoom levels
2. Verify clarity and consistency

### Test 28: Manifest Validation
1. Check manifest.json for:
   - Correct permissions
   - Valid URLs
   - Proper version info
   - Complete metadata

### Test 29: Code Quality
1. Check browser console for:
   - JavaScript errors
   - Warning messages
   - Performance issues

### Test 30: User Experience
1. Test with fresh users
2. Verify:
   - Intuitive interface
   - Clear instructions
   - Minimal learning curve

## Test Results Template

For each test, record:
- ✅ Pass / ❌ Fail
- Browser tested
- Notes/Issues found
- Screenshots if applicable

## Common Issues & Solutions

### Extension doesn't load
- Check manifest.json syntax
- Verify all required files present
- Check browser console for errors

### Upload fails
- Test internet connection
- Try different file sizes
- Check service availability

### Icons don't appear
- Ensure PNG files in correct location
- Check file naming exactly matches manifest
- Verify file permissions

### Settings don't save
- Check browser storage permissions
- Test in incognito mode
- Clear extension data and retry

## Automated Testing (Future)

Consider implementing:
- Unit tests for core functions
- Integration tests for upload flow
- Performance benchmarks
- Cross-browser automated testing

## Reporting Issues

When reporting issues, include:
- Browser version
- Operating system
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshots/videos
