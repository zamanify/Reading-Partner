/*
  # Add audio_file column to projects table

  ## Overview
  This migration adds support for storing audio file references generated from dialogue lines
  using the ElevenLabs text-to-dialogue API.

  ## Changes
  
  ### Modified Tables
  - `projects`
    - Added `audio_file` (text, nullable): Stores the Supabase storage path or URL to the generated audio file
  
  ## Performance
  - Added index on `audio_file` column for optimized queries when filtering by audio availability
  
  ## Security
  - Existing RLS policies automatically cover the new column
  - Users can only access audio files for their own projects
*/

-- Add audio_file column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'audio_file'
  ) THEN
    ALTER TABLE projects ADD COLUMN audio_file text;
  END IF;
END $$;

-- Add index for audio_file column
CREATE INDEX IF NOT EXISTS idx_projects_audio_file ON projects(audio_file) WHERE audio_file IS NOT NULL;
