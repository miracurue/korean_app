import { Router, Request, Response } from 'express';
import { query } from '../db/connection.js';

const router = Router();

// ============================================================
// GET /api/dramas — List all videos grouped by series
// ============================================================
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT id, series_title, episode_number, video_url, tags, created_at
       FROM videos
       ORDER BY series_title, episode_number`
    );

    // Group by series_title to create drama cards
    const grouped = new Map<string, {
      series_title: string;
      tags: string | null;
      episodes: typeof result.rows;
    }>();

    for (const row of result.rows) {
      const key = row.series_title;
      if (!grouped.has(key)) {
        grouped.set(key, {
          series_title: row.series_title,
          tags: row.tags,
          episodes: [],
        });
      }
      grouped.get(key)!.episodes.push(row);
    }

    const dramas = Array.from(grouped.entries()).map(([title, data]) => ({
      title,
      tags: data.tags,
      episodes: data.episodes.map((ep) => ({
        id: ep.id,
        series_title: ep.series_title,
        episode_number: ep.episode_number,
        video_url: ep.video_url,
      })),
    }));

    res.json(dramas);
  } catch (err) {
    console.error('GET /api/dramas error:', err);
    res.status(500).json({ error: 'Failed to fetch dramas' });
  }
});

// ============================================================
// GET /api/dramas/:videoId/fragments — Subtitles with word analysis
// ============================================================
router.get('/:videoId/fragments', async (req: Request, res: Response) => {
  const { videoId } = req.params;

  try {
    // Check video exists
    const videoResult = await query(
      'SELECT id, series_title, episode_number, video_url, tags FROM videos WHERE id = $1',
      [videoId]
    );

    if (videoResult.rows.length === 0) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    const video = videoResult.rows[0];

    // Get fragments with word analysis
    const fragmentsResult = await query(
      `SELECT
        f.id AS fragment_id,
        f.time_start,
        f."time_end",
        f.original_text,
        f.translated_text,
        f.cultural_comment,
        f.idioma,
        json_agg(
          json_build_object(
            'word_in_text', fw.word_in_text,
            'base_word', d.base_word,
            'translations', d.translations,
            'context_translation', fw.context_translation,
            'grammar_note', fw.grammar_note,
            'position', fw.position,
            'char_start', fw.char_start,
            'char_end', fw.char_end
          ) ORDER BY fw.id
        ) AS words
      FROM fragments f
      LEFT JOIN fragment_words fw ON fw.fragment_id = f.id
      LEFT JOIN dictionary d ON d.id = fw.dictionary_id
      WHERE f.video_id = $1
      GROUP BY f.id
      ORDER BY f.time_start`,
      [videoId]
    );

    // Filter out null words (when LEFT JOIN finds no fragment_words)
    const fragments = fragmentsResult.rows.map((row: any) => ({
      ...row,
      words: (row.words || []).filter((w: any) => w.word_in_text !== null),
    }));

    res.json({ video, fragments });
  } catch (err) {
    console.error(`GET /api/dramas/${videoId}/fragments error:`, err);
    res.status(500).json({ error: 'Failed to fetch fragments' });
  }
});

export default router;