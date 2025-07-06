-- EasyShare Supabase Storage Setup (Simple Version)
-- This script works with standard user permissions
-- Run this in your Supabase SQL Editor

-- Step 1: Create or update the uploads bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) 
DO UPDATE SET public = true;

-- Step 2: Verify the bucket was created/updated
SELECT 
    'Bucket setup complete' as status,
    id,
    name,
    public,
    created_at
FROM storage.buckets 
WHERE id = 'uploads';
