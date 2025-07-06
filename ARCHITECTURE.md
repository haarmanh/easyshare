# 🏗️ EasyShare Architecture

This document explains the client-server architecture of EasyShare, where the Chrome extension communicates with Vercel API routes that proxy requests to Supabase.

## 📋 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Chrome         │    │  Vercel         │    │  Supabase       │
│  Extension      │    │  API Routes     │    │  Storage        │
│  (Frontend)     │◄──►│  (Backend)      │◄──►│  (Database)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔄 Data Flow

1. **User Action** → Chrome Extension UI
2. **API Request** → Chrome Extension → Vercel API Routes
3. **Supabase Operation** → Vercel → Supabase Storage/Database
4. **Response** → Supabase → Vercel → Chrome Extension
5. **UI Update** → Chrome Extension displays result

## 🎯 Components

### 1. Chrome Extension (Frontend)
- **Location**: `dist/` folder
- **Purpose**: User interface and file handling
- **Technology**: Vanilla JavaScript, Chrome Extension APIs
- **Key Files**:
  - `popup.js` - Main UI logic
  - `background.js` - Service worker
  - `services/apiService.js` - API communication layer

### 2. Vercel API Routes (Backend)
- **Location**: `api/` folder
- **Purpose**: Proxy requests to Supabase, handle authentication
- **Technology**: Node.js, Vercel Functions
- **Key Files**:
  - `api/upload.js` - File upload handling
  - `api/health.js` - Health checks and diagnostics
  - `api/config.js` - Configuration endpoint

### 3. Supabase (Storage & Database)
- **Purpose**: File storage, metadata, authentication
- **Technology**: PostgreSQL, Object Storage
- **Features**: Signed URLs, Row Level Security, Real-time

## 🔐 Security Model

### Chrome Extension Security
- **No Direct Supabase Access**: Extension never connects directly to Supabase
- **API-Only Communication**: All operations go through Vercel API
- **CORS Protection**: Vercel handles CORS for cross-origin requests
- **No Sensitive Data**: Extension stores no API keys or secrets

### Vercel API Security
- **Environment Variables**: Supabase credentials stored securely
- **Request Validation**: Input validation and sanitization
- **Error Handling**: Safe error messages without exposing internals
- **Rate Limiting**: Built-in Vercel rate limiting

### Supabase Security
- **Row Level Security**: Database-level access control
- **Signed URLs**: Temporary, secure file access
- **Bucket Policies**: Storage-level permissions
- **API Key Rotation**: Regular credential updates

## 📡 API Endpoints

### POST /api/upload
**Purpose**: Upload files to Supabase Storage

**Request**:
```json
{
  "fileName": "document.pdf",
  "fileData": "base64-encoded-file-content",
  "fileType": "application/pdf"
}
```

**Response**:
```json
{
  "success": true,
  "link": "https://supabase.co/storage/signed-url",
  "fileName": "timestamp-random.pdf",
  "originalName": "document.pdf",
  "expiresIn": 3600,
  "message": "File uploaded successfully!"
}
```

### GET /api/health
**Purpose**: Check API and Supabase connectivity

**Response**:
```json
{
  "healthy": true,
  "service": "EasyShare API",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "supabase": {
    "configured": true,
    "connected": true,
    "bucketExists": true
  }
}
```

### GET /api/config
**Purpose**: Get extension configuration

**Response**:
```json
{
  "version": "4.0.0",
  "maxFileSize": 104857600,
  "linkExpiration": 3600,
  "features": {
    "showNotifications": true,
    "autoCopyToClipboard": true
  },
  "api": {
    "baseUrl": "https://your-app.vercel.app"
  }
}
```

## 🔧 Configuration

### Environment Variables (Vercel)
```env
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_BUCKET_NAME=uploads

# Optional
VERCEL_URL=your-app.vercel.app
MAX_FILE_SIZE=104857600
SUPABASE_LINK_EXPIRATION=3600
```

### Chrome Extension Settings
- **API Base URL**: Automatically detected from config endpoint
- **Upload Service**: Defaults to 'vercel-api'
- **Fallback Services**: file.io, 0x0.st for emergencies
- **User Preferences**: Stored in Chrome storage

## 🚀 Deployment Process

### 1. Vercel Deployment
```bash
# Set environment variables in Vercel dashboard
# Deploy automatically via GitHub integration
git push origin main
```

### 2. Chrome Extension Build
```bash
# Build extension with Vercel URL
npm run build

# Load unpacked extension in Chrome
# Extension automatically connects to Vercel API
```

## 🔄 Service Communication

### ApiService Class
**Location**: `src/services/apiService.js`

**Key Methods**:
- `initialize()` - Fetch configuration from Vercel
- `uploadFile(file)` - Upload file via Vercel API
- `checkHealth()` - Verify API connectivity
- `setBaseUrl(url)` - Update API endpoint

### VercelApiService Class
**Location**: `src/standalone/popup.js`

**Purpose**: Upload service implementation using ApiService
**Integration**: Plugs into existing service architecture

## 🐛 Error Handling

### Extension Level
- **Network Errors**: Retry with exponential backoff
- **API Errors**: Display user-friendly messages
- **Fallback Services**: Automatic failover to file.io/0x0.st

### API Level
- **Validation Errors**: 400 Bad Request with details
- **Supabase Errors**: 500 Internal Server Error (sanitized)
- **Configuration Errors**: 503 Service Unavailable

### Monitoring
- **Health Checks**: Regular API health monitoring
- **Error Logging**: Structured logging for debugging
- **User Feedback**: Clear error messages in UI

## 📊 Benefits of This Architecture

### Security
- ✅ No client-side API keys
- ✅ Centralized authentication
- ✅ CORS protection
- ✅ Request validation

### Scalability
- ✅ Serverless auto-scaling
- ✅ CDN distribution
- ✅ Database connection pooling
- ✅ Caching opportunities

### Maintainability
- ✅ Separation of concerns
- ✅ Centralized business logic
- ✅ Easy testing and debugging
- ✅ Version control

### User Experience
- ✅ Faster initial load
- ✅ Reliable uploads
- ✅ Better error handling
- ✅ Consistent performance

## 🔄 Migration from Direct Supabase

### What Changed
- **Before**: Extension → Supabase directly
- **After**: Extension → Vercel API → Supabase

### Backward Compatibility
- Legacy SupabaseStorageService still available
- Automatic fallback to direct connection if API fails
- User settings preserved during migration

### Benefits
- Improved security and reliability
- Better error handling and monitoring
- Easier maintenance and updates
- Compliance with browser security policies
