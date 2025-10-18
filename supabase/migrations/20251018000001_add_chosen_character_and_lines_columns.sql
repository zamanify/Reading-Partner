/*
  # Add chosen_character and lines columns to projects table

  1. Changes
    - Add `chosen_character` (text, optional) column to store the character the user chose to play
    - Add `lines` (jsonb, optional) column to store parsed dialogue lines from the script
    - Add index on chosen_character for query optimization
    - Add GIN index on lines for efficient JSONB querying

  2. Security
    - Existing RLS policies automatically apply to new columns
    - Users can only access their own project data

  3. Notes
    - chosen_character stores the name of the character the user will play (marked as "ME")
    - lines stores an array of DialogueLine objects with structure:
      {lineId, order, character, text}
*/

-- Add chosen_character column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'chosen_character'
  ) THEN
    ALTER TABLE projects ADD COLUMN chosen_character text;
  END IF;
END $$;

-- Add lines column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'lines'
  ) THEN
    ALTER TABLE projects ADD COLUMN lines jsonb;
  END IF;
END $$;

-- Create index on chosen_character for faster filtering
CREATE INDEX IF NOT EXISTS idx_projects_chosen_character ON projects(chosen_character) WHERE chosen_character IS NOT NULL;

-- Create GIN index on lines for efficient JSONB querying
CREATE INDEX IF NOT EXISTS idx_projects_lines ON projects USING GIN (lines) WHERE lines IS NOT NULL;
