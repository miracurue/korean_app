import { Router, Request, Response } from 'express';

const router = Router();

// ============================================================
// Types for the structured translation response
// ============================================================
interface WordAnalysis {
  word_in_text: string;
  base_form: string;
  particles_changes: string;
  position: string;
  idiom: string | null;
  cultural_context: string | null;
  context_translation?: string;
  char_start?: number;
  char_end?: number;
  grammar_note?: string;
}

interface FragmentData {
  original_text: string;
  translated_text?: string;
  vocabulary_analysis: WordAnalysis[];
}

interface TranslationRequest {
  fragments: FragmentData[];
  context_prompt?: string;
  series_title: string;
  episode_number: string;
  video_id: string;
}

// ============================================================
// POST /api/admin/translate — Proxy to z.ai Chat Completion API
// ============================================================
router.post('/translate', async (req: Request, res: Response) => {
  const { fragments, context_prompt, series_title, episode_number } = req.body as TranslationRequest;

  if (!fragments || !Array.isArray(fragments) || fragments.length === 0) {
    res.status(400).json({ error: 'fragments array is required' });
    return;
  }

  const ZAI_API_KEY = process.env.ZAI_API_KEY;
  if (!ZAI_API_KEY) {
    res.status(500).json({ error: 'ZAI_API_KEY not configured' });
    return;
  }

  // Build the user message with all original texts
  const originalTexts = fragments.map((f, i) => `${i + 1}. ${f.original_text}`).join('\n');

  const contextSection = context_prompt
    ? `\n\nДополнительный контекст для перевода:\n${context_prompt}`
    : '';

  const userMessage = `Серия: ${series_title}, эпизод ${episode_number}

Корейские фразы для анализа:
${originalTexts}${contextSection}`;

  // System prompt requesting structured JSON response
  const systemPrompt = `Ты — эксперт по корейскому языку и культуре. Твоя задача — выполнить подробный лингвистический анализ корейских фраз и перевести их на русский язык.

ВАЖНО: Ответ должен быть ТОЛЬКО валидным JSON, без markdown-обёрток, без пояснений до или после JSON.

Формат ответа — строго JSON:
{
  "character": "Имя персонажа или описание (если можно определить из контекста)",
  "original_text": ["фраза 1", "фраза 2"],
  "vocabulary_analysis": [
    {
      "word_in_text": "слово как в тексте",
      "base_form": "начальная форма (словарная)",
      "particles_changes": "описание частиц, суффиксов, окончаний",
      "position": "синтаксическая роль (Подлежащее, Сказуемое, Дополнение, Обстоятельство, Определение, Обращение и т.д.)",
      "idiom": "идиома или null",
      "cultural_context": "культурный комментарий или null"
    }
  ],
  "literary_translation": "Художественный литературный перевод всех фраз целиком, с сохранением стилистики и эмоциональных оттенков. Каждый персонаж на новой строке с именем."
}

Правила:
1. Разбери КАЖДОЕ значимое слово (существительные, глаголы, прилагательные, наречия, частицы). Союзы и междометия тоже включай.
2. В base_form указывай словарную форму с кратким русским значением в скобках, например: "멋지다 (привлекательный, шикарный)".
3. В particles_changes подробно описывай все грамматические элементы: суффиксы уважения (-시-), стили вежливости (-ㅂ니다, -어요), падежные частицы (-은/는, -이/가, -을/를, -에, -에서, -으로), окончания прошедшего времени (-었-/-았-) и т.д.
4. В cultural_context указывай культурные особенности использования слова в контексте дорамы, исторические нюансы обращения (например: 나리, 아뢰다), если уместно.
5. В position указывай синтаксическую роль слова в предложении.
6. literary_translation должен быть живым, литературным русским переводом с именами персонажей.`;

  try {
    const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.ZAI_MODEL || 'glm-5.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 16384,
      }),
      signal: AbortSignal.timeout(180000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('z.ai API error:', response.status, errorText);
      res.status(response.status).json({ error: `z.ai API error: ${response.status}`, details: errorText });
      return;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      res.status(502).json({ error: 'Empty response from z.ai' });
      return;
    }

    // Try to parse JSON from the response
    let parsed: Record<string, unknown>;
    try {
      // Remove possible markdown code block wrappers
      const cleaned = content.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Try to recover truncated JSON by closing unclosed brackets
      try {
        const cleaned = content.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
        let recovered = cleaned;
        // Remove trailing incomplete content (unfinished string/value)
        recovered = recovered.replace(/"[^"\\]*$/, '');
        recovered = recovered.replace(/,\s*$/, '');
        // Count unclosed brackets and close them
        const openBraces = (recovered.match(/\{/g) || []).length;
        const closeBraces = (recovered.match(/\}/g) || []).length;
        const openBrackets = (recovered.match(/\[/g) || []).length;
        const closeBrackets = (recovered.match(/\]/g) || []).length;
        for (let i = 0; i < openBrackets - closeBrackets; i++) recovered += ']';
        for (let i = 0; i < openBraces - closeBraces; i++) recovered += '}';
        parsed = JSON.parse(recovered);
        console.warn('Recovered truncated JSON from z.ai response');
      } catch {
        res.status(200).json({ raw: content, error: 'Failed to parse JSON from z.ai response' });
        return;
      }
    }

    res.json({ ...parsed, usage: data.usage || null });
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({ error: 'Internal server error during translation' });
  }
});

// ============================================================
// POST /api/admin/fragments/save — Save translated data to DB
// ============================================================
router.post('/fragments/save', async (req: Request, res: Response) => {
  const { video_id, series_title, episode_number, video_url, fragments_data } = req.body as {
    video_id: string;
    series_title: string;
    episode_number: string;
    video_url: string;
    fragments_data: Array<{
      original_text: string;
      translated_text?: string;
      cultural_comment?: string;
      idioma?: string;
      time_start?: string;
      time_end?: string;
      vocabulary_analysis: Array<{
        word_in_text: string;
        base_form: string;
        particles_changes?: string;
        position?: string;
        idiom?: string | null;
        cultural_context?: string | null;
        context_translation?: string;
        char_start?: number;
        char_end?: number;
        grammar_note?: string;
      }>;
    }>;
  };

  if (!video_id || !fragments_data) {
    res.status(400).json({ error: 'video_id and fragments_data are required' });
    return;
  }

  const client = await (await import('../db/connection.js')).pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert/update video record
    await client.query(
      `INSERT INTO videos (id, series_title, episode_number, video_url, tags)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         series_title = EXCLUDED.series_title,
         episode_number = EXCLUDED.episode_number,
         video_url = EXCLUDED.video_url,
         tags = EXCLUDED.tags`,
      [video_id, series_title, episode_number, video_url || '', 'k-drama']
    );

    const savedFragments: string[] = [];
    let wordCount = 0;

    for (let i = 0; i < fragments_data.length; i++) {
      const frag = fragments_data[i];

      // Generate fragment ID
      const fragmentId = `${video_id}_F${String(i + 1).padStart(3, '0')}`;

      // 2. Insert fragment
      await client.query(
        `INSERT INTO fragments (id, video_id, time_start, time_end, original_text, translated_text, cultural_comment, idioma)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           original_text = EXCLUDED.original_text,
           translated_text = EXCLUDED.translated_text,
           cultural_comment = EXCLUDED.cultural_comment,
           idioma = EXCLUDED.idioma`,
        [
          fragmentId,
          video_id,
          frag.time_start || '00:00:00',
          frag.time_end || '00:00:00',
          frag.original_text,
          frag.translated_text || null,
          frag.cultural_comment || null,
          frag.idioma || null,
        ]
      );

      // 3. Process vocabulary analysis
      if (frag.vocabulary_analysis && Array.isArray(frag.vocabulary_analysis)) {
        // Calculate char positions from original_text
        let charPos = 0;
        for (const word of frag.vocabulary_analysis) {
          const startIdx = frag.original_text.indexOf(word.word_in_text, charPos);
          const cStart = startIdx >= 0 ? startIdx : charPos;
          const cEnd = startIdx >= 0 ? cStart + word.word_in_text.length : charPos + word.word_in_text.length;

          if (startIdx >= 0) {
            charPos = cEnd;
          }

          // Generate dictionary ID from base_form
          const dictId = `W${hashString(word.base_form)}`;

          // 4. Insert dictionary entry (upsert)
          const existingDict = await client.query(
            'SELECT id, translations FROM dictionary WHERE id = $1',
            [dictId]
          );

          if (existingDict.rows.length === 0) {
            await client.query(
              `INSERT INTO dictionary (id, base_word, translations)
               VALUES ($1, $2, $3)`,
              [
                dictId,
                word.base_form.split(' (')[0], // Remove Russian translation in parentheses
                JSON.stringify(extractTranslations(word)),
              ]
            );
          }

          // 5. Insert fragment_word
          await client.query(
            `INSERT INTO fragment_words (fragment_id, dictionary_id, word_in_text, char_start, char_end, context_translation, grammar_note, position)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              fragmentId,
              dictId,
              word.word_in_text,
              word.char_start ?? cStart,
              word.char_end ?? cEnd,
              word.context_translation || extractTranslations(word)[0] || null,
              word.grammar_note || word.particles_changes || null,
              word.position || null,
            ]
          );

          wordCount++;
        }
      }

      savedFragments.push(fragmentId);
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      video_id,
      fragments_saved: savedFragments.length,
      words_saved: wordCount,
      fragment_ids: savedFragments,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Save fragments error:', err);
    res.status(500).json({ error: 'Failed to save fragments to database', details: String(err) });
  } finally {
    client.release();
  }
});

// ============================================================
// POST /api/admin/upload/video — Upload video (stub for future S3)
// ============================================================
router.post('/upload/video', (_req: Request, res: Response) => {
  res.json({ message: 'Video upload to S3 — not implemented yet. Files will be stored locally.' });
});

// Helper: simple hash for generating IDs
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(4, '0').slice(0, 4);
}

// Helper: extract translations from word analysis
function extractTranslations(word: {
  base_form: string;
  context_translation?: string;
}): string[] {
  const translations: string[] = [];

  // Extract Russian translation from base_form like "멋지다 (привлекательный, шикарный)"
  const match = word.base_form.match(/\(([^)]+)\)/);
  if (match) {
    translations.push(...match[1].split(',').map(t => t.trim()));
  }

  if (word.context_translation) {
    translations.push(word.context_translation);
  }

  return translations.length > 0 ? translations : [''];
}

export default router;