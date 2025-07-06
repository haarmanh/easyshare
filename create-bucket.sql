-- EasyShare Supabase Storage Setup
-- This script sets up the uploads bucket and policies automatically
-- Run this in your Supabase SQL Editor

-- Step 1: Create or update the uploads bucket using direct INSERT
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id)
DO UPDATE SET public = true;

-- Step 2: Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies to avoid conflicts (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable read for all users" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "uploads_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "uploads_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "uploads_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "uploads_delete_policy" ON storage.objects;

-- Step 4: Create upload policy (INSERT)
CREATE POLICY "uploads_insert_policy" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'uploads');

-- Step 5: Create download policy (SELECT)
CREATE POLICY "uploads_select_policy" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'uploads');

-- Step 6: Create update policy (UPDATE) - for file metadata
CREATE POLICY "uploads_update_policy" ON storage.objects
FOR UPDATE TO public
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- Step 7: Create delete policy (DELETE) - optional, for cleanup
CREATE POLICY "uploads_delete_policy" ON storage.objects
FOR DELETE TO public
USING (bucket_id = 'uploads');

-- Step 8: Verify the setup
SELECT
    'Bucket created/updated successfully' as status,
    id,
    name,
    public,
    created_at
FROM storage.buckets
WHERE id = 'uploads';

-- Step 9: Show created policies
SELECT
    'Policies created successfully' as status,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%uploads%';
