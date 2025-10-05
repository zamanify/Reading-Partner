import { supabase } from './supabase';

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

class SupabaseDatabaseManager {
  async createProject(name: string): Promise<Project> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create project:', error);
      throw error;
    }

    return data;
  }

  async getProjects(): Promise<Project[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to get projects:', error);
      throw error;
    }

    return data || [];
  }

  async getProjectById(id: string): Promise<Project | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Failed to get project by id:', error);
      throw error;
    }

    return data;
  }

  async updateProject(id: string, name: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('projects')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  }

  async updateProjectScript(id: string, script: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('projects')
      .update({ script, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update project script:', error);
      throw error;
    }
  }

  async createCharacter(
    projectId: string,
    name: string,
    isCounterReader: boolean = false
  ): Promise<Character> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('characters')
      .insert({
        project_id: projectId,
        user_id: user.id,
        name,
        is_counter_reader: isCounterReader,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create character:', error);
      throw error;
    }

    return data;
  }

  async getCharactersByProject(projectId: string): Promise<Character[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Failed to get characters by project:', error);
      throw error;
    }

    return data || [];
  }

  async updateCharacterCounterReader(
    id: string,
    isCounterReader: boolean
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('characters')
      .update({
        is_counter_reader: isCounterReader,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update character counter reader status:', error);
      throw error;
    }
  }

  async deleteCharactersByProject(projectId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete characters by project:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    await this.deleteCharactersByProject(id);

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }
}

export const supabaseDatabaseManager = new SupabaseDatabaseManager();
