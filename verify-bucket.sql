-- Verify bucket setup and permissions
-- Run this to check if everything is configured correctly

-- Check if bucket exists and is public
SELECT 
    'Bucket verification' as check_type,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets 
WHERE id = 'uploads';

-- Check bucket permissions (this might show permission issues)
SELECT 
    'Bucket permissions check' as check_type,
    bucket_id,
    COUNT(*) as object_count
FROM storage.objects 
WHERE bucket_id = 'uploads'
GROUP BY bucket_id;

-- List all buckets to see what's available
SELECT 
    'All buckets' as check_type,
    id,
    name,
    public
FROM storage.buckets
ORDER BY created_at;
