/**
 * Test upload endpoint to debug the 401 error
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || 'uploads';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test 1: Try to list files in bucket
    console.log('🔍 Testing bucket access...');
    const { data: listData, error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });
    
    const testResults = {
      timestamp: new Date().toISOString(),
      supabaseConfig: {
        url: supabaseUrl,
        bucket: bucketName,
        keyConfigured: !!supabaseKey
      },
      tests: {}
    };

    // Test 1 Results
    testResults.tests.listFiles = {
      success: !listError,
      error: listError?.message,
      data: listData
    };

    // Test 2: Try to upload a tiny test file
    if (req.method === 'POST') {
      console.log('📤 Testing file upload...');
      const testContent = 'test-file-content';
      const testFileName = `test-${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(testFileName, testContent, {
          contentType: 'text/plain',
          cacheControl: '3600',
          upsert: false
        });

      testResults.tests.uploadFile = {
        success: !uploadError,
        error: uploadError?.message,
        errorDetails: uploadError,
        data: uploadData,
        fileName: testFileName
      };

      // Test 3: If upload succeeded, try to create signed URL
      if (!uploadError && uploadData) {
        console.log('🔗 Testing signed URL creation...');
        const { data: urlData, error: urlError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(uploadData.path, 3600);

        testResults.tests.createSignedUrl = {
          success: !urlError,
          error: urlError?.message,
          data: urlData
        };

        // Clean up test file
        await supabase.storage
          .from(bucketName)
          .remove([uploadData.path]);
      }
    }

    return res.status(200).json(testResults);

  } catch (error) {
    console.error('❌ Test error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}
