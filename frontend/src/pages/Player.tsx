import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bookmark, CheckCircle2, BookOpen, MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatTime } from '../lib/formatTime';
import { parseLrc } from '../lib/subtitleParser';
import { MUSIC } from '../data/music';
import { useProgress } from '../lib/useProgress';
import type { SubtitleBlock, SubtitleWord } from '../types/media';
import PageHeader from '../components/PageHeader';
import WordAnalysisSidebar from '../components/WordAnalysisSidebar';

export default function Player() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const song = MUSIC.find(m => m.id === Number(id));

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [subtitles, setSubtitles] = useState<SubtitleBlock[]>([]);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(-1);
  const [hoveredWord, setHoveredWord] = useState<SubtitleWord | null>(null);
  const [volume, setVolume] = useState(1);
  const [hasLrc, setHasLrc] = useState(true);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const { saveProgress } = useProgress('audio');
  const lastSaveTime = useRef(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!song) return;

    if (song.lrcUrl) {
      fetch(song.lrcUrl)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load LRC');
          return res.text();
        })
        .then(text => {
          setSubtitles(parseLrc(text));
          setHasLrc(true);
        })
        .catch(() => {
          setSubtitles([]);
          setHasLrc(false);
        });
    } else {
      setSubtitles([]);
      setHasLrc(false);
    }
  }, [song]);

  useEffect(() => {
    if (audioRef.current) {
      isPlaying
        ? audioRef.current.play().catch(() => setIsPlaying(false))
        : audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const time = audioRef.current.currentTime;
    setCurrentTime(time);

    if (song) {
      const now = Date.now();
      if (now - lastSaveTime.current > 3000) {
        saveProgress({
          id: song.id,
          title: song.title,
          source: song.artist,
          timestamp: time,
          duration: audioRef.current.duration || 0,
          isLocal: id === 'local',
        });
        lastSaveTime.current = now;
      }
    }

    const index = subtitles.findIndex(sub => time >= sub.start && time < sub.end);
    if (index !== -1 && index !== activeSubtitleIndex) {
      setActiveSubtitleIndex(index);
      if (lyricsContainerRef.current) {
        const activeEl = lyricsContainerRef.current.children[index] as HTMLElement;
        activeEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (index === -1) {
      const isPastLast =
        subtitles.length > 0 && time >= subtitles[subtitles.length - 1].start;
      if (isPastLast && activeSubtitleIndex !== subtitles.length - 1) {
        setActiveSubtitleIndex(subtitles.length - 1);
      } else if (!isPastLast) {
        setActiveSubtitleIndex(-1);
      }
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (!isPlaying) setIsPlaying(true);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleSeek(((e.clientX - rect.left) / rect.width) * duration);
  };

  const toggleSaveWord = (wordText: string) => {
    setSavedWords(prev => {
      const next = new Set(prev);
      next.has(wordText) ? next.delete(wordText) : next.add(wordText);
      return next;
    });
  };

  // Simulated AI breakdown for music player words
  const handleGenerate = () => {
    if (!hoveredWord) return;
    setIsGenerating(true);
    setTimeout(() => {
      setHoveredWord(prev =>
        prev
          ? {
              ...prev,
              translation: '[С сервера] Перевод слова',
              grammar: '[С сервера] Грамматический анализ.',
              culturalComment: `Контекстное использование «${prev.text}» в данной песне.`,
            }
          : prev
      );
      setIsGenerating(false);
    }, 800);
  };

  if (!song) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-400">
        Песня не найдена
      </div>
    );
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-screen flex flex-col bg-transparent transition-colors duration-300">
      <audio
        ref={audioRef}
        src={song.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => setIsPlaying(false)}
      />

      <PageHeader
        onBack={() => navigate(-1)}
        title={song.title}
        subtitle={song.artist}
      />

      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
        {/* Left: audio player + scrolling lyrics */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-8 py-10 md:px-16 flex flex-col relative bg-slate-50/50 dark:bg-slate-900/10">
          {/* Compact audio player bar */}
          <div className="max-w-2xl mx-auto w-full mb-12 p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800/80 rounded-2xl shadow-sm flex items-center gap-4 sticky top-0 z-10">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center bg-brand-cyan text-white rounded-full shadow-lg shadow-brand-cyan/30 hover:scale-105 transition-transform"
            >
              {isPlaying
                ? <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                : <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-1" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>}
            </button>

            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              <div className="flex justify-between text-[10px] sm:text-xs font-medium text-slate-500 font-mono items-center">
                <span>{formatTime(currentTime)}</span>
                <div className="flex items-center gap-2 group relative">
                  <svg
                    className="w-3.5 h-3.5 text-slate-400 hover:text-brand-cyan cursor-pointer"
                    onClick={() => setVolume(v => (v === 0 ? 1 : 0))}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                  <div
                    className="hidden sm:group-hover:flex w-20 h-1 bg-slate-200 dark:bg-slate-800 rounded-full cursor-pointer relative items-center"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
                    }}
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-brand-cyan rounded-full pointer-events-none"
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                </div>
                <span>{formatTime(duration)}</span>
              </div>
              {/* Progress bar */}
              <div
                className="w-full h-1.5 sm:h-2 bg-slate-200 dark:bg-slate-800 rounded-full cursor-pointer relative overflow-hidden"
                onClick={handleProgressBarClick}
              >
                <div
                  className="absolute top-0 bottom-0 left-0 bg-brand-cyan rounded-full transition-all duration-100 ease-linear pointer-events-none"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {!hasLrc && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <BookOpen className="w-12 h-12 mb-4 opacity-20" />
              <p>Текст для данной песни недоступен</p>
            </div>
          )}

          <div className="max-w-xl mx-auto w-full pb-[30vh] pt-4" ref={lyricsContainerRef}>
            {subtitles.map((sub, idx) => (
              <div
                key={idx}
                className={cn(
                  'mb-8 transition-all duration-500 cursor-pointer group/line',
                  activeSubtitleIndex === idx
                    ? 'opacity-100 scale-105 transform origin-left'
                    : 'opacity-40 hover:opacity-70'
                )}
                onClick={() => handleSeek(sub.start)}
              >
                <div className="flex flex-wrap gap-x-2 gap-y-2">
                  {sub.words.map((word, wIdx) => {
                    const isSaved = savedWords.has(word.text);
                    return (
                      <span
                        key={wIdx}
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          setHoveredWord(word);
                        }}
                        className={cn(
                          'text-2xl sm:text-3xl font-korean transition-all duration-200 rounded-lg px-1.5 -mx-1.5',
                          hoveredWord?.text === word.text
                            ? 'bg-brand-cyan/20 text-slate-900 dark:text-white'
                            : 'text-slate-800 dark:text-slate-200',
                          isSaved && 'text-brand-cyan border-b-2 border-brand-cyan/50 pb-0.5',
                          activeSubtitleIndex === idx
                            ? 'font-bold text-brand-cyan cursor-text'
                            : 'cursor-pointer'
                        )}
                      >
                        {word.text}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: word analysis sidebar */}
        <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-white/40 dark:border-slate-800/50 flex flex-col flex-shrink-0">
          <WordAnalysisSidebar
            word={hoveredWord}
            savedWords={savedWords}
            isGenerating={isGenerating}
            phraseTranslation={
              activeSubtitleIndex !== -1 && subtitles[activeSubtitleIndex]
                ? subtitles[activeSubtitleIndex].artisticTranslation
                : undefined
            }
            onSave={toggleSaveWord}
            onGenerate={handleGenerate}
            emptyHint="Наведите на любое слово в тексте песни, чтобы увидеть детальный разбор и перевод."
          />
        </div>
      </div>
    </div>
  );
}
