/**
 * Vercel API route for health checks and configuration validation
 * Tests Supabase connectivity and returns service status
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || 'uploads';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const status = {
      service: 'EasyShare API',
      timestamp: new Date().toISOString(),
      version: process.env.EXTENSION_VERSION || '4.0.0',
      supabase: {
        configured: !!(supabaseUrl && supabaseKey),
        url: supabaseUrl ? supabaseUrl.replace(/\/+$/, '') : null,
        bucket: bucketName,
        connected: false
      }
    };

    // Test Supabase connection if configured
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Test connection by listing buckets
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
          status.supabase.error = error.message;
        } else {
          status.supabase.connected = true;
          status.supabase.bucketsFound = data?.length || 0;
          
          // Check if our specific bucket exists (check both id and name)
          const bucketExists = data?.some(bucket => bucket.id === bucketName || bucket.name === bucketName);
          status.supabase.bucketExists = bucketExists;

          if (!bucketExists) {
            status.supabase.warning = `Bucket '${bucketName}' not found. Available buckets: ${data?.map(b => `${b.id} (${b.name})`).join(', ') || 'none'}`;
          }
        }
      } catch (error) {
        status.supabase.error = error.message;
      }
    }

    // Determine overall health status
    const isHealthy = status.supabase.configured && status.supabase.connected && status.supabase.bucketExists;
    
    return res.status(isHealthy ? 200 : 503).json({
      healthy: isHealthy,
      ...status
    });

  } catch (error) {
    console.error('❌ Health check error:', error);
    return res.status(500).json({ 
      healthy: false,
      error: `Health check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}
