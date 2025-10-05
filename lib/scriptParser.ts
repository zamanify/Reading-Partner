export interface Character {
  id?: number;
  projectId: number;
  name: string;
  isCounterReader: boolean;
  createdAt: string;
}

export class ScriptParser {
  private static readonly SCENE_HEADING_PREFIXES = [
    'INT.', 'EXT.', 'FADE IN:', 'FADE OUT:', 'CUT TO:', 'DISSOLVE TO:',
    'SCENE', 'ACTION', 'SOUND', 'MUSIC', 'TITLE CARD:', 'SUPER:',
    'MONTAGE', 'SERIES OF SHOTS', 'END OF', 'BACK TO:', 'LATER',
    'CONTINUOUS', 'MOMENTS LATER', 'THE END', 'BLACKOUT'
  ];

  private static readonly COMMON_PARENTHETICALS = [
    '(O.S.)', '(V.O.)', '(CONT\'D)', '(CONTINUED)', '(OFF SCREEN)',
    '(VOICE OVER)', '(BEAT)', '(PAUSE)', '(WHISPERS)', '(SHOUTS)',
    '(CRYING)', '(LAUGHING)', '(SIGHS)', '(TO HIMSELF)', '(TO HERSELF)'
  ];

  /**
   * Identifies character names from script text using screenplay formatting conventions
   */
  static identifyCharacters(scriptText: string): string[] {
    if (!scriptText || scriptText.trim().length === 0) {
      return [];
    }

    const lines = scriptText.split('\n').map(line => line.trim());
    const characters = new Set<string>();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines
      if (!line) continue;
      
      // Check if line is all uppercase (potential character name)
      if (this.isAllUppercase(line) && this.isValidCharacterName(line)) {
        // Skip if it's a scene heading
        if (this.isSceneHeading(line)) continue;
        
        // Skip if it's likely a title (appears early in script or in isolation)
        if (this.isLikelyTitle(line, i, lines)) continue;
        
        // Look at the next few lines for context
        const nextLines = this.getNextNonEmptyLines(lines, i, 3);
        
        // Check if this looks like a character name based on what follows
        if (this.isLikelyCharacterName(line, nextLines)) {
          // Clean up the character name
          const cleanName = this.cleanCharacterName(line);
          if (cleanName) {
            characters.add(cleanName);
          }
        }
      }
    }
    
    return Array.from(characters).sort();
  }

  /**
   * Checks if a line is all uppercase letters (allowing spaces, punctuation)
   */
  private static isAllUppercase(line: string): boolean {
    // Remove spaces and common punctuation, check if remaining chars are uppercase
    const alphaChars = line.replace(/[\s\.\,\!\?\'\"\(\)\-]/g, '');
    return alphaChars.length > 0 && alphaChars === alphaChars.toUpperCase();
  }

  /**
   * Validates that a potential character name meets basic criteria
   */
  private static isValidCharacterName(line: string): boolean {
    // Must have at least one letter
    if (!/[A-Z]/.test(line)) return false;
    
    // Should not be too long (character names are typically short)
    if (line.length > 50) return false;
    
    // Should not contain numbers (usually)
    if (/\d/.test(line)) return false;
    
    return true;
  }

  /**
   * Checks if a line is a scene heading
   */
  private static isSceneHeading(line: string): boolean {
    return this.SCENE_HEADING_PREFIXES.some(prefix => 
      line.startsWith(prefix) || line.includes(prefix)
    );
  }

  /**
   * Checks if a line is likely a script title
   */
  private static isLikelyTitle(line: string, lineIndex: number, allLines: string[]): boolean {
    // If it appears in the first 10 lines of the script, it's likely a title
    if (lineIndex < 10) {
      // Check if it's isolated (no dialogue following in next few lines)
      const nextLines = this.getNextNonEmptyLines(allLines, lineIndex, 5);
      const hasDialogueNearby = nextLines.some(nextLine => this.looksLikeDialogue(nextLine));
      
      if (!hasDialogueNearby) {
        return true;
      }
    }
    
    // Check if it's a quoted title (surrounded by quotes)
    if ((line.startsWith('"') && line.endsWith('"')) || 
        (line.startsWith("'") && line.endsWith("'"))) {
      return true;
    }
    
    // Check if it's a standalone title (no other characters nearby)
    const surroundingLines = this.getSurroundingNonEmptyLines(allLines, lineIndex, 3);
    const hasCharacterNearby = surroundingLines.some(surroundingLine => 
      this.isAllUppercase(surroundingLine) && 
      this.isValidCharacterName(surroundingLine) &&
      !this.isSceneHeading(surroundingLine)
    );
    
    // If no other potential characters nearby, it's likely a title
    if (!hasCharacterNearby) {
      return true;
    }
    
    return false;
  }

  /**
   * Gets the next few non-empty lines for context analysis
   */
  private static getNextNonEmptyLines(lines: string[], currentIndex: number, count: number): string[] {
    const nextLines: string[] = [];
    let index = currentIndex + 1;
    
    while (nextLines.length < count && index < lines.length) {
      const line = lines[index].trim();
      if (line) {
        nextLines.push(line);
      }
      index++;
    }
    
    return nextLines;
  }

  /**
   * Gets surrounding non-empty lines for context analysis
   */
  private static getSurroundingNonEmptyLines(lines: string[], currentIndex: number, radius: number): string[] {
    const surroundingLines: string[] = [];
    
    // Get lines before
    for (let i = Math.max(0, currentIndex - radius); i < currentIndex; i++) {
      const line = lines[i].trim();
      if (line) {
        surroundingLines.push(line);
      }
    }
    
    // Get lines after
    for (let i = currentIndex + 1; i < Math.min(lines.length, currentIndex + radius + 1); i++) {
      const line = lines[i].trim();
      if (line) {
        surroundingLines.push(line);
      }
    }
    
    return surroundingLines;
  }

  /**
   * Determines if an uppercase line is likely a character name based on context
   */
  private static isLikelyCharacterName(line: string, nextLines: string[]): boolean {
    if (nextLines.length === 0) return false;
    
    const firstNextLine = nextLines[0];
    
    // Check if followed by a parenthetical
    if (firstNextLine.startsWith('(') && firstNextLine.endsWith(')')) {
      // If it's a common parenthetical, this is likely a character
      if (this.COMMON_PARENTHETICALS.some(p => firstNextLine.includes(p.slice(1, -1)))) {
        return true;
      }
      
      // Check the line after the parenthetical
      if (nextLines.length > 1) {
        const secondNextLine = nextLines[1];
        return this.looksLikeDialogue(secondNextLine);
      }
    }
    
    // Check if followed directly by dialogue
    return this.looksLikeDialogue(firstNextLine);
  }

  /**
   * Checks if a line looks like dialogue
   */
  private static looksLikeDialogue(line: string): boolean {
    // Dialogue typically:
    // - Starts with a capital letter
    // - Contains lowercase letters
    // - Is not all uppercase (which would be another character or action)
    // - Is not a scene heading
    
    if (!line || line.length === 0) return false;
    
    // Skip if it's all uppercase (likely another character or action line)
    if (this.isAllUppercase(line)) return false;
    
    // Skip if it's a scene heading
    if (this.isSceneHeading(line)) return false;
    
    // Should start with a capital letter and contain lowercase
    return /^[A-Z]/.test(line) && /[a-z]/.test(line);
  }

  /**
   * Cleans up a character name by removing common suffixes and formatting
   */
  private static cleanCharacterName(name: string): string {
    let cleaned = name.trim();
    
    // Remove common suffixes like (CONT'D), (O.S.), (V.O.)
    cleaned = cleaned.replace(/\s*\(.*\)$/, '');
    
    // Remove trailing punctuation
    cleaned = cleaned.replace(/[\.,:;!?]+$/, '');
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }
}