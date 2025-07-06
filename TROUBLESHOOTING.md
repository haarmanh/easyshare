# EasyShare Extension Troubleshooting Guide

## 🔧 Network Error Fix

The "Network error occurred" issue you're experiencing is common with browser extensions trying to upload files to external services. Here's how to fix it:

### ✅ **Immediate Solutions**

#### 1. **Test with Debug Service**
1. **Reload the extension** in `chrome://extensions/`
2. **Open EasyShare popup**
3. **Click Settings (gear icon)**
4. **Change Upload Service** to "Test Service (for debugging)"
5. **Try uploading a file** - this should work and show the upload flow

#### 2. **Try Alternative Service**
1. **In Settings**, change to "0x0.st (512MB, fast)"
2. **Try uploading a small file** (< 10MB)
3. **This service often has better CORS support**

#### 3. **Check Browser Console**
1. **Right-click on extension popup** → "Inspect"
2. **Go to Console tab**
3. **Try uploading again**
4. **Look for detailed error messages**

### 🔍 **Detailed Diagnosis**

#### Common Causes:
1. **CORS Policy**: file.io may have changed their CORS settings
2. **Network Restrictions**: Corporate firewall or VPN blocking requests
3. **Browser Security**: Some browsers block certain cross-origin requests
4. **Service Availability**: Upload service might be temporarily down

#### Check Network:
```bash
# Test if file.io is accessible
curl -X POST https://file.io -F "file=@test.txt"
```

### 🛠️ **Advanced Fixes**

#### Option 1: Use Different Upload Service
The extension now includes multiple services with automatic fallback:
- **file.io** (2GB, primary)
- **0x0.st** (512MB, fallback)
- **Test Service** (debugging)

#### Option 2: Enable Detailed Logging
1. **Open browser console** (F12)
2. **Go to Console tab**
3. **Upload a file and check for errors**
4. **Look for specific error messages**

#### Option 3: Check Extension Permissions
1. **Go to** `chrome://extensions/`
2. **Find EasyShare extension**
3. **Click "Details"**
4. **Verify permissions include**:
   - Storage
   - Notifications
   - Host permissions for file.io, 0x0.st

### 🔄 **Step-by-Step Reload Process**

1. **Go to** `chrome://extensions/`
2. **Find EasyShare extension**
3. **Click the refresh/reload icon** 🔄
4. **Wait for reload to complete**
5. **Try uploading again**

### 🧪 **Testing Procedure**

#### Test 1: Debug Service
1. **Settings** → **Upload Service** → **Test Service**
2. **Upload any file**
3. **Should show progress and generate fake link**
4. **If this works, the extension logic is fine**

#### Test 2: Alternative Service
1. **Settings** → **Upload Service** → **0x0.st**
2. **Upload small file** (< 10MB)
3. **Check if real upload works**

#### Test 3: Original Service
1. **Settings** → **Upload Service** → **file.io**
2. **Upload small file**
3. **Check browser console for specific errors**

### 📋 **Error Message Guide**

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| "Network error occurred" | CORS/Firewall | Try alternative service |
| "Upload timed out" | Slow connection | Use smaller file |
| "File size exceeds limit" | File too large | Check service limits |
| "Invalid response" | Service issue | Try different service |

### 🔧 **Manual Fixes**

#### Fix 1: Update Manifest Permissions
If you're comfortable editing files:
```json
"host_permissions": [
  "https://*/*",
  "http://*/*"
]
```

#### Fix 2: Disable CORS (Development Only)
**Chrome**: Start with `--disable-web-security --user-data-dir=/tmp/chrome_dev`
**⚠️ Warning**: Only for testing, not for regular use

### 🆘 **If Nothing Works**

#### Fallback Options:
1. **Use Test Service** to verify extension works
2. **Try different browser** (Edge, Brave)
3. **Check if corporate network blocks uploads**
4. **Try from different network** (mobile hotspot)

#### Report Issue:
If the test service works but real uploads don't:
1. **Copy error messages** from browser console
2. **Note your browser version**
3. **Describe your network setup**
4. **Try from different location/network**

### 🎯 **Expected Behavior**

#### Working Upload:
1. **Select file** → Progress bar appears
2. **Upload progresses** → 0% to 100%
3. **Success message** → Link appears
4. **Link copied** to clipboard automatically
5. **Notification** shows (if enabled)

#### Debug Service Test:
1. **Simulates upload** with fake progress
2. **Always succeeds** with example.com link
3. **Tests all UI components**
4. **Verifies extension logic**

### 📞 **Quick Support**

**Working?** ✅ Try Test Service first
**Still failing?** 🔍 Check browser console
**Console errors?** 📋 Copy exact error messages
**Network issue?** 🌐 Try different network/browser

The extension is designed to be robust with multiple fallback options. The Test Service should always work, helping isolate whether the issue is with the extension logic or the upload services themselves.
