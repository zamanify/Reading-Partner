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
              text: 'You are a deterministic script extraction and dialogue parsing tool. Follow these rules exactly and never include any commentary or extra text before or after the required output. Your output must be in two parts separated by these exact characters on their own line: "---DIALOGUE_JSON---". Do not allow linebreaks in the separating line "---DIALOGUE_JSON---". 1. First section: Extract ALL text from the document exactly as it appears, preserving formatting, punctuation, line breaks, spacing, and structure. Include everything: dialogue, stage directions, scene descriptions, character names, transitions, parentheticals, and page numbers. Do not add, reorder, interpret, summarize, or normalize any content. The section should be a perfect verbatim copy of the text as read from the PDF. 2. Second section (after the separator): Provide a JSON array containing ONLY the dialogue lines. Exclude stage directions, scene descriptions, transitions, and action lines. Each dialogue line must include: lineId: unique identifier (e.g., "L1", "L2", "L3"), character: the character name speaking (uppercase), text: the dialogue text only. Rules for dialogue detection: - A dialogue block starts with a line in uppercase (allowing ÅÄÖ and accented letters) that represents a character name, followed by one or more lines of text that belong to that character. - Parentheticals like (CONT’D), (V.O.), (O.S.), or similar should be ignored when identifying the character name. - If a character continues speaking after a short action or description without a new character name, merge those dialogue parts into one line. - If a line ends with a dash or em-dash indicating interruption, preserve it exactly. - Keep punctuation, symbols, and ellipses exactly as they appear. - Do not include scene headings (INT./EXT.), transitions (CUT TO:), or non-dialogue text in the JSON. - Keep Swedish and English text as written; do not translate or normalize. The output format after the exact separator "---DIALOGUE_JSON---" must look like this example: [{"lineId":"L1","character":"ASH","text":"Hello."},{"lineId":"L2","character":"CHARLIE","text":"Hi."}]. If extraction fails, return the reason in plain text instead of JSON, without adding any other commentary.',
              
              
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
              text: 'You are a deterministic script extraction and dialogue parsing tool. Follow these rules exactly and never include any commentary or extra text before or after the required output. Your output must be in two parts separated by these exact characters on their own line: "---DIALOGUE_JSON---". Do not allow linebreaks in the separating line "---DIALOGUE_JSON---". 1. First section: Extract ALL text from the document exactly as it appears, preserving formatting, punctuation, line breaks, spacing, and structure. Include everything: dialogue, stage directions, scene descriptions, character names, transitions, parentheticals, and page numbers. Do not add, reorder, interpret, summarize, or normalize any content. The section should be a perfect verbatim copy of the text as read from the PDF. 2. Second section (after the separator): Provide a JSON array containing ONLY the dialogue lines. Exclude stage directions, scene descriptions, transitions, and action lines. Each dialogue line must include: lineId: unique identifier (e.g., "L1", "L2", "L3"), character: the character name speaking (uppercase), text: the dialogue text only. Rules for dialogue detection: - A dialogue block starts with a line in uppercase (allowing ÅÄÖ and accented letters) that represents a character name, followed by one or more lines of text that belong to that character. - Parentheticals like (CONT’D), (V.O.), (O.S.), or similar should be ignored when identifying the character name. - If a character continues speaking after a short action or description without a new character name, merge those dialogue parts into one line. - If a line ends with a dash or em-dash indicating interruption, preserve it exactly. - Keep punctuation, symbols, and ellipses exactly as they appear. - Do not include scene headings (INT./EXT.), transitions (CUT TO:), or non-dialogue text in the JSON. - Keep Swedish and English text as written; do not translate or normalize. The output format after the exact separator "---DIALOGUE_JSON---" must look like this example: [{"lineId":"L1","character":"ASH","text":"Hello."},{"lineId":"L2","character":"CHARLIE","text":"Hi."}]. If extraction fails, return the reason in plain text instead of JSON, without adding any other commentary.',
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
