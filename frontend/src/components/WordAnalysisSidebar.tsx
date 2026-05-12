import React from 'react';
import { Bookmark, CheckCircle2, Sparkles, BookOpen, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import type { SubtitleWord } from '../types/media';

interface WordAnalysisSidebarProps {
  /** The currently selected/hovered word, or null if none */
  word: SubtitleWord | null;
  savedWords: Set<string>;
  isGenerating: boolean;
  /** Optional phrase-level translation shown at the bottom */
  phraseTranslation?: string;
  onSave: (wordText: string) => void;
  onGenerate: () => void;
  /** Text shown in the empty state body */
  emptyHint?: string;
}

/**
 * The right-panel word dictionary/breakdown sidebar.
 * Shared across LocalMediaPlayer, VideoPlayer, Player (music).
 * Shows word info (base form, translation, grammar, particles, AI note)
 * and a bottom strip with phrase translation.
 */
export default function WordAnalysisSidebar({
  word,
  savedWords,
  isGenerating,
  phraseTranslation,
  onSave,
  onGenerate,
  emptyHint = 'Выберите любое слово в тексте, чтобы увидеть детальный разбор и перевод.',
}: WordAnalysisSidebarProps) {
  const isSaved = word ? savedWords.has(word.text) : false;

  return (
    <div className="h-full flex flex-col bg-[#161618]/95 backdrop-blur-2xl">
      {word ? (
        <div className="p-6 flex-1 flex flex-col overflow-y-auto scrollbar-hide animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Word header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-4xl font-bold font-korean text-white mb-2 leading-tight">
                {word.baseForm || word.text}
              </h2>
              <p className="text-xl text-brand-cyan font-medium">
                {word.translation || 'Слово не найдено'}
              </p>
            </div>
            <button
              onClick={() => onSave(word.text)}
              aria-label={isSaved ? 'Удалить из словаря' : 'Сохранить в словарь'}
              className={cn(
                'p-2.5 rounded-xl border transition-all duration-300 shrink-0',
                isSaved
                  ? 'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan shadow-[0_0_15px_rgba(112,161,215,0.15)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-brand-cyan'
              )}
            >
              {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
          </div>

          {/* Info cards */}
          <div className="space-y-4 flex-1">
            <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800/50 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">
                Грамматический разбор
              </p>
              <p className="text-slate-300 leading-relaxed">
                {word.grammar || 'Разбор недоступен.'}
              </p>
              {word.particles && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50 border-dashed">
                  <span className="text-sm text-slate-500">Частицы / Морфемы:</span>
                  <span className="text-brand-cyan font-korean font-medium">{word.particles}</span>
                </div>
              )}
            </div>

            <div className="bg-brand-cyan/5 rounded-2xl p-4 border border-brand-cyan/20">
              <p className="text-xs text-brand-cyan uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                ИИ Разбор контекста
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                {word.culturalComment ||
                  `Здесь может быть разбор использования слова ${word.text} в данном контексте.`}
              </p>
            </div>

            {/* AI Generate button */}
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full px-6 py-3 bg-brand-cyan/10 hover:bg-brand-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed text-brand-cyan font-medium rounded-xl transition-all border border-brand-cyan/20 flex items-center justify-center gap-2 mt-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-t-2 border-brand-cyan rounded-full animate-spin" />
                  Анализируем...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI разбор
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-6 flex flex-col justify-center items-center text-center text-slate-500">
          <div className="w-20 h-20 mb-6 rounded-3xl bg-slate-900 flex items-center justify-center">
            <BookOpen className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-lg font-bold text-slate-300 mb-2">Словарь</h3>
          <p className="text-sm max-w-[200px] leading-relaxed">{emptyHint}</p>
        </div>
      )}

      {/* Phrase translation strip at the bottom */}
      {phraseTranslation !== undefined && (
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/30 flex-shrink-0">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 font-semibold flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            Значение фразы
          </p>
          <p className="text-sm text-slate-300 italic leading-relaxed">
            {phraseTranslation || 'Выберите строку для просмотра значения'}
          </p>
        </div>
      )}
    </div>
  );
}
