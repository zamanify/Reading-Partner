import OpenAI from 'openai';
import * as FileSystem from 'expo-file-system/legacy';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface DialogueLine {
  lineId: string;
  character: string;
  text: string;
}

export interface Scene {
  sceneId: string;
  heading: string;
  startLineId?: string;
  endLineId?: string;
  pageStart: number | null;
  pageEnd: number | null;
}

export interface ParsedResponse {
  sourceSha256: string;
  lines: DialogueLine[];
  scenes: Scene[];
  error?: string;
}

export interface OCRResult {
  text: string;
  lines?: DialogueLine[];
  scenes?: Scene[];
  sourceSha256?: string;
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

    const promptText = `You are a deterministic script extraction and dialogue parser. Follow these rules exactly. If any rule is unclear, prefer omission over invention.

GLOBAL OUTPUT CONTRACT
- Output exactly two sections, in this order, separated by this exact delimiter on its own line:
---DIALOGUE_JSON---
- Section 1 must be an exact, verbatim extraction of the file text (same characters, casing, hyphens/dashes, punctuation, line breaks, spacing as rendered reading order). Do not add, reorder, explain, summarize, translate, or normalize.
- Nothing is allowed before Section 1 or after Section 2. No greetings, no closing lines, no commentary, no JSON outside Section 2.
- After producing Section 1, compute sha256 of its raw bytes (UTF-8) and include it as "sourceSha256" inside Section 2 so the caller can validate integrity.

SECTION 1 — VERBATIM TEXT
Return the entire document text in reading order, including: scene headings (e.g., INT./EXT.), character names, dialogue, parentheticals, transitions, lyrics, SFX, and scene descriptions. Keep all hyphens/em dashes exactly as in source.
Do not fix OCR quirks, smart quotes, spacing, page headers/footers—include them as seen.

(Place Section 1 here. Immediately after it, place the delimiter ---DIALOGUE_JSON--- on its own line.)

SECTION 2 — STRICT JSON (UTF-8, single top-level JSON object)
Produce one JSON object with only these keys:

{
  "sourceSha256": "hex-string",
  "lines": [
    {
      "lineId": "L1",
      "character": "ASH",
      "text": "I've got it!"
    }
  ],
  "scenes": [
    {
      "sceneId": "S1",
      "heading": "EXT. APARTMENT BALCONY - NIGHT",
      "startLineId": "L1",
      "endLineId": "L37",
      "pageStart": 1,
      "pageEnd": 3
    }
  ]
}

JSON field rules
- sourceSha256: Lowercase hex SHA-256 of Section 1 raw UTF-8 bytes.
- lines: Array of dialogue lines only (no action, no sluglines, no transitions).
  - lineId: "L1", "L2", ... sequential, stable within this output.
  - character: Speaker as printed in the script (usually UPPERCASE, keep accents and diacritics).
  - text: Dialogue text only; include in-line parentheticals only if embedded in the speaking block for that character. Strip leading/trailing quotes solely if they are layout quotes around the whole line; otherwise keep characters exactly.
- scenes: Array of scene objects in document order.
  - sceneId: "S1", "S2", ...
  - heading: The full scene heading line as printed (e.g., INT. HOFFMANS HUS - DAG, or 143 EXT. PALERMO, TORG - KVÄLL if numbered).
  - startLineId/endLineId: First/last lineId that occur within this scene; if a scene has no dialogue, omit these two properties for that scene.
  - pageStart/pageEnd: Page numbers if explicitly present in the text; otherwise set to null.

Dialogue detection heuristics (apply in order)
1. Speaker block start: A line that is (a) primarily uppercase letters (allow ÅÄÖ and diacritics), numbers or dots, and (b) not a scene heading/transitions. Examples: CHARLIE, ASH, MERRILL, JAN, HOFFMAN.
2. Parentheticals on their own line directly under a speaker ((CONT'D), stage-asides): exclude from text unless inline within the dialogue sentence. Keep the dialogue text as printed otherwise.
3. Dialogue continuation with intervening action: If the same speaker resumes immediately after a single block of action/stage direction without a new speaker name and the typography clearly continues the thought, treat it as the same logical line and merge the text with a single space.
4. Interrupted lines / cut-offs: If a line ends with a hyphen/en-dash/em-dash indicating interruption (e.g., Helene..- or trailing -), preserve the exact dash character(s) in text. Do not normalize or remove the dash.
5. Exclude non-dialogue: Scene headings like INT./EXT., transitions (CUT TO:), SFX-only lines, and pure action blocks are not lines.
6. Bilingual scripts: Keep language and punctuation as printed; don't translate (e.g., Swedish – DAG, English - NIGHT).
7. Speaker with (CONT'D): Remove the literal (CONT'D) from character but keep it for continuity logic. If (O.S.), (V.O.) etc. appear next to the name, exclude from character but retain any such notes only if embedded within text.

Hard safety checks (model self-validation)
Before emitting final output:
- If you generated any text before Section 1 or after Section 2, delete it.
- Validate JSON is a single object (not an array), strictly UTF-8, and can parse with standard JSON parsers. No comments, no trailing commas.
- Recompute sourceSha256 against the exact bytes of Section 1 you are returning.

Failure mode
If extraction truly fails (e.g., unreadable file), output:
- Section 1: an empty string, then the delimiter, then
- Section 2: JSON object with "sourceSha256" of the empty string, and an additional key "error" describing why extraction failed. No extra prose anywhere.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: promptText,
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
    let scenes: Scene[] | undefined;
    let sourceSha256: string | undefined;

    if (parts.length > 1) {
      try {
        const jsonText = parts[1].trim();
        const parsed: ParsedResponse = JSON.parse(jsonText);

        if (parsed.error) {
          return {
            text: extractedText,
            success: false,
            error: parsed.error,
          };
        }

        lines = parsed.lines;
        scenes = parsed.scenes;
        sourceSha256 = parsed.sourceSha256;
      } catch (error) {
        console.warn('Failed to parse dialogue JSON, continuing without lines:', error);
      }
    }

    return {
      text: extractedText,
      lines,
      scenes,
      sourceSha256,
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

    const promptText = `You are a deterministic script extraction and dialogue parser. Follow these rules exactly. If any rule is unclear, prefer omission over invention.

GLOBAL OUTPUT CONTRACT
- Output exactly two sections, in this order, separated by this exact delimiter on its own line:
---DIALOGUE_JSON---
- Section 1 must be an exact, verbatim extraction of the file text (same characters, casing, hyphens/dashes, punctuation, line breaks, spacing as rendered reading order). Do not add, reorder, explain, summarize, translate, or normalize.
- Nothing is allowed before Section 1 or after Section 2. No greetings, no closing lines, no commentary, no JSON outside Section 2.
- After producing Section 1, compute sha256 of its raw bytes (UTF-8) and include it as "sourceSha256" inside Section 2 so the caller can validate integrity.

SECTION 1 — VERBATIM TEXT
Return the entire document text in reading order, including: scene headings (e.g., INT./EXT.), character names, dialogue, parentheticals, transitions, lyrics, SFX, and scene descriptions. Keep all hyphens/em dashes exactly as in source.
Do not fix OCR quirks, smart quotes, spacing, page headers/footers—include them as seen.

(Place Section 1 here. Immediately after it, place the delimiter ---DIALOGUE_JSON--- on its own line.)

SECTION 2 — STRICT JSON (UTF-8, single top-level JSON object)
Produce one JSON object with only these keys:

{
  "sourceSha256": "hex-string",
  "lines": [
    {
      "lineId": "L1",
      "character": "ASH",
      "text": "I've got it!"
    }
  ],
  "scenes": [
    {
      "sceneId": "S1",
      "heading": "EXT. APARTMENT BALCONY - NIGHT",
      "startLineId": "L1",
      "endLineId": "L37",
      "pageStart": 1,
      "pageEnd": 3
    }
  ]
}

JSON field rules
- sourceSha256: Lowercase hex SHA-256 of Section 1 raw UTF-8 bytes.
- lines: Array of dialogue lines only (no action, no sluglines, no transitions).
  - lineId: "L1", "L2", ... sequential, stable within this output.
  - character: Speaker as printed in the script (usually UPPERCASE, keep accents and diacritics).
  - text: Dialogue text only; include in-line parentheticals only if embedded in the speaking block for that character. Strip leading/trailing quotes solely if they are layout quotes around the whole line; otherwise keep characters exactly.
- scenes: Array of scene objects in document order.
  - sceneId: "S1", "S2", ...
  - heading: The full scene heading line as printed (e.g., INT. HOFFMANS HUS - DAG, or 143 EXT. PALERMO, TORG - KVÄLL if numbered).
  - startLineId/endLineId: First/last lineId that occur within this scene; if a scene has no dialogue, omit these two properties for that scene.
  - pageStart/pageEnd: Page numbers if explicitly present in the text; otherwise set to null.

Dialogue detection heuristics (apply in order)
1. Speaker block start: A line that is (a) primarily uppercase letters (allow ÅÄÖ and diacritics), numbers or dots, and (b) not a scene heading/transitions. Examples: CHARLIE, ASH, MERRILL, JAN, HOFFMAN.
2. Parentheticals on their own line directly under a speaker ((CONT'D), stage-asides): exclude from text unless inline within the dialogue sentence. Keep the dialogue text as printed otherwise.
3. Dialogue continuation with intervening action: If the same speaker resumes immediately after a single block of action/stage direction without a new speaker name and the typography clearly continues the thought, treat it as the same logical line and merge the text with a single space.
4. Interrupted lines / cut-offs: If a line ends with a hyphen/en-dash/em-dash indicating interruption (e.g., Helene..- or trailing -), preserve the exact dash character(s) in text. Do not normalize or remove the dash.
5. Exclude non-dialogue: Scene headings like INT./EXT., transitions (CUT TO:), SFX-only lines, and pure action blocks are not lines.
6. Bilingual scripts: Keep language and punctuation as printed; don't translate (e.g., Swedish – DAG, English - NIGHT).
7. Speaker with (CONT'D): Remove the literal (CONT'D) from character but keep it for continuity logic. If (O.S.), (V.O.) etc. appear next to the name, exclude from character but retain any such notes only if embedded within text.

Hard safety checks (model self-validation)
Before emitting final output:
- If you generated any text before Section 1 or after Section 2, delete it.
- Validate JSON is a single object (not an array), strictly UTF-8, and can parse with standard JSON parsers. No comments, no trailing commas.
- Recompute sourceSha256 against the exact bytes of Section 1 you are returning.

Failure mode
If extraction truly fails (e.g., unreadable file), output:
- Section 1: an empty string, then the delimiter, then
- Section 2: JSON object with "sourceSha256" of the empty string, and an additional key "error" describing why extraction failed. No extra prose anywhere.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: promptText,
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
    let scenes: Scene[] | undefined;
    let sourceSha256: string | undefined;

    if (parts.length > 1) {
      try {
        const jsonText = parts[1].trim();
        const parsed: ParsedResponse = JSON.parse(jsonText);

        if (parsed.error) {
          return {
            text: extractedText,
            success: false,
            error: parsed.error,
          };
        }

        lines = parsed.lines;
        scenes = parsed.scenes;
        sourceSha256 = parsed.sourceSha256;
      } catch (error) {
        console.warn('Failed to parse dialogue JSON, continuing without lines:', error);
      }
    }

    return {
      text: extractedText,
      lines,
      scenes,
      sourceSha256,
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
