# 🚀 EasyShare Deployment Guide

This guide will help you deploy your EasyShare application with the client-server architecture.

## 📋 Prerequisites

✅ **Supabase Project**: Already configured with your credentials
✅ **GitHub Repository**: Code is already pushed to GitHub
✅ **Vercel Account**: You'll need a free Vercel account

## 🔧 Step 1: Deploy to Vercel

### 1.1 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in/sign up
2. Click **"New Project"**
3. Import your GitHub repository: `haarmanh/easyshare`
4. Click **"Deploy"** (don't configure anything yet)

### 1.2 Configure Environment Variables

After the initial deployment, go to your project settings:

1. Go to **Settings** → **Environment Variables**
2. Add these variables one by one:

```env
SUPABASE_URL=https://avrmsyqizgyxtldtmyyr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cm1zeXFpemd5eHRsZHRteXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzMzODYsImV4cCI6MjA2NzMwOTM4Nn0.lHA8s8iiMdHGFd7SIs0kK9Spo1xafEC3z-x8aitouz0
SUPABASE_BUCKET_NAME=uploads
DEFAULT_SERVICE=vercel-api
SHOW_NOTIFICATIONS=true
AUTO_COPY_TO_CLIPBOARD=true
KEEP_UPLOAD_HISTORY=true
MAX_HISTORY_ITEMS=50
MAX_FILE_SIZE=104857600
SUPABASE_LINK_EXPIRATION=3600
DEBUG_MODE=false
EXTENSION_VERSION=4.0.0
FILEIO_API_URL=https://file.io
ZEROXZERO_API_URL=https://0x0.st
ALLOWED_FILE_TYPES=*
UPLOAD_TIMEOUT=300000
```

3. Set **Environment** to **"Production"** for each variable
4. Click **"Save"**

### 1.3 Redeploy with Environment Variables

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait for deployment to complete

## 🏥 Step 2: Test Your Deployment

### 2.1 Check API Health

Visit your Vercel URL + `/api/health`:
```
https://easyshare-vnbw.vercel.app/api/health
```

You should see:
```json
{
  "healthy": true,
  "service": "EasyShare API",
  "supabase": {
    "configured": true,
    "connected": true,
    "bucketExists": true
  }
}
```

### 2.2 Test Configuration Endpoint

Visit your Vercel URL + `/api/config`:
```
https://easyshare-vnbw.vercel.app/api/config
```

You should see your configuration settings.

## 📦 Step 3: Update Chrome Extension

### 3.1 Update API Base URL

Once you have your Vercel URL, update the extension:

✅ **Already configured!** Your extension is now set to use:
```javascript
this.baseUrl = 'https://easyshare-vnbw.vercel.app';
```

3. Rebuild the extension:
```bash
npm run build
```

### 3.2 Install Updated Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (top right)
3. Click **"Load unpacked"**
4. Select the `dist` folder
5. The extension should now connect to your Vercel API

## 🧪 Step 4: Test End-to-End

### 4.1 Test File Upload

1. Click the EasyShare extension icon
2. Drop a test file or click "Choose Files"
3. The file should upload via your Vercel API
4. You should get a shareable download link

### 4.2 Verify in Supabase

1. Go to your Supabase dashboard
2. Navigate to **Storage** → **uploads** bucket
3. You should see your uploaded file

## 🔧 Step 5: Supabase Storage Setup

### 5.1 Create Storage Bucket (if not exists)

1. Go to your Supabase dashboard
2. Navigate to **Storage**
3. Click **"Create a new bucket"**
4. Name: `uploads`
5. Make it **Public**
6. Click **"Create bucket"**

### 5.2 Set Bucket Policies

Add this policy for public access:

```sql
-- Allow public uploads
CREATE POLICY "Public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'uploads');

-- Allow public downloads
CREATE POLICY "Public downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');
```

## 🌐 Step 6: Share Your Extension

### 6.1 Distribution Options

**Option A: Direct Download**
- Share your Vercel URL (e.g., `https://your-app.vercel.app`)
- Users can download the extension zip from your landing page

**Option B: GitHub Releases**
- Create a GitHub release with the extension zip
- Users download from GitHub releases page

**Option C: Chrome Web Store** (Future)
- Package and submit to Chrome Web Store
- Users install directly from the store

## 🐛 Troubleshooting

### Common Issues

**❌ API Health Check Fails**
- Verify environment variables are set correctly in Vercel
- Check Supabase URL and API key are valid
- Ensure bucket exists and is public

**❌ Extension Can't Connect to API**
- Update API base URL in `apiService.js`
- Check CORS settings (should be handled automatically)
- Verify Vercel deployment is successful

**❌ File Upload Fails**
- Check file size limits (default 100MB)
- Verify Supabase bucket permissions
- Check browser console for error messages

### Debug Steps

1. **Check API Health**: Visit `/api/health` endpoint
2. **Check Browser Console**: Look for error messages
3. **Check Vercel Logs**: View function logs in Vercel dashboard
4. **Test Direct API**: Use Postman/curl to test upload endpoint

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics for usage tracking
- Monitor API performance and errors
- Track download statistics

### Supabase Monitoring
- Monitor storage usage in Supabase dashboard
- Check API usage and rate limits
- Review database performance

## 🎯 Next Steps

1. **Deploy to Vercel** with your credentials
2. **Test the complete flow** from extension to Supabase
3. **Share your Vercel URL** for extension distribution
4. **Monitor usage** and performance
5. **Consider Chrome Web Store** submission for wider distribution

## 🔗 Your URLs

After deployment, you'll have:
- **Vercel App**: `https://your-app-name.vercel.app`
- **API Health**: `https://your-app-name.vercel.app/api/health`
- **Extension Download**: `https://your-app-name.vercel.app` (landing page)
- **GitHub Repo**: `https://github.com/haarmanh/easyshare`

Your EasyShare application is now ready for production! 🎉
