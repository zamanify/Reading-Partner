import * as FileSystem from 'expo-file-system/legacy';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validatePDFPages(fileUri: string, maxPages: number = 10): Promise<ValidationResult> {
  try {
    const base64Data = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const pdfData = atob(base64Data);

    const pageCountMatch = pdfData.match(/\/Type\s*\/Page[^s]/g);
    const pageCount = pageCountMatch ? pageCountMatch.length : 0;

    if (pageCount === 0) {
      return {
        isValid: false,
        error: 'Could not determine number of pages in PDF',
      };
    }

    if (pageCount > maxPages) {
      return {
        isValid: false,
        error: `PDF has ${pageCount} pages. Maximum allowed is ${maxPages} pages.`,
      };
    }

    return {
      isValid: true,
    };
  } catch (error) {
    console.error('Error validating PDF pages:', error);
    return {
      isValid: false,
      error: 'Could not validate PDF file',
    };
  }
}

export async function validateFileSize(fileUri: string, maxSizeMB: number = 5): Promise<ValidationResult> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (!fileInfo.exists) {
      return {
        isValid: false,
        error: 'File does not exist',
      };
    }

    if (!fileInfo.size) {
      return {
        isValid: false,
        error: 'Could not determine file size',
      };
    }

    const fileSizeMB = fileInfo.size / (1024 * 1024);

    if (fileSizeMB > maxSizeMB) {
      return {
        isValid: false,
        error: `File size is ${fileSizeMB.toFixed(2)}MB. Maximum allowed is ${maxSizeMB}MB.`,
      };
    }

    return {
      isValid: true,
    };
  } catch (error) {
    console.error('Error validating file size:', error);
    return {
      isValid: false,
      error: 'Could not validate file size',
    };
  }
}
