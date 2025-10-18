/*
  # Add forced_alignment column to projects table

  ## Overview
  This migration adds support for storing ElevenLabs Forced Alignment metadata
  as a cue sheet for precise character and word timing information.

  ## Changes
  
  ### Modified Tables
  - `projects`
    - Added `forced_alignment` (jsonb, nullable): Stores the raw JSON response from ElevenLabs Forced Alignment API
      containing character-level and word-level timing data with start/end timestamps
  
  ## Performance
  - Added GIN index on `forced_alignment` column for efficient JSONB queries
  
  ## Security
  - Existing RLS policies automatically cover the new column
  - Users can only access forced aligmnent for their own projects
*/

-- Add forced_alignment column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'forced_alignment'
  ) THEN
    ALTER TABLE projects ADD COLUMN forced_alignment jsonb;
  END IF;
END $$;

-- Add GIN index for efficient JSONB queries on forced_alignment column
CREATE INDEX IF NOT EXISTS idx_projects_forced_alignment ON projects USING GIN (forced_alignment) WHERE forced_alignment IS NOT NULL;