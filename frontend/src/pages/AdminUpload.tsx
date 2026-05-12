import { useState, useCallback, useRef } from 'react';
import {
  FileVideo,
  FileText,
  Languages,
  Save,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  FileAudio,
  Subtitles,
} from 'lucide-react';
import { parseSrtVtt } from '../lib/subtitleParser';
import type { SubtitleBlock } from '../types/media';

// ============================================================
// Types
// ============================================================
interface TranslationResult {
  character?: string;
  original_text?: string[];
  vocabulary_analysis?: Array<{
    word_in_text: string;
    base_form: string;
    particles_changes?: string;
    position?: string;
    idiom?: string | null;
    cultural_context?: string | null;
  }>;
  literary_translation?: string;
  raw?: string;
  error?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    completion_tokens_details?: {
      reasoning_tokens?: number;
    };
  };
}

// ============================================================
// Helper: format seconds → HH:MM:SS
// ============================================================
function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ============================================================
// Component
// ============================================================
export default function AdminUpload() {
  // MP4 file (name only, no server upload yet)
  const [mp4FileName, setMp4FileName] = useState<string>('');
  const mp4InputRef = useRef<HTMLInputElement>(null);

  // SRT file — parsed into blocks with timing
  const [srtFileName, setSrtFileName] = useState<string>('');
  const [srtBlocks, setSrtBlocks] = useState<SubtitleBlock[]>([]);
  const srtInputRef = useRef<HTMLInputElement>(null);

  // Context file
  const [contextContent, setContextContent] = useState<string>('');
  const contextInputRef = useRef<HTMLInputElement>(null);

  // Meta fields
  const [seriesTitle, setSeriesTitle] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState('');

  // Translation state
  const [translating, setTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [translationError, setTranslationError] = useState<string>('');

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  // ============================================================
  // MP4 file handler (name only)
  // ============================================================
  const handleMp4Select = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMp4FileName(file.name);
    }
  }, []);

  // ============================================================
  // SRT file handler — parse immediately
  // ============================================================
  const handleSrtSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const blocks = parseSrtVtt(text);
      setSrtBlocks(blocks);
      setSrtFileName(file.name);
      // Reset previous results
      setTranslationResult(null);
      setTranslationError('');
      setSaveResult(null);
    } catch {
      console.error('Failed to parse SRT file');
      setTranslationError('Ошибка чтения SRT файла');
    }
  }, []);

  // ============================================================
  // Context file handler
  // ============================================================
  const handleContextFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setContextContent(text);
    } catch {
      console.error('Failed to read context file');
    }
  }, []);

  // ============================================================
  // Generate translation — send only text, no timestamps
  // ============================================================
  const handleTranslate = useCallback(async () => {
    if (srtBlocks.length === 0) {
      setTranslationError('Загрузите SRT файл с субтитрами');
      return;
    }

    if (!seriesTitle.trim()) {
      setTranslationError('Укажите название сериала');
      return;
    }

    if (!episodeNumber.trim()) {
      setTranslationError('Укажите номер эпизода');
      return;
    }

    setTranslating(true);
    setTranslationError('');
    setTranslationResult(null);
    setSaveResult(null);

    try {
      // Send ONLY text content (no timestamps / no cue numbers) to the AI
      const fragments = srtBlocks.map(block => ({
        original_text: block.text,
        vocabulary_analysis: [],
      }));

      const response = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fragments,
          context_prompt: contextContent || undefined,
          series_title: seriesTitle,
          episode_number: episodeNumber,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const result: TranslationResult = await response.json();
      setTranslationResult(result);
    } catch (err) {
      setTranslationError(err instanceof Error ? err.message : 'Ошибка перевода');
    } finally {
      setTranslating(false);
    }
  }, [srtBlocks, contextContent, seriesTitle, episodeNumber]);

  // ============================================================
  // Save to database — include SRT timestamps
  // ============================================================
  const handleSave = useCallback(async () => {
    if (!translationResult) return;

    const videoId = `V${Date.now().toString(36).toUpperCase()}`;

    // Build fragments from SRT blocks + translation result
    const originalTexts = translationResult.original_text || [];
    const literaryTrans = translationResult.literary_translation || '';
    const transLines = literaryTrans.split('\n').filter(l => l.trim());

    const fragmentsData = originalTexts.map((text, i) => {
      const block = srtBlocks[i]; // match by index — same order
      return {
        original_text: text,
        translated_text: transLines[i] || literaryTrans,
        cultural_comment: '',
        idioma: '',
        time_start: block ? formatSeconds(block.start) : '00:00:00',
        time_end: block ? formatSeconds(block.end) : '00:00:00',
        vocabulary_analysis: translationResult.vocabulary_analysis || [],
      };
    });

    setSaving(true);
    setSaveResult(null);

    try {
      const response = await fetch('/api/admin/fragments/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: videoId,
          series_title: seriesTitle,
          episode_number: episodeNumber,
          video_url: mp4FileName,
          fragments_data: fragmentsData,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSaveResult({
          success: true,
          message: `Сохранено: ${result.fragments_saved} фрагментов, ${result.words_saved} слов (video_id: ${result.video_id})`,
        });
      } else {
        setSaveResult({
          success: false,
          message: result.error || 'Ошибка сохранения',
        });
      }
    } catch (err) {
      setSaveResult({
        success: false,
        message: err instanceof Error ? err.message : 'Ошибка сети',
      });
    } finally {
      setSaving(false);
    }
  }, [translationResult, srtBlocks, mp4FileName, seriesTitle, episodeNumber]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 flex items-center justify-center">
          <Upload className="w-7 h-7 text-brand-cyan" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Загрузка медиа
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Загрузка видео (.mp4) и субтитров (.srt) с ИИ-переводом
          </p>
        </div>
      </div>

      {/* Meta fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Название сериала
          </label>
          <input
            type="text"
            value={seriesTitle}
            onChange={e => setSeriesTitle(e.target.value)}
            placeholder="Например: Токкэби"
            className="w-full px-4 py-2.5 bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Номер эпизода
          </label>
          <input
            type="text"
            value={episodeNumber}
            onChange={e => setEpisodeNumber(e.target.value)}
            placeholder="01"
            className="w-full px-4 py-2.5 bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan transition-colors"
          />
        </div>
      </div>

      {/* File upload areas — MP4 + SRT side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MP4 upload area */}
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <FileVideo className="w-5 h-5 text-brand-cyan" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Видео</h3>
            </div>
            <button
              onClick={() => mp4InputRef.current?.click()}
              className="px-4 py-2 bg-brand-cyan/10 text-brand-cyan rounded-xl font-medium hover:bg-brand-cyan/20 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Выбрать
            </button>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Выберите .mp4 файл видео. Файл пока не загружается на сервер — используется только имя.
          </p>

          <input
            ref={mp4InputRef}
            type="file"
            accept=".mp4"
            className="hidden"
            onChange={handleMp4Select}
          />

          {mp4FileName && (
            <div className="mt-3 flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileVideo className="w-4 h-4 text-brand-cyan" />
                <span className="text-sm text-slate-900 dark:text-white font-medium">{mp4FileName}</span>
              </div>
              <button
                onClick={() => setMp4FileName('')}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* SRT upload area */}
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Subtitles className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Субтитры</h3>
            </div>
            <button
              onClick={() => srtInputRef.current?.click()}
              className="px-4 py-2 bg-brand-gold/10 text-brand-gold rounded-xl font-medium hover:bg-brand-gold/20 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Выбрать
            </button>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Выберите .srt файл с корейскими субтитрами. Файл будет распарсен — в нейронку отправится только текст без таймкодов.
          </p>

          <input
            ref={srtInputRef}
            type="file"
            accept=".srt"
            className="hidden"
            onChange={handleSrtSelect}
          />

          {srtFileName && (
            <div className="mt-3 flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-gold" />
                <span className="text-sm text-slate-900 dark:text-white font-medium">{srtFileName}</span>
                <span className="text-xs text-slate-500">({srtBlocks.length} блоков)</span>
              </div>
              <button
                onClick={() => {
                  setSrtFileName('');
                  setSrtBlocks([]);
                  setTranslationResult(null);
                }}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Preview parsed blocks */}
          {srtBlocks.length > 0 && (
            <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
              {srtBlocks.slice(0, 20).map((block, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800/30 rounded"
                >
                  <span className="text-slate-400 font-mono shrink-0">
                    {formatSeconds(block.start)}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{block.text}</span>
                </div>
              ))}
              {srtBlocks.length > 20 && (
                <p className="text-xs text-slate-400 text-center">
                  ... и ещё {srtBlocks.length - 20} блоков
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Context file */}
      <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-brand-gold" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Контекст для перевода
            </h3>
          </div>
          <button
            onClick={() => contextInputRef.current?.click()}
            className="px-4 py-2 bg-brand-gold/10 text-brand-gold rounded-xl font-medium hover:bg-brand-gold/20 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Добавить контекст
          </button>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Текстовый файл с дополнительным контекстом (описание сцены, персонажи, стиль) для более точного перевода.
        </p>

        <input
          ref={contextInputRef}
          type="file"
          className="hidden"
          accept=".txt,.md"
          onChange={handleContextFile}
        />

        {contextContent && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-brand-gold">Контекст загружен</span>
              <button
                onClick={() => setContextContent('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
              {contextContent.slice(0, 500)}
              {contextContent.length > 500 ? '...' : ''}
            </pre>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleTranslate}
          disabled={translating || srtBlocks.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-cyan text-white font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {translating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Генерация перевода...
            </>
          ) : (
            <>
              <Languages className="w-5 h-5" />
              Сгенерировать перевод
            </>
          )}
        </button>

        {translationResult && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Сохранить в БД
              </>
            )}
          </button>
        )}
      </div>

      {/* Token usage */}
      {translationResult?.usage && (
        <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm">
          <span className="text-blue-600 dark:text-blue-300 font-medium">📊 Токены:</span>
          <span className="text-slate-700 dark:text-slate-300">
            Входные: <strong>{translationResult.usage.prompt_tokens?.toLocaleString() ?? '—'}</strong>
          </span>
          <span className="text-slate-700 dark:text-slate-300">
            Выходные: <strong>{translationResult.usage.completion_tokens?.toLocaleString() ?? '—'}</strong>
          </span>
          {translationResult.usage.completion_tokens_details?.reasoning_tokens ? (
            <span className="text-slate-700 dark:text-slate-300">
              Обдумывание: <strong>{translationResult.usage.completion_tokens_details.reasoning_tokens.toLocaleString()}</strong>
            </span>
          ) : null}
          <span className="text-slate-700 dark:text-slate-300">
            Итого: <strong>{translationResult.usage.total_tokens?.toLocaleString() ?? '—'}</strong>
          </span>
        </div>
      )}

      {/* Error */}
      {translationError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{translationError}</p>
        </div>
      )}

      {/* Save result */}
      {saveResult && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            saveResult.success
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}
        >
          {saveResult.success ? (
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <p className={`text-sm ${saveResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
            {saveResult.message}
          </p>
        </div>
      )}

      {/* Translation result preview */}
      {translationResult && (
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Languages className="w-5 h-5 text-brand-cyan" />
            Результат перевода
          </h3>

          {/* Literary translation */}
          {translationResult.literary_translation && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Литературный перевод
              </h4>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-900 dark:text-white whitespace-pre-wrap">
                {translationResult.literary_translation}
              </div>
            </div>
          )}

          {/* Character */}
          {translationResult.character && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Персонаж
              </h4>
              <p className="text-slate-900 dark:text-white">{translationResult.character}</p>
            </div>
          )}

          {/* Original texts */}
          {translationResult.original_text && translationResult.original_text.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Оригинальные фразы
              </h4>
              <div className="space-y-1">
                {translationResult.original_text.map((t, i) => (
                  <p key={i} className="text-slate-900 dark:text-white font-medium">
                    {t}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary analysis */}
          {translationResult.vocabulary_analysis &&
            translationResult.vocabulary_analysis.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Пословный анализ ({translationResult.vocabulary_analysis.length} слов)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-2 px-2 text-slate-500">Слово</th>
                        <th className="text-left py-2 px-2 text-slate-500">Базовая форма</th>
                        <th className="text-left py-2 px-2 text-slate-500">Грамматика</th>
                        <th className="text-left py-2 px-2 text-slate-500">Роль</th>
                        <th className="text-left py-2 px-2 text-slate-500">Культура</th>
                      </tr>
                    </thead>
                    <tbody>
                      {translationResult.vocabulary_analysis.map((w, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-100 dark:border-slate-800"
                        >
                          <td className="py-2 px-2 font-medium text-slate-900 dark:text-white">
                            {w.word_in_text}
                          </td>
                          <td className="py-2 px-2 text-slate-600 dark:text-slate-300">
                            {w.base_form}
                          </td>
                          <td className="py-2 px-2 text-slate-600 dark:text-slate-300 text-xs max-w-[200px]">
                            {w.particles_changes}
                          </td>
                          <td className="py-2 px-2 text-slate-600 dark:text-slate-300">
                            {w.position}
                          </td>
                          <td className="py-2 px-2 text-xs text-slate-500 dark:text-slate-400 max-w-[200px]">
                            {w.cultural_context || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {/* Raw JSON toggle */}
          <details className="mt-4">
            <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
              Показать JSON
            </summary>
            <pre className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-300 overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(translationResult, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Audio & Text placeholders — hidden tabs info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col items-center justify-center py-10 text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl">
          <FileAudio className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-sm font-medium">Загрузка аудио — в разработке</p>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl">
          <FileText className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-sm font-medium">Загрузка текстов — в разработке</p>
        </div>
      </div>
    </div>
  );
}