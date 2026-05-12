import type { SubtitleBlock, SubtitleWord } from '../types/media';

// ---------------------------------------------------------------------------
// SRT / VTT parser (used by LocalMediaPlayer for video/audio uploads)
// ---------------------------------------------------------------------------

const parseTimestamp = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.trim().replace(',', '.').split(':');
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
  } else if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return 0;
};

const tokenize = (text: string): SubtitleWord[] =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map(w => ({
      text: w,
      baseForm: w.replace(/[.,!?]/g, ''),
      translation: 'Нажмите для перевода',
      grammar: 'Нажмите для анализа',
    }));

export function parseSrtVtt(text: string): SubtitleBlock[] {
  const blocks: SubtitleBlock[] = [];
  const lines = text.trim().split(/\r?\n/);

  let i = 0;
  let id = 0;

  while (i < lines.length) {
    let line = lines[i].trim();

    if (!line || line === 'WEBVTT') {
      i++;
      continue;
    }

    // Skip numeric cue IDs
    if (/^\d+$/.test(line)) {
      i++;
      if (i >= lines.length) break;
      line = lines[i].trim();
    }

    // Timestamp line
    if (line.includes('-->')) {
      const parts = line.split('-->');
      const start = parseTimestamp(parts[0]);
      const end = parseTimestamp(parts[1]);

      i++;
      let subText = '';
      while (i < lines.length && lines[i].trim() !== '') {
        subText += (subText ? ' ' : '') + lines[i].trim();
        i++;
      }

      if (subText) {
        blocks.push({
          id: id++,
          start,
          end,
          text: subText,
          translation: 'Нажмите для получения перевода фразы',
          words: tokenize(subText),
        });
      }
    } else {
      i++;
    }
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// LRC parser (used by LocalMediaPlayer for audio with .lrc lyrics)
// ---------------------------------------------------------------------------

export function parseLrc(text: string): SubtitleBlock[] {
  const blocks: SubtitleBlock[] = [];
  const lines = text.trim().split(/\r?\n/);
  const timeRegex = /^\[(\d{2,}):(\d{2}(?:\.\d{1,3})?)\]\s*(.*)$/;

  let id = 0;
  for (const line of lines) {
    const match = timeRegex.exec(line.trim());
    if (match) {
      const start = parseInt(match[1]) * 60 + parseFloat(match[2]);
      const subText = match[3].trim();

      if (subText) {
        blocks.push({
          id: id++,
          start,
          end: start + 4, // will be fixed below
          text: subText,
          translation: 'Нажмите для получения перевода фразы',
          artisticTranslation: 'Перевод недоступен',
          words: tokenize(subText),
        });
      }
    }
  }

  // Fix end times based on the next cue's start
  for (let i = 0; i < blocks.length - 1; i++) {
    blocks[i].end = blocks[i + 1].start;
  }

  return blocks;
}
