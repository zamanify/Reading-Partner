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

    console.log('[downloadAudioFile] Downloading file:', fileName);

    const { data, error } = await supabase.storage
      .from('audio_files')
      .download(fileName);

    if (error) {
      throw new Error(`Failed to download audio file: ${error.message}`);
    }

    if (!data) {
      throw new Error('Downloaded file is null or undefined');
    }

    console.log('[downloadAudioFile] Downloaded blob - size:', data.size, 'type:', data.type);

    if (data.size === 0) {
      throw new Error('Downloaded file is empty (0 bytes)');
    }

    if (!data.type || data.type === '') {
      console.log('[downloadAudioFile] Blob has no MIME type, creating new blob with audio/mpeg type');
      return new Blob([data], { type: 'audio/mpeg' });
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
    console.log('[callForcedAlignmentAPI] Creating FormData with blob - size:', audioBlob.size, 'type:', audioBlob.type);
    console.log('[callForcedAlignmentAPI] Transcript text length:', transcriptText.length);

    const audioBlobWithType = new Blob([audioBlob], { type: 'audio/mpeg' });

    console.log('[callForcedAlignmentAPI] New blob with explicit type - size:', audioBlobWithType.size, 'type:', audioBlobWithType.type);

    const formData = new FormData();
    formData.append('file', audioBlobWithType, 'audio.mp3');
    formData.append('text', transcriptText);

    console.log('[callForcedAlignmentAPI] Sending request to ElevenLabs API');

    const response = await fetch(FORCED_ALIGNMENT_API_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
      },
      body: formData,
    });

    console.log('[callForcedAlignmentAPI] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[callForcedAlignmentAPI] API error response:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const alignmentData = await response.json();
    console.log('[callForcedAlignmentAPI] Successfully received alignment data');

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
