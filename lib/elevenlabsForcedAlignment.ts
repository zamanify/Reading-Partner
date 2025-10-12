import { supabase } from './supabase';
import { DialogueLine } from './openaiOCR';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
const FORCED_ALIGNMENT_API_URL = 'https://api.elevenlabs.io/v1/forced-alignment';

interface CharacterTiming {
  text: string;
  start: number;
  end: number;
}

interface WordTiming {
  text: string;
  start: number;
  end: number;
  loss: number;
}

export interface ForcedAlignmentResponse {
  characters: CharacterTiming[];
  words: WordTiming[];
  loss: number;
}

function extractTranscriptText(lines: DialogueLine[]): string {
  const sortedLines = [...lines].sort((a, b) => a.order - b.order);
  return sortedLines.map(line => line.text).join(' ');
}

async function downloadAudioFile(audioFileUrl: string): Promise<Blob> {
  try {
    const fileName = audioFileUrl.split('/').pop();
    if (!fileName) {
      throw new Error('Invalid audio file URL');
    }

    const { data, error } = await supabase.storage
      .from('audio_files')
      .download(fileName);

    if (error) {
      throw new Error(`Failed to download audio file: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('Error downloading audio file:', error);
    throw new Error(error.message || 'Failed to download audio file');
  }
}

async function callForcedAlignmentAPI(
  audioBlob: Blob,
  transcriptText: string
): Promise<ForcedAlignmentResponse> {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');
    formData.append('text', transcriptText);

    const response = await fetch(FORCED_ALIGNMENT_API_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const alignmentData = await response.json();

    if (!alignmentData.characters || !alignmentData.words) {
      throw new Error('Invalid response format from Forced Alignment API');
    }

    return alignmentData as ForcedAlignmentResponse;
  } catch (error: any) {
    console.error('Error calling Forced Alignment API:', error);
    throw new Error(error.message || 'Failed to call Forced Alignment API');
  }
}

export async function generateCueSheet(
  audioFileUrl: string,
  lines: DialogueLine[]
): Promise<ForcedAlignmentResponse> {
  try {
    if (!lines || lines.length === 0) {
      throw new Error('No dialogue lines provided');
    }

    const transcriptText = extractTranscriptText(lines);

    if (!transcriptText || transcriptText.trim().length === 0) {
      throw new Error('Empty transcript text');
    }

    const audioBlob = await downloadAudioFile(audioFileUrl);

    const alignmentData = await callForcedAlignmentAPI(audioBlob, transcriptText);

    return alignmentData;
  } catch (error: any) {
    console.error('Error generating cue sheet:', error);
    throw new Error(error.message || 'Failed to generate cue sheet');
  }
}
