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
  - Added GIN index on `cue_sheet` column for efficient JSONB queries
  
  ## Security
  - Existing RLS policies automatically cover the new column
  - Users can only access cue sheets for their own projects
*/

-- Add cue_sheet column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'cue_sheet'
  ) THEN
    ALTER TABLE projects ADD COLUMN cue_sheet jsonb;
  END IF;
END $$;

-- Add GIN index for efficient JSONB queries on cue_sheet column
CREATE INDEX IF NOT EXISTS idx_projects_cue_sheet ON projects USING GIN (cue_sheet) WHERE cue_sheet IS NOT NULL;