/**
 * Vercel API route for extension configuration
 * Returns safe configuration values for the Chrome extension
 */

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
    // Return safe configuration values (no sensitive data)
    const config = {
      version: process.env.EXTENSION_VERSION || '4.0.0',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600, // 100MB
      maxHistoryItems: parseInt(process.env.MAX_HISTORY_ITEMS) || 50,
      linkExpiration: parseInt(process.env.SUPABASE_LINK_EXPIRATION) || 3600,
      allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || '*').split(','),
      uploadTimeout: parseInt(process.env.UPLOAD_TIMEOUT) || 300000,
      features: {
        showNotifications: process.env.SHOW_NOTIFICATIONS !== 'false',
        autoCopyToClipboard: process.env.AUTO_COPY_TO_CLIPBOARD !== 'false',
        keepUploadHistory: process.env.KEEP_UPLOAD_HISTORY !== 'false',
        debugMode: process.env.DEBUG_MODE === 'true'
      },
      services: {
        primary: 'vercel-api', // Always use Vercel API as primary
        fallback: {
          fileio: process.env.FILEIO_API_URL || 'https://file.io',
          zeroxzero: process.env.ZEROXZERO_API_URL || 'https://0x0.st'
        }
      },
      api: {
        baseUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
        endpoints: {
          upload: '/api/upload',
          health: '/api/health',
          config: '/api/config'
        }
      }
    };

    return res.status(200).json(config);

  } catch (error) {
    console.error('❌ Config API error:', error);
    return res.status(500).json({ 
      error: `Configuration error: ${error.message}` 
    });
  }
}
