import * as SQLite from 'expo-sqlite';
import { Character } from './scriptParser';

export interface Project {
  id: number;
  name: string;
  script?: string;
  createdAt: string;
  updatedAt: string;
  updatedAt: string;
}

export { Character };

class DatabaseManager {
  private db: SQLite.SQLiteDatabase | null = null;

  async initializeDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('readingpartner.db');
      
      // Create projects table if it doesn't exist
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          script TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        );
      `);
      
      // Create characters table if it doesn't exist
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS characters (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          projectId INTEGER NOT NULL,
          name TEXT NOT NULL,
          isCounterReader INTEGER DEFAULT 0,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE,
          UNIQUE(projectId, name)
        );
      `);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async createProject(name: string): Promise<Project> {
    if (!this.db) {
      await this.initializeDatabase();
    }

    const now = new Date().toISOString();
    
    try {
      const result = await this.db!.runAsync(
        'INSERT INTO projects (name, createdAt, updatedAt) VALUES (?, ?, ?)',
        [name, now, now]
      );

      const newProject: Project = {
        id: result.lastInsertRowId,
        name,
        createdAt: now,
        updatedAt: now,
      };

      return newProject;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  async getProjects(): Promise<Project[]> {
    if (!this.db) {
      await this.initializeDatabase();
    }

    try {
      const result = await this.db!.getAllAsync(
        'SELECT * FROM projects ORDER BY updatedAt DESC'
      );

      return result as Project[];
    } catch (error) {
      console.error('Failed to get projects:', error);
      throw error;
    }
  }

  async getProjectById(id: number): Promise<Project | null> {
    if (!this.db) {
      await this.initializeDatabase();
    }

    try {
      const result = await this.db!.getFirstAsync(
        'SELECT * FROM projects WHERE id = ?',
        [id]
      );

      return result as Project | null;
    } catch (error) {
      console.error('Failed to get project by id:', error);
      throw error;
    }
  }

  async updateProject(id: number, name: string): Promise<void> {
    if (!this.db) {
      await this.initializeDatabase();
    }

    const now = new Date().toISOString();

    try {
      await this.db!.runAsync(
        'UPDATE projects SET name = ?, updatedAt = ? WHERE id = ?',
        [name, now, id]
      );
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  }

  async updateProjectScript(id: number, script: string): Promise<void> {
    if (!this.db) {
      await this.initializeDatabase();
    }

    const now = new Date().toISOString();

    try {
      await this.db!.runAsync(
        'UPDATE projects SET script = ?, updatedAt = ? WHERE id = ?',
        [script, now, id]
      );
    } catch (error) {
      console.error('Failed to update project script:', error);
      throw error;
    }
  }

  async createCharacter(projectId: number, name: string, isCounterReader: boolean = false): Promise<Character> {
    if (!this.db) {
      await this.initializeDatabase();
    }

    const now = new Date().toISOString();
    
    try {
      const result = await this.db!.runAsync(
        'INSERT OR REPLACE INTO characters (projectId, name, isCounterReader, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [projectId, name, isCounterReader ? 1 : 0, now, now]
      );

      const newCharacter: Character = {
        id: result.lastInsertRowId,
        projectId,
        name,
        isCounterReader,
        createdAt: now,
        updatedAt: now,
      };

      return newCharacter;
    } catch (error) {
      console.error('Failed to create character:', error);
      throw error;
    }
  }

  async getCharactersByProject(projectId: number): Promise<Character[]> {
    if (!this.db) {
      await this.initializeDatabase();
    }

    try {
      const result = await this.db!.getAllAsync(
        'SELECT * FROM characters WHERE projectId = ? ORDER BY name ASC',
        [projectId]
      );

      return result.map(row => ({
        ...row,
        isCounterReader: Boolean(row.isCounterReader)
      })) as Character[];
    } catch (error) {
      console.error('Failed to get characters by project:', error);
      throw error;
    }
  }

  async updateCharacterCounterReader(id: number, isCounterReader: boolean): Promise<void> {
    if (!this.db) {
      await this.initializeDatabase();
    }

    const now = new Date().toISOString();

    try {
      await this.db!.runAsync(
        'UPDATE characters SET isCounterReader = ?, updatedAt = ? WHERE id = ?',
        [isCounterReader ? 1 : 0, now, id]
      );
    } catch (error) {
      console.error('Failed to update character counter reader status:', error);
      throw error;
    }
  }

  async deleteCharactersByProject(projectId: number): Promise<void> {
    if (!this.db) {
      await this.initializeDatabase();
    }

    try {
      await this.db!.runAsync('DELETE FROM characters WHERE projectId = ?', [projectId]);
    } catch (error) {
      console.error('Failed to delete characters by project:', error);
      throw error;
    }
  }

  async deleteProject(id: number): Promise<void> {
    if (!this.db) {
      await this.initializeDatabase();
    }

    try {
      await this.db!.runAsync('DELETE FROM projects WHERE id = ?', [id]);
      // Characters will be automatically deleted due to CASCADE
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const databaseManager = new DatabaseManager();