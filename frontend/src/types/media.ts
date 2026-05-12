/** A single Korean word within a subtitle line, with optional linguistic annotations. */
export interface SubtitleWord {
  text: string;
  baseForm?: string;
  translation?: string;
  grammar?: string;
  particles?: string;
  culturalComment?: string;
}

/** A timed subtitle block containing the full text and individual word tokens. */
export interface SubtitleBlock {
  id: number;
  start: number; // seconds
  end: number;   // seconds
  text: string;
  translation?: string;
  artisticTranslation?: string;
  words: SubtitleWord[];
}
