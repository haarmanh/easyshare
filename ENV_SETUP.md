# 🔧 Environment Variables Setup for EasyShare

This guide explains how to configure environment variables for the EasyShare browser extension.

## 📋 Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your actual values:
   ```bash
   # Open in your preferred editor
   notepad .env        # Windows
   nano .env          # Linux/Mac
   code .env          # VS Code
   ```

3. **Build the extension** to apply the environment variables:
   ```bash
   npm run build
   ```

## 🔑 Required Variables

### Supabase Configuration (Required for file uploads)

```env
# Your Supabase project URL
SUPABASE_URL=https://your-project.supabase.co

# Your Supabase anon/public key
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Storage bucket name (create this in Supabase Storage)
SUPABASE_BUCKET_NAME=uploads
```

### How to get Supabase credentials:

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to **Settings** → **API**
3. Copy the **Project URL** and **anon/public key**
4. Go to **Storage** and create a bucket named `uploads` (or your preferred name)
5. Set the bucket to **Public** if you want direct file access

## ⚙️ Optional Configuration

### Extension Behavior
```env
# Default upload service (supabase, file.io, 0x0.st, test)
DEFAULT_SERVICE=supabase

# Show browser notifications
SHOW_NOTIFICATIONS=true

# Auto-copy links to clipboard
AUTO_COPY_TO_CLIPBOARD=true

# Keep upload history
KEEP_UPLOAD_HISTORY=true

# Maximum history items
MAX_HISTORY_ITEMS=50
```

### File Upload Settings
```env
# Maximum file size in bytes (100MB = 104857600)
MAX_FILE_SIZE=104857600

# Upload timeout in milliseconds (5 minutes = 300000)
UPLOAD_TIMEOUT=300000

# Allowed file types (comma-separated, * for all)
ALLOWED_FILE_TYPES=*

# Supabase link expiration in seconds (1 hour = 3600)
SUPABASE_LINK_EXPIRATION=3600
```

### Development Settings
```env
# Enable debug logging
DEBUG_MODE=false

# Extension version
EXTENSION_VERSION=4.0.0
```

## 🔄 How Environment Variables Work

1. **Build Time Injection**: Environment variables are injected into the JavaScript files during the build process
2. **Fallback to Defaults**: If a variable is not set, the extension uses sensible defaults
3. **User Settings Override**: Users can still override these settings through the extension's settings UI

## 🛠️ Build Process

The build script (`build.js`) automatically:

1. Reads the `.env` file
2. Replaces `process.env.VARIABLE_NAME` placeholders in the source files
3. Copies the processed files to the `dist/` directory

## 📁 File Structure

```
easyshare/
├── .env                    # Your environment variables (not committed)
├── .env.example           # Template file (committed)
├── src/
│   ├── utils/config.js    # Configuration management
│   └── standalone/        # Source files with env placeholders
└── dist/                  # Built files with injected values
```

## 🔒 Security Notes

- **Never commit `.env` files** to version control
- The `.env` file is already in `.gitignore`
- Only commit `.env.example` with placeholder values
- Supabase anon keys are safe to use in browser extensions (they have Row Level Security)

## 🚀 Deployment

For different environments, create separate `.env` files:

- `.env.development` - Development settings
- `.env.production` - Production settings
- `.env.local` - Local overrides

## 🐛 Troubleshooting

### Extension not using environment variables
1. Make sure you ran `npm run build` after creating/updating `.env`
2. Check that the `.env` file is in the root directory
3. Verify the variable names match exactly (case-sensitive)

### Supabase uploads failing
1. Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
2. Make sure the bucket exists and is public
3. Check the bucket name matches `SUPABASE_BUCKET_NAME`

### Build errors
1. Check that all required variables are set in `.env`
2. Make sure there are no syntax errors in the `.env` file
3. Try deleting the `dist/` folder and rebuilding

## 📞 Support

If you encounter issues with environment variable setup:

1. Check this guide first
2. Verify your `.env` file syntax
3. Try the example values from `.env.example`
4. Check the browser console for error messages
