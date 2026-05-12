import React from 'react';
import { Sparkles, Subtitles } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatTime } from '../lib/formatTime';
import type { SubtitleBlock, SubtitleWord } from '../types/media';

interface SubtitleListProps {
  subtitles: SubtitleBlock[];
  activeIndex: number;
  hoveredWord: SubtitleWord | null;
  savedWords: Set<string>;
  isTranslatingAll: boolean;
  onSeek: (time: number) => void;
  onWordClick: (e: React.MouseEvent, word: SubtitleWord) => void;
  onTranslateAll: () => void;
  /** Ref forwarded to the scrollable container for auto-scroll */
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Scrollable list of timestamped subtitle lines with interactive word tokens.
 * Shared between LocalMediaPlayer (video) and LocalMediaPlayer (audio) modes.
 * Active line is highlighted and auto-scrolled into view by the parent via containerRef.
 */
export default function SubtitleList({
  subtitles,
  activeIndex,
  hoveredWord,
  savedWords,
  isTranslatingAll,
  onSeek,
  onWordClick,
  onTranslateAll,
  containerRef,
}: SubtitleListProps) {
  if (subtitles.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-30 text-white">
        <Subtitles className="w-12 h-12 mb-4" />
        <p className="text-lg">Субтитры не загружены</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full overflow-y-auto scrollbar-hide px-6 pt-6 pb-24">
      <div className="max-w-4xl mx-auto flex flex-col">
        {/* Translate-all button */}
        <div className="mb-4 flex justify-center">
          <button
            onClick={onTranslateAll}
            disabled={isTranslatingAll}
            className={cn(
              'flex items-center gap-2 px-6 py-2 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-full text-sm font-medium hover:bg-brand-cyan/20 transition-all',
              isTranslatingAll && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isTranslatingAll ? (
              <>
                <div className="w-4 h-4 border-t-2 border-brand-cyan rounded-full animate-spin" />
                Переводим...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Перевести все субтитры
              </>
            )}
          </button>
        </div>

        {/* Subtitle rows */}
        {subtitles.map((sub, idx) => {
          const isActive = activeIndex === idx;
          const isPast = activeIndex > idx;

          return (
            <div
              key={sub.id}
              data-idx={idx}
              className={cn(
                'mb-6 md:mb-8 transition-all duration-300 origin-left relative flex gap-4 pr-4',
                isActive
                  ? 'opacity-100 scale-[1.02] translate-x-2 bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl -ml-4 pl-4 py-3'
                  : isPast
                    ? 'opacity-30 hover:opacity-60'
                    : 'opacity-60 hover:opacity-80'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-brand-cyan rounded-full shadow-[0_0_10px_rgba(112,161,215,0.5)]" />
              )}

              {/* Timestamp seek button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(sub.start);
                }}
                className={cn(
                  'shrink-0 h-fit px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all mt-1.5 cursor-pointer',
                  isActive
                    ? 'bg-brand-cyan text-white shadow-[0_0_10px_rgba(112,161,215,0.3)]'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                )}
              >
                {formatTime(sub.start)}
              </button>

              <div className="flex-1 min-w-0">
                {/* Korean words */}
                <div
                  className="flex flex-wrap gap-x-1 gap-y-1 mb-1.5 cursor-pointer"
                  onClick={() => onSeek(sub.start)}
                >
                  {sub.words.map((word, wIdx) => {
                    const isSaved = savedWords.has(word.text);
                    const isWordHovered = hoveredWord?.text === word.text;

                    return (
                      <span
                        key={wIdx}
                        onClick={(e) => onWordClick(e, word)}
                        className={cn(
                          'text-base font-medium transition-all duration-200 rounded px-1 -mx-0.5 border border-transparent font-korean cursor-pointer hover:bg-brand-cyan/20 hover:text-brand-cyan',
                          isWordHovered
                            ? 'bg-brand-cyan/30 text-white font-bold'
                            : isActive
                              ? 'text-white'
                              : 'text-white/90',
                          isSaved && 'text-brand-cyan border-b-2 border-brand-cyan/50 pb-0.5'
                        )}
                      >
                        {word.text}
                      </span>
                    );
                  })}
                </div>

                {/* Phrase translation (if available) */}
                {sub.translation && (
                  <div
                    className={cn(
                      'text-[13px] font-medium transition-colors duration-300',
                      isActive ? 'text-brand-cyan/80' : 'text-white/60'
                    )}
                  >
                    {sub.translation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
