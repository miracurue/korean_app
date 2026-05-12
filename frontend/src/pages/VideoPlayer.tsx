import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Subtitles, BookOpen, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import PageHeader from '../components/PageHeader';

// ============================================================
// Types for API data
// ============================================================
interface FragmentWord {
  word_in_text: string;
  base_word: string;
  translations: string[] | null;
  context_translation: string | null;
  grammar_note: string | null;
  position: string | null;
  char_start: number | null;
  char_end: number | null;
}

interface Fragment {
  fragment_id: string;
  time_start: string;
  time_end: string;
  original_text: string;
  translated_text: string | null;
  cultural_comment: string | null;
  idioma: string | null;
  words: FragmentWord[];
}

interface VideoInfo {
  id: string;
  series_title: string;
  episode_number: string;
  video_url: string;
  tags: string | null;
}

// ============================================================
// Helpers
// ============================================================

/** Parse SRT time "00:00:03,169" or seconds "12.00" → number of seconds */
function parseTime(raw: string): number {
  if (!raw) return 0;
  // SRT format: "HH:MM:SS,mmm"
  const srtMatch = raw.match(/^(\d+):(\d+):(\d+)[,.](\d+)$/);
  if (srtMatch) {
    const [, h, m, s, ms] = srtMatch;
    return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
  }
  // HH:MM:SS without ms
  const hmsMatch = raw.match(/^(\d+):(\d+):(\d+)$/);
  if (hmsMatch) {
    const [, h, m, s] = hmsMatch;
    return Number(h) * 3600 + Number(m) * 60 + Number(s);
  }
  // Plain seconds
  const num = parseFloat(raw);
  return isNaN(num) ? 0 : num;
}

// ============================================================
// Component
// ============================================================
export default function VideoPlayer() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);

  // Data from API
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedWord, setSelectedWord] = useState<FragmentWord | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

  // Subtitle list scroll
  const [showFullSubtitleList, setShowFullSubtitleList] = useState(false);

  // Load data from API
  useEffect(() => {
    if (!videoId) return;
    setLoading(true);

    fetch(`/api/dramas/${videoId}/fragments`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setVideo(data.video);
        setFragments(data.fragments || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load fragments:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [videoId]);

  // Video play/pause
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    isPlaying ? v.play().catch(() => setIsPlaying(false)) : v.pause();
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const seekTo = ((e.clientX - rect.left) / rect.width) * duration;
    videoRef.current.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  const toggleSaveWord = (wordText: string) => {
    setSavedWords(prev => {
      const next = new Set(prev);
      next.has(wordText) ? next.delete(wordText) : next.add(wordText);
      return next;
    });
  };

  // Find active fragment based on current video time
  const activeFragment = fragments.find(f => {
    const start = parseTime(f.time_start);
    const end = parseTime(f.time_end);
    return currentTime >= start && currentTime <= end;
  });

  // When a new fragment becomes active, auto-select it
  useEffect(() => {
    if (activeFragment) {
      setSelectedLineId(activeFragment.fragment_id);
      setSelectedWord(null); // Reset word selection when line changes
    }
  }, [activeFragment?.fragment_id]);

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Selected line data for sidebar
  const selectedLine = fragments.find(f => f.fragment_id === selectedLineId);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-t-2 border-brand-cyan rounded-full animate-spin" />
          <span>Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-400">
        <div className="text-center">
          <p className="text-lg mb-2">Ошибка загрузки</p>
          <p className="text-sm">{error || 'Видео не найдено'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-transparent transition-colors duration-300">
      <PageHeader
        onBack={() => navigate(-1)}
        title={`${video.series_title} — Эпизод ${video.episode_number}`}
        subtitle=""
      />

      <div className="flex-1 flex overflow-hidden">
        {/* ========== LEFT: Video + Subtitles ========== */}
        <div className="flex-1 flex flex-col relative bg-black">
          {/* Video area */}
          <div className="flex-1 relative group flex items-center justify-center overflow-hidden">
            {video.video_url ? (
              <video
                ref={videoRef}
                src={video.video_url}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onClick={() => setIsPlaying(prev => !prev)}
                playsInline
              />
            ) : (
              <div className="w-[80%] aspect-video bg-black rounded-lg shadow-2xl border border-white/10 flex items-center justify-center">
                <h2 className="text-white/40 text-xl font-light">Видео недоступно</h2>
              </div>
            )}

            {/* Subtitles overlay on video */}
            {showSubtitles && activeFragment && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none px-10">
                <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-2xl max-w-2xl">
                  <p className="text-2xl font-bold text-white text-center drop-shadow-lg font-korean tracking-wide">
                    {activeFragment.original_text}
                  </p>
                  {activeFragment.translated_text && (
                    <p className="text-sm text-slate-300 text-center mt-2 font-medium italic opacity-80">
                      {activeFragment.translated_text}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Controls overlay — appears on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none">
              <div className="pointer-events-auto">
                <div
                  className="w-full h-1.5 bg-slate-700 rounded-full mb-4 cursor-pointer relative"
                  onClick={handleProgressClick}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-brand-cyan rounded-full transition-all duration-100"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => setIsPlaying(prev => !prev)}
                      className="text-white hover:text-brand-cyan transition-colors"
                    >
                      {isPlaying
                        ? <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        : <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>}
                    </button>
                    <span className="text-sm text-slate-300 font-medium font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowSubtitles(prev => !prev)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      showSubtitles
                        ? 'text-brand-cyan bg-brand-cyan/10'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <Subtitles className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========== Interactive word strip (active line) ========== */}
          <div className="h-24 bg-white/5 backdrop-blur-3xl border-t border-white/10 flex items-center justify-center px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/10 to-transparent opacity-10 pointer-events-none" />
            <div className="flex flex-wrap gap-3 justify-center relative z-10 max-w-4xl">
              {activeFragment ? (
                activeFragment.words.map((fw, wIdx) => {
                  const isSelected = selectedWord?.word_in_text === fw.word_in_text &&
                    selectedLineId === activeFragment.fragment_id;
                  const isSaved = savedWords.has(fw.word_in_text);
                  return (
                    <span
                      key={wIdx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWord(fw);
                        setSelectedLineId(activeFragment.fragment_id);
                      }}
                      className={cn(
                        'text-2xl sm:text-3xl font-korean transition-all duration-200 cursor-pointer rounded-lg px-2 py-1',
                        isSelected
                          ? 'bg-brand-cyan/30 text-white font-bold -translate-y-1'
                          : 'text-slate-300 hover:text-white hover:bg-white/5',
                        isSaved && 'border-b-2 border-brand-cyan pb-0.5'
                      )}
                    >
                      {fw.word_in_text}
                    </span>
                  );
                })
              ) : (
                <span className="text-slate-500 text-sm">Субтитры не найдены</span>
              )}
            </div>
          </div>

          {/* ========== Subtitle list (scrollable, below the strip) ========== */}
          <div className="border-t border-white/10 bg-slate-950/60">
            <button
              onClick={() => setShowFullSubtitleList(prev => !prev)}
              className="w-full px-6 py-2 flex items-center justify-between text-slate-400 hover:text-white transition-colors"
            >
              <span className="text-sm font-medium">
                Все субтитры ({fragments.length})
              </span>
              {showFullSubtitleList
                ? <ChevronDown className="w-4 h-4" />
                : <ChevronUp className="w-4 h-4" />
              }
            </button>

            {showFullSubtitleList && (
              <div className="max-h-60 overflow-y-auto scrollbar-hide px-4 pb-3 space-y-1">
                {fragments.map(frag => {
                  const isActive = activeFragment?.fragment_id === frag.fragment_id;
                  const isSelected = selectedLineId === frag.fragment_id;

                  return (
                    <div
                      key={frag.fragment_id}
                      onClick={() => {
                        setSelectedLineId(frag.fragment_id);
                        setSelectedWord(null);
                        // Seek video to this fragment's start time
                        const start = parseTime(frag.time_start);
                        if (videoRef.current && start > 0) {
                          videoRef.current.currentTime = start;
                          setCurrentTime(start);
                        }
                      }}
                      className={cn(
                        'px-4 py-2 rounded-xl cursor-pointer transition-all duration-200',
                        isActive
                          ? 'bg-brand-cyan/15 border border-brand-cyan/30'
                          : isSelected
                            ? 'bg-slate-800/60 border border-slate-700/50'
                            : 'hover:bg-slate-800/40 border border-transparent'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-[10px] text-slate-500 font-mono mt-1 shrink-0 w-16">
                          {frag.time_start}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm font-korean leading-relaxed',
                            isActive ? 'text-white font-medium' : 'text-slate-300'
                          )}>
                            {frag.original_text}
                          </p>
                          {frag.translated_text && (
                            <p className={cn(
                              'text-xs mt-0.5',
                              isActive ? 'text-brand-cyan/80' : 'text-slate-500'
                            )}>
                              {frag.translated_text}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ========== RIGHT: Analysis sidebar ========== */}
        <div className="w-96 border-l border-slate-800/50 flex flex-col flex-shrink-0 bg-slate-900/40 backdrop-blur-md">
          {/* Word selected → show word breakdown */}
          {selectedWord ? (
            <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
              <div className="p-6 flex-1">
                {/* Word header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-4xl font-bold font-korean text-white mb-2 leading-tight">
                      {selectedWord.word_in_text}
                    </h2>
                    <p className="text-xl text-brand-cyan font-medium">
                      {selectedWord.context_translation ||
                        (selectedWord.translations?.filter(Boolean).join(', ')) ||
                        '—'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSaveWord(selectedWord.word_in_text)}
                    aria-label="Сохранить слово"
                    className={cn(
                      'p-2.5 rounded-xl border transition-all duration-300 shrink-0',
                      savedWords.has(selectedWord.word_in_text)
                        ? 'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan shadow-[0_0_15px_rgba(112,161,215,0.15)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-brand-cyan'
                    )}
                  >
                    <BookOpen className="w-5 h-5" />
                  </button>
                </div>

                {/* Base form */}
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800/50 shadow-sm mb-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">
                    Начальная форма
                  </p>
                  <p className="text-2xl font-korean text-white font-bold">
                    {selectedWord.base_word}
                  </p>
                  {selectedWord.translations && selectedWord.translations.length > 0 && (
                    <p className="text-sm text-slate-400 mt-1">
                      Переводы: {selectedWord.translations.filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>

                {/* Grammar note */}
                {selectedWord.grammar_note && (
                  <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800/50 shadow-sm mb-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">
                      Грамматический разбор
                    </p>
                    <p className="text-slate-300 leading-relaxed text-sm">
                      {selectedWord.grammar_note}
                    </p>
                  </div>
                )}

                {/* Position */}
                {selectedWord.position && (
                  <div className="bg-brand-cyan/5 rounded-2xl p-4 border border-brand-cyan/20 mb-4">
                    <p className="text-xs text-brand-cyan uppercase tracking-wider mb-2 font-semibold">
                      Синтаксическая роль
                    </p>
                    <p className="text-sm text-slate-300">
                      {selectedWord.position}
                    </p>
                  </div>
                )}

                {/* Char positions */}
                {selectedWord.char_start != null && selectedWord.char_end != null && (
                  <div className="text-xs text-slate-600 mt-2">
                    Позиция: {selectedWord.char_start}–{selectedWord.char_end}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* No word selected → show empty state */
            <div className="flex-1 p-6 flex flex-col justify-center items-center text-center text-slate-500">
              <div className="w-20 h-20 mb-6 rounded-3xl bg-slate-900 flex items-center justify-center">
                <BookOpen className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-slate-300 mb-2">Словарь</h3>
              <p className="text-sm max-w-[200px] leading-relaxed">
                Нажмите на слово в субтитрах снизу, чтобы увидеть грамматический разбор.
              </p>
            </div>
          )}

          {/* Bottom strip: artistic translation of selected line */}
          {selectedLine?.translated_text && (
            <div className="p-4 border-t border-slate-800/50 bg-slate-900/30 flex-shrink-0">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 font-semibold flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                Художественный перевод
              </p>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                {selectedLine.translated_text}
              </p>
            </div>
          )}

          {/* Cultural comment */}
          {selectedLine?.cultural_comment && (
            <div className="px-4 pb-4 border-t border-slate-800/30 bg-slate-900/20 flex-shrink-0">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 mt-3 font-semibold">
                Культурный контекст
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedLine.cultural_comment}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}