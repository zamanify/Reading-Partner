import OpenAI from 'openai';
import * as FileSystem from 'expo-file-system/legacy';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface OCRResult {
  text: string;
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
              text: 'Extract all text from this PDF document and return it as plain text. Preserve the formatting and structure as much as possible. Do not add any commentary or explanations, only return the extracted text.',
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

    const extractedText = response.choices[0]?.message?.content || '';

    if (!extractedText) {
      return {
        text: '',
        success: false,
        error: 'No text could be extracted from the PDF',
      };
    }

    return {
      text: extractedText,
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
              text: 'Extract all text from this document and return it as plain text. Preserve the formatting and structure as much as possible. Do not add any commentary or explanations, only return the extracted text.',
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

    const extractedText = response.choices[0]?.message?.content || '';

    if (!extractedText) {
      return {
        text: '',
        success: false,
        error: 'No text could be extracted from the document',
      };
    }

    return {
      text: extractedText,
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
