/*
  # Create Audio Files Storage Bucket and Policies

  1. Storage Setup
    - Create `audio_files` bucket for storing generated audio files
    - Set bucket to public for public URL access
    
  2. Security Policies
    - Enable RLS on the bucket
    - Add policy for authenticated users to upload (INSERT) files
    - Add policy for public to read (SELECT) files
    
  3. Notes
    - Bucket is public to allow getPublicUrl() to work
    - INSERT policy requires authentication to prevent abuse
    - SELECT policy allows anyone to download/stream audio files
*/

-- Create the audio_files bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio_files',
  'audio_files',
  true,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects for the bucket
CREATE POLICY "Authenticated users can upload audio files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio_files');

CREATE POLICY "Public can read audio files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'audio_files');

CREATE POLICY "Authenticated users can update their audio files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'audio_files')
WITH CHECK (bucket_id = 'audio_files');

CREATE POLICY "Authenticated users can delete their audio files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'audio_files');
