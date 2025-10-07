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
              text: getEnhancedPrompt(),
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

        if (lines && lines.length > 0) {
          const validationIssues = validateDialogueLines(lines, extractedText);
          if (validationIssues.length > 0) {
            console.warn('Dialogue validation issues found:', validationIssues);
          }

          const fallbackLines = extractDialogueWithRegex(extractedText);
          lines = mergeDialogueLines(lines, fallbackLines, extractedText);
        }
      } catch (error) {
        console.warn('Failed to parse dialogue JSON, attempting fallback extraction:', error);
        lines = extractDialogueWithRegex(extractedText);
      }
    } else {
      lines = extractDialogueWithRegex(extractedText);
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
              text: getEnhancedPrompt(),
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

        if (lines && lines.length > 0) {
          const validationIssues = validateDialogueLines(lines, extractedText);
          if (validationIssues.length > 0) {
            console.warn('Dialogue validation issues found:', validationIssues);
          }

          const fallbackLines = extractDialogueWithRegex(extractedText);
          lines = mergeDialogueLines(lines, fallbackLines, extractedText);
        }
      } catch (error) {
        console.warn('Failed to parse dialogue JSON, attempting fallback extraction:', error);
        lines = extractDialogueWithRegex(extractedText);
      }
    } else {
      lines = extractDialogueWithRegex(extractedText);
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

function getEnhancedPrompt(): string {
  return `You are a professional screenplay extraction and dialogue parsing tool. Your output must be in two parts separated by "---DIALOGUE_JSON---":

PART 1: Extract ALL text from the document exactly as it appears, preserving formatting and structure. Include everything: dialogue, stage directions, scene descriptions, character names, etc.

PART 2: After "---DIALOGUE_JSON---", provide a JSON array containing ONLY the dialogue lines.

CRITICAL SCREENPLAY FORMATTING RULES:

1. CHARACTER IDENTIFICATION:
   - Character names appear in UPPERCASE (may include parentheticals like "(CONT'D)", "(V.O.)", "(O.S.)")
   - A character name followed by dialogue indicates a speaking line
   - "(CONT'D)" means the same character continues speaking after stage directions/actions
   - Extract the base character name without markers (e.g., "THE FAN (CONT'D)" becomes "THE FAN")

2. DIALOGUE EXTRACTION:
   - Capture ALL dialogue text from each character, even if interrupted by action lines
   - Include parentheticals within dialogue like "(Beat.)" as part of the text
   - Each continuous block of dialogue from a character is ONE line entry
   - DO NOT skip dialogue that appears after stage directions if the character continues speaking

3. HANDLING INTERRUPTIONS:
   - Stage directions, scene descriptions, and action lines between dialogue are NOT dialogue
   - When you see "CHARACTER (CONT'D)" after an action line, this is continuation of that character's speech
   - The dialogue following "(CONT'D)" MUST be captured as a separate line entry
   - Maintain strict sequential order - never skip lines

4. SEQUENTIAL ORDERING:
   - Assign order numbers sequentially (1, 2, 3, 4...) with NO GAPS
   - Process the script from top to bottom, capturing every dialogue occurrence
   - Each new dialogue block (even from the same character) gets a new order number

EXAMPLE - Correct Handling of Interrupted Dialogue:

Script Text:
SARAH
I can't believe this is happening!

Sarah walks to the window and looks outside.

SARAH (CONT'D)
We need to leave now.

Correct Output:
[{"lineId":"L1","order":1,"character":"SARAH","text":"I can't believe this is happening!"},{"lineId":"L2","order":2,"character":"SARAH","text":"We need to leave now."}]

WRONG Output (missing second line):
[{"lineId":"L1","order":1,"character":"SARAH","text":"I can't believe this is happening!"}]

JSON STRUCTURE:
- lineId: unique identifier (e.g., "L1", "L2", "L3"...)
- order: sequential number starting from 1, incrementing by 1 for each line
- character: the character name in UPPERCASE (without continuation markers)
- text: the dialogue text only, including any parentheticals like "(Beat.)" or "(pause)"

Format:
[FULL SCRIPT TEXT]
---DIALOGUE_JSON---
[{"lineId":"L1","order":1,"character":"CHARACTER1","text":"First line."},{"lineId":"L2","order":2,"character":"CHARACTER2","text":"Second line."}]

If you are unable to extract text, explain why extraction failed.`;
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

function validateDialogueLines(lines: DialogueLine[], scriptText: string): string[] {
  const issues: string[] = [];

  for (let i = 0; i < lines.length - 1; i++) {
    const currentOrder = lines[i].order;
    const nextOrder = lines[i + 1].order;

    if (nextOrder !== currentOrder + 1) {
      issues.push(`Order gap detected: line ${currentOrder} followed by ${nextOrder}`);
    }
  }

  const contdPattern = /^([A-Z\s]+)\s*\(CONT'D\)/gm;
  const contdMatches = scriptText.match(contdPattern);
  if (contdMatches) {
    const contdCount = contdMatches.length;
    const characterContinuations = new Map<string, number>();

    lines.forEach((line, index) => {
      if (index > 0 && lines[index - 1].character === line.character) {
        const count = characterContinuations.get(line.character) || 0;
        characterContinuations.set(line.character, count + 1);
      }
    });

    const totalContinuations = Array.from(characterContinuations.values()).reduce((a, b) => a + b, 0);
    if (totalContinuations < contdCount) {
      issues.push(`Found ${contdCount} (CONT'D) markers but only ${totalContinuations} character continuations in extracted lines`);
    }
  }

  return issues;
}

function extractDialogueWithRegex(scriptText: string): DialogueLine[] {
  const lines: DialogueLine[] = [];
  const scriptLines = scriptText.split('\n');

  let i = 0;
  let order = 1;

  while (i < scriptLines.length) {
    const line = scriptLines[i].trim();

    const characterMatch = line.match(/^([A-Z\s]{2,})(?:\s*\((?:CONT'D|V\.O\.|O\.S\.|[^)]+)\))?$/);

    if (characterMatch && !isSceneHeading(line)) {
      const character = characterMatch[1].trim();
      const dialogueLines: string[] = [];

      i++;
      while (i < scriptLines.length) {
        const dialogueLine = scriptLines[i];

        if (!dialogueLine.trim()) {
          i++;
          continue;
        }

        const nextCharMatch = dialogueLine.trim().match(/^([A-Z\s]{2,})(?:\s*\((?:CONT'D|V\.O\.|O\.S\.|[^)]+)\))?$/);
        if (nextCharMatch || isSceneHeading(dialogueLine.trim())) {
          break;
        }

        if (isAction(dialogueLine)) {
          break;
        }

        dialogueLines.push(dialogueLine);
        i++;
      }

      if (dialogueLines.length > 0) {
        const dialogueText = dialogueLines.join('\n').trim();
        if (dialogueText) {
          lines.push({
            lineId: `L${order}`,
            order: order,
            character: character,
            text: dialogueText
          });
          order++;
        }
      }
      continue;
    }

    i++;
  }

  return lines;
}

function isSceneHeading(text: string): boolean {
  const sceneHeadings = ['INT.', 'EXT.', 'INT./EXT.', 'EXT./INT.', 'I/E'];
  return sceneHeadings.some(heading => text.startsWith(heading));
}

function isAction(text: string): boolean {
  const actionIndicators = [
    /^[A-Z\s]+ (walks|runs|sits|stands|looks|moves|enters|exits|opens|closes)/i,
    /^The /,
    /^A /,
  ];
  return actionIndicators.some(pattern => pattern.test(text));
}

function mergeDialogueLines(
  aiLines: DialogueLine[],
  regexLines: DialogueLine[],
  scriptText: string
): DialogueLine[] {
  if (regexLines.length === 0) {
    return aiLines;
  }

  if (aiLines.length === 0) {
    return regexLines;
  }

  if (regexLines.length > aiLines.length) {
    console.warn(`Regex found ${regexLines.length} lines vs AI found ${aiLines.length} lines. Using regex results.`);
    return regexLines;
  }

  const mergedLines = [...aiLines];
  const aiTexts = new Set(aiLines.map(line => line.text.toLowerCase().trim()));

  regexLines.forEach(regexLine => {
    const normalizedText = regexLine.text.toLowerCase().trim();
    if (!aiTexts.has(normalizedText)) {
      console.warn(`Regex found dialogue missing from AI extraction: "${regexLine.text.substring(0, 50)}..."`);
      mergedLines.push(regexLine);
    }
  });

  mergedLines.sort((a, b) => {
    const aIndex = scriptText.indexOf(a.text);
    const bIndex = scriptText.indexOf(b.text);
    return aIndex - bIndex;
  });

  mergedLines.forEach((line, index) => {
    line.order = index + 1;
    line.lineId = `L${index + 1}`;
  });

  return mergedLines;
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
