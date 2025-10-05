// This file has been replaced by lib/supabaseDatabase.ts
// All database operations now use Supabase instead of SQLite
// This file is kept only to prevent import errors during migration
// You can safely delete this file after verifying all imports have been updated

export interface Project {
  id: string;
  user_id: string;
  name: string;
  script?: string;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  is_counter_reader: boolean;
  created_at: string;
  updated_at: string;
}

// Deprecated: Use supabaseDatabaseManager from lib/supabaseDatabase.ts instead
export const databaseManager = {
  initializeDatabase: () => {
    throw new Error('SQLite has been removed. Use supabaseDatabaseManager from lib/supabaseDatabase.ts');
  },
  createProject: () => {
    throw new Error('SQLite has been removed. Use supabaseDatabaseManager from lib/supabaseDatabase.ts');
  },
  getProjects: () => {
    throw new Error('SQLite has been removed. Use supabaseDatabaseManager from lib/supabaseDatabase.ts');
  },
  getProjectById: () => {
    throw new Error('SQLite has been removed. Use supabaseDatabaseManager from lib/supabaseDatabase.ts');
  },
  updateProject: () => {
    throw new Error('SQLite has been removed. Use supabaseDatabaseManager from lib/supabaseDatabase.ts');
  },
  updateProjectScript: () => {
    throw new Error('SQLite has been removed. Use supabaseDatabaseManager from lib/supabaseDatabase.ts');
  },
  deleteProject: () => {
    throw new Error('SQLite has been removed. Use supabaseDatabaseManager from lib/supabaseDatabase.ts');
  },
  createCharacter: () => {
    throw new Error('SQLite has been removed. Use supabaseDatabaseManager from lib/supabaseDatabase.ts');
  },
  getCharactersByProject: () => {
    throw new Error('SQLite has been removed. Use supabaseDatabaseManager from lib/supabaseDatabase.ts');
  },
  updateCharacterCounterReader: () => {
    throw new Error('SQLite has been removed. Use supabaseDatabaseManager from lib/supabaseDatabase.ts');
  },
  deleteCharactersByProject: () => {
    throw new Error('SQLite has been removed. Use supabaseDatabaseManager from lib/supabaseDatabase.ts');
  },
};
