import { supabase } from './supabase';
import { DialogueLine } from './openaiOCR';
import * as FileSystem from 'expo-file-system/legacy';

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

interface AudioFileResult {
  blob: Blob;
  fileUri: string;
}

async function downloadAudioFile(audioFileUrl: string): Promise<AudioFileResult> {
  try {
    console.log('[ALIGNMENT] ===== DOWNLOADING AUDIO FILE =====');
    console.log('[ALIGNMENT] Audio file URL:', audioFileUrl);

    const fileName = audioFileUrl.split('/').pop();
    if (!fileName) {
      console.error('[ALIGNMENT] ERROR: Invalid audio file URL - cannot extract filename');
      throw new Error('Invalid audio file URL');
    }

    console.log('[ALIGNMENT] Extracted filename:', fileName);
    console.log('[ALIGNMENT] Downloading from Supabase bucket: audio_files');

    const { data, error } = await supabase.storage
      .from('audio_files')
      .download(fileName);

    if (error) {
      console.error('[ALIGNMENT] ERROR: Supabase download failed:', error.message);
      throw new Error(`Failed to download audio file: ${error.message}`);
    }

    if (!data) {
      console.error('[ALIGNMENT] ERROR: Downloaded data is null or undefined');
      throw new Error('Downloaded file is null or undefined');
    }

    console.log('[ALIGNMENT] ✓ Download successful');
    console.log('[ALIGNMENT] Blob size:', data.size, 'bytes');
    console.log('[ALIGNMENT] Blob type:', data.type || '(empty/missing)');

    if (data.size === 0) {
      console.error('[ALIGNMENT] ERROR: Downloaded file is empty (0 bytes)');
      throw new Error('Downloaded file is empty (0 bytes)');
    }

    console.log('[ALIGNMENT] Saving blob to local filesystem...');
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    const reader = new FileReader();
    const base64Data = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(data);
    });

    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('[ALIGNMENT] ✓ File saved to:', fileUri);

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      console.log('[ALIGNMENT] ✓ File verified - size:', fileInfo.size, 'bytes');
    }

    return { blob: data, fileUri };
  } catch (error: any) {
    console.error('[ALIGNMENT] ERROR in downloadAudioFile:', error);
    throw new Error(error.message || 'Failed to download audio file');
  }
}

async function callForcedAlignmentAPI(
  fileUri: string,
  transcriptText: string
): Promise<ForcedAlignmentResponse> {
  try {
    console.log('[ALIGNMENT] ===== CALLING ELEVENLABS API =====');
    console.log('[ALIGNMENT] File URI:', fileUri);
    console.log('[ALIGNMENT] Transcript text length:', transcriptText.length, 'characters');
    console.log('[ALIGNMENT] Transcript preview:', transcriptText.substring(0, 100) + '...');

    console.log('[ALIGNMENT] Building FormData with React Native format...');
    const formData = new FormData();

    formData.append('file', {
      uri: fileUri,
      type: 'audio/mpeg',
      name: 'audio.mp3',
    } as any);
    formData.append('text', transcriptText);
    console.log('[ALIGNMENT] ✓ FormData created with file URI and text');

    console.log('[ALIGNMENT] API URL:', FORCED_ALIGNMENT_API_URL);
    console.log('[ALIGNMENT] Sending POST request to ElevenLabs...');

    const response = await fetch(FORCED_ALIGNMENT_API_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
      },
      body: formData,
    });

    console.log('[ALIGNMENT] ✓ Response received');
    console.log('[ALIGNMENT] Response status:', response.status, response.statusText);
    console.log('[ALIGNMENT] Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ALIGNMENT] ❌ API ERROR RESPONSE:', errorText);
      console.error('[ALIGNMENT] Status code:', response.status);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    console.log('[ALIGNMENT] Parsing response JSON...');
    const alignmentData = await response.json();
    console.log('[ALIGNMENT] ✓ Response parsed successfully');
    console.log('[ALIGNMENT] Characters count:', alignmentData.characters?.length || 0);
    console.log('[ALIGNMENT] Words count:', alignmentData.words?.length || 0);
    console.log('[ALIGNMENT] Loss value:', alignmentData.loss);

    if (!alignmentData.characters || !alignmentData.words) {
      console.error('[ALIGNMENT] ERROR: Invalid response format - missing characters or words');
      throw new Error('Invalid response format from Forced Alignment API');
    }

    console.log('[ALIGNMENT] ===== ALIGNMENT SUCCESSFUL =====');
    return alignmentData as ForcedAlignmentResponse;
  } catch (error: any) {
    console.error('[ALIGNMENT] ❌ ERROR in callForcedAlignmentAPI:', error);
    console.error('[ALIGNMENT] Error name:', error.name);
    console.error('[ALIGNMENT] Error message:', error.message);
    console.error('[ALIGNMENT] Error stack:', error.stack);
    throw new Error(error.message || 'Failed to call Forced Alignment API');
  }
}

export async function generate
  (
  audioFileUrl: string,
  lines: DialogueLine[]
): Promise<ForcedAlignmentResponse> {
  let tempFileUri: string | null = null;

  try {
    console.log('[ALIGNMENT] ========================================');
    console.log('[ALIGNMENT] STARTING CUE SHEET GENERATION');
    console.log('[ALIGNMENT] ========================================');
    console.log('[ALIGNMENT] Audio file URL:', audioFileUrl);
    console.log('[ALIGNMENT] Number of dialogue lines:', lines.length);

    if (!lines || lines.length === 0) {
      console.error('[ALIGNMENT] ERROR: No dialogue lines provided');
      throw new Error('No dialogue lines provided');
    }

    console.log('[ALIGNMENT] Extracting transcript text from lines...');
    const transcriptText = extractTranscriptText(lines);
    console.log('[ALIGNMENT] ✓ Transcript extracted');
    console.log('[ALIGNMENT] Transcript length:', transcriptText.length, 'characters');
    console.log('[ALIGNMENT] Transcript preview:', transcriptText.substring(0, 150) + '...');

    if (!transcriptText || transcriptText.trim().length === 0) {
      console.error('[ALIGNMENT] ERROR: Empty transcript text');
      throw new Error('Empty transcript text');
    }

    console.log('[ALIGNMENT] Step 1/2: Downloading audio file...');
    const { fileUri } = await downloadAudioFile(audioFileUrl);
    tempFileUri = fileUri;
    console.log('[ALIGNMENT] ✓ Audio file downloaded and saved to filesystem');

    console.log('[ALIGNMENT] Step 2/2: Calling Forced Alignment API...');
    const alignmentData = await callForcedAlignmentAPI(fileUri, transcriptText);
    console.log('[ALIGNMENT] ✓ Alignment data received successfully');

    console.log('[ALIGNMENT] Cleaning up temporary file...');
    await FileSystem.deleteAsync(tempFileUri, { idempotent: true });
    console.log('[ALIGNMENT] ✓ Temporary file deleted');
    tempFileUri = null;

    console.log('[ALIGNMENT] ========================================');
    console.log('[ALIGNMENT] CUE SHEET GENERATION COMPLETED');
    console.log('[ALIGNMENT] ========================================');

    return alignmentData;
  } catch (error: any) {
    console.error('[ALIGNMENT] ❌❌❌ FATAL ERROR in generateCueSheet ❌❌❌');
    console.error('[ALIGNMENT] Error type:', error.name);
    console.error('[ALIGNMENT] Error message:', error.message);
    console.error('[ALIGNMENT] Full error:', error);

    if (tempFileUri) {
      console.log('[ALIGNMENT] Cleaning up temporary file after error...');
      try {
        await FileSystem.deleteAsync(tempFileUri, { idempotent: true });
        console.log('[ALIGNMENT] ✓ Temporary file deleted');
      } catch (cleanupError) {
        console.error('[ALIGNMENT] Failed to delete temporary file:', cleanupError);
      }
    }

    throw new Error(error.message || 'Failed to generate cue sheet');
  }
}
