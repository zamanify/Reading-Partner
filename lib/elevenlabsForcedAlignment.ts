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
    const urlParts = audioFileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName || !fileName.includes('project-')) {
      throw new Error('Invalid audio file URL format');
    }

    const { data, error } = await supabase.storage
      .from('audio_files')
      .download(fileName);

    if (error) {
      throw new Error(`Failed to download audio file: ${error.message}`);
    }

    if (!data || data.size === 0) {
      throw new Error('Downloaded audio file is empty');
    }

    console.log('Downloaded audio file:', fileName, 'Size:', data.size);
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
    console.log('Preparing FormData with audio blob size:', audioBlob.size, 'and text length:', transcriptText.length);

    const formData = new FormData();

    const file = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' });
    formData.append('file', file);
    formData.append('text', transcriptText);

    console.log('Sending request to Forced Alignment API...');

    const response = await fetch(FORCED_ALIGNMENT_API_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
      },
      body: formData,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const alignmentData = await response.json();

    console.log('=== FORCED ALIGNMENT API RESPONSE ===');
    console.log(JSON.stringify(alignmentData, null, 2));
    console.log('=== END OF RESPONSE ===');

    if (!alignmentData.characters || !alignmentData.words) {
      throw new Error('Invalid response format from Forced Alignment API');
    }

    console.log('Successfully received alignment data with', alignmentData.characters.length, 'characters and', alignmentData.words.length, 'words');
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
    console.log('Starting cue sheet generation for audio URL:', audioFileUrl);

    if (!lines || lines.length === 0) {
      throw new Error('No dialogue lines provided');
    }

    console.log('Extracting transcript text from', lines.length, 'dialogue lines');
    const transcriptText = extractTranscriptText(lines);

    if (!transcriptText || transcriptText.trim().length === 0) {
      throw new Error('Empty transcript text');
    }

    console.log('Transcript text preview:', transcriptText.substring(0, 100) + '...');

    console.log('Downloading audio file...');
    const audioBlob = await downloadAudioFile(audioFileUrl);

    console.log('Calling Forced Alignment API...');
    const alignmentData = await callForcedAlignmentAPI(audioBlob, transcriptText);

    console.log('Cue sheet generation completed successfully');
    return alignmentData;
  } catch (error: any) {
    console.error('Error generating cue sheet:', error);
    throw new Error(error.message || 'Failed to generate cue sheet');
  }
}
