/**
 * Vercel API route for file uploads to Supabase
 * Handles file upload operations and returns signed URLs
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || 'uploads';
const linkExpiration = parseInt(process.env.SUPABASE_LINK_EXPIRATION) || 3600;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        error: 'Supabase not configured on server' 
      });
    }

    // Parse the request body
    const { fileName, fileData, fileType } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ 
        error: 'Missing required fields: fileName and fileData' 
      });
    }

    // Convert base64 data to buffer
    const buffer = Buffer.from(fileData, 'base64');

    // Create unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}-${randomId}.${fileExtension}`;
    const filePath = `uploads/${uniqueFileName}`;

    console.log('📤 Uploading file to Supabase:', filePath);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: fileType || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      return res.status(500).json({ 
        error: `Upload failed: ${error.message}` 
      });
    }

    console.log('✅ File uploaded to Supabase:', data.path);

    // Create signed URL for download
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(data.path, linkExpiration);

    if (urlError) {
      console.error('❌ Failed to create signed URL:', urlError);
      return res.status(500).json({ 
        error: `Failed to create download link: ${urlError.message}` 
      });
    }

    const downloadUrl = signedUrlData.signedUrl;
    console.log('✅ Signed URL created:', downloadUrl);

    // Return success response
    return res.status(200).json({
      success: true,
      link: downloadUrl,
      fileName: uniqueFileName,
      originalName: fileName,
      expiresIn: linkExpiration,
      message: 'File uploaded successfully!'
    });

  } catch (error) {
    console.error('❌ Upload API error:', error);
    return res.status(500).json({ 
      error: `Server error: ${error.message}` 
    });
  }
}
