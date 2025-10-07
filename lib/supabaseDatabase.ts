import { supabase } from './supabase';
import { DialogueLine } from './openaiOCR';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  script?: string;
  lines?: DialogueLine[];
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

  async updateProjectScript(id: string, script: string, lines?: DialogueLine[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData: any = {
      script,
      updated_at: new Date().toISOString()
    };

    if (lines !== undefined) {
      updateData.lines = lines;
    }

    const { error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update project script:', error);
      throw error;
    }
  }

  async updateProjectScriptAndLines(id: string, script: string, lines: DialogueLine[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('projects')
      .update({
        script,
        lines,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update project script and lines:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

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
