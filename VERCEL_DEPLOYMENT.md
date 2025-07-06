# 🚀 Vercel Deployment Guide for EasyShare

This guide explains how to deploy EasyShare to Vercel for web distribution while maintaining the browser extension functionality.

## 📋 What Gets Deployed

When you deploy to Vercel, you get:

1. **📱 Web Landing Page** - A beautiful landing page showcasing the extension
2. **📦 Extension Download** - Direct download link for the browser extension
3. **📚 Documentation** - Installation and setup instructions
4. **🔗 GitHub Integration** - Links to the source code

**Note:** The actual file sharing functionality requires the browser extension to be installed locally.

## 🔧 Vercel Setup

### 1. Environment Variables in Vercel

Set these environment variables in your Vercel dashboard:

#### Required Variables:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_BUCKET_NAME=uploads
```

#### Optional Variables:
```
DEFAULT_SERVICE=supabase
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

### 2. How to Set Environment Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with its value
5. Set the environment to **Production** (or All)

### 3. Alternative: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_BUCKET_NAME

# Deploy
vercel --prod
```

## 🏗️ Build Process

The build process creates two outputs:

### 1. Browser Extension (`dist/` folder)
- Contains the actual browser extension files
- Uses environment variables injected at build time
- Ready for Chrome extension installation

### 2. Web Version (`public/` folder)
- Contains a landing page for the extension
- Includes a downloadable zip of the extension
- Provides installation instructions

## 📁 Project Structure After Build

```
easyshare/
├── dist/                   # Browser extension files
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── background.js
│   └── ...
├── public/                 # Vercel deployment files
│   ├── index.html         # Landing page
│   ├── dist.zip           # Downloadable extension
│   ├── manifest.json      # Extension manifest
│   ├── popup.html         # Extension popup
│   └── ...
└── vercel.json            # Vercel configuration
```

## 🔄 Deployment Workflow

### Automatic Deployment (Recommended)

1. **Push to GitHub** - Any push to main branch triggers deployment
2. **Vercel builds** - Runs `npm run build` automatically
3. **Environment variables** - Injected from Vercel settings
4. **Deploy** - Live at your Vercel URL

### Manual Deployment

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

## 🌐 What Users See

When users visit your Vercel URL, they see:

1. **Hero Section** - Extension overview and features
2. **Download Button** - Direct download of the extension zip
3. **Installation Guide** - Step-by-step setup instructions
4. **Configuration Help** - Supabase setup guidance
5. **GitHub Link** - Link to the source code

## 🔒 Security Considerations

### Environment Variables
- Supabase anon keys are safe for client-side use
- They're protected by Row Level Security (RLS)
- Never expose service role keys

### CORS and Permissions
- The extension handles CORS through browser permissions
- Web version is for distribution only, not file uploads

## 🐛 Troubleshooting

### Build Fails on Vercel
```
Error: No Output Directory named "public" found
```
**Solution:** Make sure `vercel.json` is configured correctly and the build script creates the `public` directory.

### Environment Variables Not Working
```
⚠️ No .env file found, using defaults
```
**Solution:** Set environment variables in Vercel dashboard, not in `.env` file.

### Extension Download Not Working
**Solution:** Check that the build process creates `public/dist.zip` successfully.

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics to track downloads
- Monitor which features users are most interested in

### GitHub Insights
- Track repository stars and forks
- Monitor issues and feature requests

## 🚀 Advanced Configuration

### Custom Domain
1. Add your domain in Vercel dashboard
2. Configure DNS records
3. SSL is handled automatically

### Multiple Environments
- **Production:** `main` branch → production deployment
- **Preview:** Feature branches → preview deployments
- **Development:** Local development with `.env` file

## 📞 Support

If deployment fails:

1. **Check Vercel logs** in the dashboard
2. **Verify environment variables** are set correctly
3. **Test build locally** with `npm run build`
4. **Check GitHub integration** is working

## 🎯 Next Steps

After successful deployment:

1. **Share the Vercel URL** for extension distribution
2. **Monitor download analytics** 
3. **Collect user feedback** through GitHub issues
4. **Update documentation** as needed

Your EasyShare extension is now available for download at your Vercel URL! 🎉
