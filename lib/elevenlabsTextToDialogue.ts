import { supabase } from './supabase';
import { DialogueLine } from './openaiOCR';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-dialogue';

const VOICE_ID_FIRST = 'Cz0K1kOv9tD8l0b5Qu53';
const VOICE_ID_SECOND = 'MClEFoImJXBTgLwdLI5n';

interface VoiceMapping {
  [character: string]: string;
}

interface ElevenLabsInput {
  text: string;
  voiceId: string;
}

interface ElevenLabsRequestPayload {
  inputs: ElevenLabsInput[];
  settings: {
    stability: number;
  };
  pronunciationDictionaryLocators: any[];
  applyTextNormalization: string;
  modelId: string;
}

export function assignVoicesToCharacters(lines: DialogueLine[]): VoiceMapping {
  const uniqueCharacters: string[] = [];

  for (const line of lines) {
    const character = line.character.trim().toUpperCase();
    if (!uniqueCharacters.includes(character)) {
      uniqueCharacters.push(character);
    }
  }

  const voiceMapping: VoiceMapping = {};

  if (uniqueCharacters.length > 0) {
    voiceMapping[uniqueCharacters[0]] = VOICE_ID_FIRST;
  }

  if (uniqueCharacters.length > 1) {
    voiceMapping[uniqueCharacters[1]] = VOICE_ID_SECOND;
  }

  if (uniqueCharacters.length > 2) {
    for (let i = 2; i < uniqueCharacters.length; i++) {
      voiceMapping[uniqueCharacters[i]] = i % 2 === 0 ? VOICE_ID_FIRST : VOICE_ID_SECOND;
    }
  }

  return voiceMapping;
}

function validateDialogueLines(lines: DialogueLine[]): void {
  if (!lines || lines.length === 0) {
    throw new Error('No dialogue lines provided');
  }

  for (const line of lines) {
    if (!line.lineId || !line.character || !line.text) {
      throw new Error('Invalid dialogue line structure: missing required fields');
    }
  }
}

export async function generateDialogueAudio(
  projectId: string,
  lines: DialogueLine[]
): Promise<string> {
  try {
    validateDialogueLines(lines);

    const sortedLines = [...lines].sort((a, b) => a.order - b.order);

    const voiceMapping = assignVoicesToCharacters(sortedLines);

    const inputs: ElevenLabsInput[] = sortedLines.map(line => ({
      text: line.text,
      voiceId: voiceMapping[line.character.trim().toUpperCase()] || VOICE_ID_FIRST,
    }));

    const requestPayload: ElevenLabsRequestPayload = {
      inputs,
      settings: {
        stability: 0.5,
      },
      pronunciationDictionaryLocators: [],
      applyTextNormalization: 'auto',
      modelId: 'eleven_v3',
    };

    const response = await fetch(ELEVENLABS_API_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const audioBlob = await response.blob();

    const audioArrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = new Uint8Array(audioArrayBuffer);

    const timestamp = Date.now();
    const fileName = `project-${projectId}-${timestamp}.mp3`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio_files')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload audio file: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('audio_files')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error generating dialogue audio:', error);
    throw new Error(error.message || 'Failed to generate dialogue audio');
  }
}
