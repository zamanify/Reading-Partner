import OpenAI from 'openai';
import * as FileSystem from 'expo-file-system/legacy';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface DialogueLine {
  lineId: string;
  order: number;
  character: string;
  text: string;
}

export interface OCRResult {
  text: string;
  lines?: DialogueLine[];
  success: boolean;
  error?: string;
}

export async function extractTextFromDocument(
  fileUri: string,
  mimeType: string
): Promise<OCRResult> {
  try {
    const base64Data = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const fileExtension = getFileExtension(mimeType);
    const fileName = `document.${fileExtension}`;

    if (mimeType === 'application/pdf') {
      return await extractTextFromPDF(base64Data, fileName, mimeType);
    } else if (mimeType === 'application/msword' ||
               mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
               mimeType === 'application/rtf') {
      return await extractTextFromDocument_Legacy(base64Data, fileName, mimeType);
    } else {
      return {
        text: '',
        success: false,
        error: 'Unsupported file format. Please use PDF, Word, RTF, or plain text files.',
      };
    }
  } catch (error: any) {
    console.error('OpenAI OCR error:', error);

    let errorMessage = 'Failed to extract text from document';

    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid OpenAI API key. Please check your configuration.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
    } else if (error.message?.includes('MIME type') || error.message?.includes('file type')) {
      errorMessage = 'This file format is not supported. Please use PDF, Word, RTF, or plain text files.';
    } else if (error.message?.includes('Invalid input')) {
      errorMessage = 'The file could not be processed. It may be corrupted or in an unsupported format.';
    }

    return {
      text: '',
      success: false,
      error: errorMessage,
    };
  }
}

async function extractTextFromPDF(
  base64Data: string,
  fileName: string,
  mimeType: string
): Promise<OCRResult> {
  try {
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'You are a script extraction and dialogue parsing tool. Your output must be in two parts separated by "---DIALOGUE_JSON---":\n\n1. First, extract ALL text from the document exactly as it appears, preserving formatting and structure. Include everything: dialogue, stage directions, scene descriptions, character names, etc. Do not add any information to this section. The content should only consist of what you extracted from the file. \n\n2. After "---DIALOGUE_JSON---", provide a JSON array containing ONLY the dialogue lines (exclude stage directions, scene descriptions, and action lines). Each line should have:\n- lineId: unique identifier (e.g., "L1", "L2", "L3")\n- character: the character name speaking (uppercase)\n- text: the dialogue text only\n\nExample format:\n[FULL SCRIPT TEXT]\n---DIALOGUE_JSON---\n[{"lineId":"L1","character":"ASH","text":"Hello."},{"lineId":"L2","character":"CHARLIE","text":"Hi."}]\n\nIf you are unable to extract text, explain why extraction failed.',
            },
            {
              type: 'file',
              file: {
                file_data: dataUrl,
                filename: fileName,
              },
            } as any,
          ],
        },
      ],
      max_tokens: 8192,
    });

    const extractedContent = response.choices[0]?.message?.content || '';

    if (!extractedContent) {
      return {
        text: '',
        success: false,
        error: 'No text could be extracted from the PDF',
      };
    }

    const parts = extractedContent.split('---DIALOGUE_JSON---');
    const extractedText = parts[0]?.trim() || '';
    let lines: DialogueLine[] | undefined;

    if (parts.length > 1) {
      try {
        const jsonText = parts[1].trim();
        lines = JSON.parse(jsonText);
      } catch (error) {
        console.warn('Failed to parse dialogue JSON, continuing without lines:', error);
      }
    }

    return {
      text: extractedText,
      lines,
      success: true,
    };
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    throw error;
  }
}

async function extractTextFromDocument_Legacy(
  base64Data: string,
  fileName: string,
  mimeType: string
): Promise<OCRResult> {
  try {
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'You are a script extraction and dialogue parsing tool. Your output must be in two parts separated by "---DIALOGUE_JSON---":\n\n1. First, extract ALL text from the document exactly as it appears, preserving formatting and structure. Include everything: dialogue, stage directions, scene descriptions, character names, etc.\n\n2. After "---DIALOGUE_JSON---", provide a JSON array containing ONLY the dialogue lines (exclude stage directions, scene descriptions, and action lines). Each line should have:\n- lineId: unique identifier (e.g., "L1", "L2", "L3")\n- order: sequential number starting from 1\n- character: the character name speaking (uppercase)\n- text: the dialogue text only\n\nExample format:\n[FULL SCRIPT TEXT]\n---DIALOGUE_JSON---\n[{"lineId":"L1","order":1,"character":"ASH","text":"Hello."},{"lineId":"L2","order":2,"character":"CHARLIE","text":"Hi."}]\n\nIf you are unable to extract text, explain why extraction failed.',
            },
            {
              type: 'file',
              file: {
                file_data: dataUrl,
                filename: fileName,
              },
            } as any,
          ],
        },
      ],
      max_tokens: 8192,
    });

    const extractedContent = response.choices[0]?.message?.content || '';

    if (!extractedContent) {
      return {
        text: '',
        success: false,
        error: 'No text could be extracted from the document',
      };
    }

    const parts = extractedContent.split('---DIALOGUE_JSON---');
    const extractedText = parts[0]?.trim() || '';
    let lines: DialogueLine[] | undefined;

    if (parts.length > 1) {
      try {
        const jsonText = parts[1].trim();
        lines = JSON.parse(jsonText);
      } catch (error) {
        console.warn('Failed to parse dialogue JSON, continuing without lines:', error);
      }
    }

    return {
      text: extractedText,
      lines,
      success: true,
    };
  } catch (error: any) {
    console.error('Document extraction error:', error);
    throw error;
  }
}

function getFileExtension(mimeType: string): string {
  const mimeToExtension: { [key: string]: string } = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/rtf': 'rtf',
    'text/plain': 'txt',
  };

  return mimeToExtension[mimeType] || 'unknown';
}

export async function validateFileSize(fileUri: string, maxSizeMB: number = 5): Promise<boolean> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists || !fileInfo.size) {
      return false;
    }

    const fileSizeMB = fileInfo.size / (1024 * 1024);
    return fileSizeMB <= maxSizeMB;
  } catch (error) {
    console.error('Error validating file size:', error);
    return false;
  }
}
