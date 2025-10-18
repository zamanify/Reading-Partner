import { supabase } from './supabase';
import { DialogueLine } from './openaiOCR';
import { generateDialogueAudio } from './elevenlabsTextToDialogue';
import { generateForcedAlignment, ForcedAlignmentResponse } from './elevenlabsForcedAlignment';
import { Alert } from 'react-native';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  script?: string;
  lines?: DialogueLine[];
  audio_file?: string;
  forced_alignment?: ForcedAlignmentResponse;
  chosen_character?: string;
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

    if (lines && lines.length > 0) {
      try {
        const audioFileUrl = await generateDialogueAudio(id, lines);
        await this.updateProjectAudioFile(id, audioFileUrl);

        try {
          const cueSheet = await generateCueSheet(audioFileUrl, lines);
          await this.updateProjectCueSheet(id, cueSheet);
        } catch (cueSheetError: any) {
          console.error('Failed to generate cue sheet:', cueSheetError);
          Alert.alert(
            'Cue Sheet Generation Failed',
            'The audio was saved, but cue sheet generation failed. You can try again later.'
          );
        }
      } catch (audioError: any) {
        console.error('Failed to generate audio:', audioError);
        Alert.alert(
          'Audio Generation Failed',
          'The script was saved, but audio generation failed. You can try again later.'
        );
      }
    }
  }

  async updateProjectAudioFile(id: string, audioFileUrl: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('projects')
      .update({
        audio_file: audioFileUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update project audio file:', error);
      throw error;
    }
  }

  async updateProjectCueSheet(id: string, cueSheet: ForcedAlignmentResponse): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('projects')
      .update({
        forced_alignment: cueSheet,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update project cue sheet:', error);
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

  async updateProjectChosenCharacter(id: string, chosenCharacter: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('projects')
      .update({
        chosen_character: chosenCharacter,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update chosen character:', error);
      throw error;
    }
  }
}

export const supabaseDatabaseManager = new SupabaseDatabaseManager();
