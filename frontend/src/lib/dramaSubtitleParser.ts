import type { SubtitleBlock, SubtitleWord } from '../types/media';

/**
 * Parses drama analysis files (.md or .json) into SubtitleBlocks.
 * Handles two formats:
 * 1. JSON format (actually JSON inside a .md file)
 * 2. Markdown format (structured headings and lists)
 */
export async function parseDramaAnalysis(content: string): Promise<SubtitleBlock[]> {
  try {
    // Try parsing as JSON first
    const data = JSON.parse(content);
    return parseJsonFormat(data);
  } catch (e) {
    // If JSON fails, try parsing as Markdown
    return parseMarkdownFormat(content);
  }
}

/**
 * Handles the JSON format found in files like ep01_02.md
 */
function parseJsonFormat(data: any): SubtitleBlock[] {
  const words: SubtitleWord[] = (data.vocabulary_analysis || []).map((item: any) => ({
    text: item.word_in_text || '',
    baseForm: item.base_form,
    translation: item.particles_changes, // Use particles/changes as translation if that's what's provided
    grammar: item.position,
    culturalComment: item.cultural_context
  }));

  const fullText = (data.original_text || []).join(' ');
  const translation = data.literary_translation || '';

  // Since we don't have timing, we use a single block for the whole clip (0-60s)
  return [{
    id: 1,
    start: 0,
    end: 60,
    text: fullText,
    translation: translation,
    artisticTranslation: translation,
    words: words
  }];
}

/**
 * Handles the Markdown format found in files like ep01_01.md
 */
function parseMarkdownFormat(content: string): SubtitleBlock[] {
  const blocks: SubtitleBlock[] = [];
  const replicaRegex = /#### Реплика \d+: (.*)/g;
  const wordRegex = /- \*\*(.*?)\*\*\n\s+1\. \*\*Начальная форма:\*\* (.*?)\n\s+2\. \*\*Частицы\/изменения:\*\* (.*?)\n\s+3\. \*\*Позиция:\*\* (.*?)\n(?:\s+4\. \*\*Идиома:\*\* (.*?)\n)?(?:\s+5\. \*\*Контекст:\*\* (.*?)\n)?/g;

  let match;
  let wordMatch;
  let blockId = 1;

  // This is a simplified parser for the specific MD format seen in ep01_01.md
  // We'll split the content by "#### Реплика"
  const replicas = content.split(/#### Реплика \d+: /).slice(1);
  const titles = content.match(/#### Реплика \d+: (.*)/g) || [];

  replicas.forEach((replicaContent, index) => {
    const title = titles[index]?.replace(/#### Реплика \d+: /, '') || '';
    const words: SubtitleWord[] = [];

    // Parse words in this replica
    const wordBlocks = replicaContent.split(/- \*\*/).slice(1);
    wordBlocks.forEach(wordBlock => {
        const text = wordBlock.split(/\*\*/)[0].trim();
        const baseForm = wordBlock.match(/\*\*Начальная форма:\*\* (.*)/)?.[1]?.trim();
        const particles = wordBlock.match(/\*\*Частицы\/изменения:\*\* (.*)/)?.[1]?.trim();
        const position = wordBlock.match(/\*\*Позиция:\*\* (.*)/)?.[1]?.trim();
        const idiom = wordBlock.match(/\*\*Идиома:\*\* (.*)/)?.[1]?.trim();
        const context = wordBlock.match(/\*\*Контекст:\*\* (.*)/)?.[1]?.trim();

        words.push({
            text,
            baseForm,
            translation: particles,
            grammar: position,
            culturalComment: (idiom && idiom !== 'Нет') ? `Идиома: ${idiom}. ${context || ''}` : context
        });
    });

    blocks.push({
      id: blockId++,
      start: index * 5, // Arbitrary 5s spacing if timing is missing
      end: (index + 1) * 5,
      text: title,
      words: words
    });
  });

  return blocks;
}
