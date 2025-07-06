# 🚀 Quick Supabase Setup for EasyShare

## Issue Fixed
The extension was using a test service that generates fake `example.com` URLs. Now it defaults to Supabase for real file sharing.

## 🔧 Quick Setup (5 minutes)

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up with GitHub/Google (free)

### Step 2: Create Project
1. Click "New Project"
2. Choose organization (or create one)
3. Enter project name: `easyshare-storage`
4. Enter database password (save this!)
5. Choose region (closest to you)
6. Click "Create new project"

### Step 3: Get Configuration
1. Wait for project to be ready (2-3 minutes)
2. Go to **Settings** → **API**
3. Copy these values:
   - **Project URL** (looks like: `https://abc123.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### Step 4: Create Storage Bucket
1. Go to **Storage** in left sidebar
2. Click "Create a new bucket"
3. Bucket name: `uploads`
4. **Make it PUBLIC** ✅ (important!)
5. Click "Create bucket"

### Step 5: Configure EasyShare
1. Open EasyShare extension
2. Click **Settings** (⚙️ icon)
3. Enter your **Supabase URL**
4. Enter your **Anon Key**
5. Bucket name: `uploads` (should be pre-filled)
6. Click **"Save Supabase Configuration"**

## ✅ Test Upload
1. Try uploading a file
2. Should get real download link
3. Link should work when shared!

## 🔒 Security Notes
- **Public bucket** = anyone with link can download
- **Files auto-expire** after 1 hour (configurable)
- **No personal data** stored in filenames
- **Anonymous uploads** - no user tracking

## 💰 Pricing
- **Free tier**: 1GB storage, 2GB bandwidth/month
- **Perfect for personal use**
- **Upgrade available** if needed

## 🆘 Troubleshooting

### "Supabase configuration missing"
- Make sure you entered both URL and Anon Key
- Check for typos in the configuration
- Reload extension after saving settings

### "Bucket not found"
- Make sure bucket name is exactly `uploads`
- Ensure bucket is created and PUBLIC
- Check bucket permissions in Supabase dashboard

### "Unauthorized" error
- Double-check your Anon Key
- Make sure bucket is PUBLIC
- Try regenerating the Anon Key

## 🎯 Alternative: Keep Using Test Service

If you want to keep testing without real uploads:

1. Open EasyShare Settings
2. Change service to "Test Service" 
3. Test uploads will show fake links (for UI testing only)

But for **real file sharing**, Supabase is required!

---

**Ready to share real files!** 🎉

After setup, your EasyShare extension will create real, shareable download links that work anywhere!
