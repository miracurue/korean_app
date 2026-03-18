import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Volume2, Bookmark, Sparkles, BookOpen, MessageCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { MUSIC } from '../data/music';
import { useProgress } from '../lib/useProgress';

interface SubtitleWord {
  text: string;
  baseForm?: string;
  translation?: string;
  particles?: string;
  grammar?: string;
  culturalComment?: string;
}

interface Subtitle {
  id: number;
  start: number;
  end: number;
  text: string;
  artisticTranslation?: string;
  words: SubtitleWord[];
}

const parseLrc = (lrcText: string): Subtitle[] => {
  const lines = lrcText.split('\n');
  const parsed: Subtitle[] = [];
  const timeRegex = /\[(\d{2}):(\d{2}\.\d{2,3})\]/;

  lines.forEach((line, index) => {
    const match = timeRegex.exec(line);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseFloat(match[2]);
      const timeInSeconds = min * 60 + sec;
      const text = line.replace(timeRegex, '').trim();

      if (text) {
        // Break Korean text into chunks roughly for the UI, though not fully parsed
        const chunks = text.split(' ').map(chunk => ({
          text: chunk,
          baseForm: '', // Real grammar parsing needs an API, fallback here
          translation: '',
        }));

        parsed.push({
          id: index,
          start: timeInSeconds,
          end: timeInSeconds + 5, // fallback
          text,
          artisticTranslation: 'Перевод недоступен',
          words: chunks
        });
      }
    }
  });

  // Fix end times based on the start of the next line
  for (let i = 0; i < parsed.length - 1; i++) {
    parsed[i].end = parsed[i + 1].start;
  }

  return parsed;
};

// Formats seconds into mm:ss
const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function Player() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const song = MUSIC.find(m => m.id === Number(id));

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(-1);
  const [hoveredWord, setHoveredWord] = useState<SubtitleWord | null>(null);
  const [volume, setVolume] = useState(1);
  const [hasLrc, setHasLrc] = useState(true);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const { saveProgress } = useProgress('audio');
  const lastSaveTime = useRef(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!song) return;
    
    // Load subtitles
    if (song.lrcUrl) {
      fetch(song.lrcUrl)
        .then(res => {
          if (!res.ok) throw new Error("Failed to load LRC");
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
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      
      if (song) {
        const now = Date.now();
        if (now - lastSaveTime.current > 3000) { // save every 3s
          saveProgress({
            id: song.id,
            title: song.title,
            source: song.artist,
            timestamp: time,
            duration: audioRef.current.duration || 0,
            isLocal: id === 'local'
          });
          lastSaveTime.current = now;
        }
      }
      
      const index = subtitles.findIndex(sub => time >= sub.start && time < sub.end);
      if (index !== -1 && index !== activeSubtitleIndex) {
        setActiveSubtitleIndex(index);
        
        // Auto-scroll logic
        if (lyricsContainerRef.current) {
          const activeEl = lyricsContainerRef.current.children[index] as HTMLElement;
          if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      } else if (index === -1) {
        // Find if we are past the last lyric
        const isPastLast = subtitles.length > 0 && time >= subtitles[subtitles.length - 1].start;
        if (isPastLast && activeSubtitleIndex !== subtitles.length - 1) {
             setActiveSubtitleIndex(subtitles.length - 1);
        } else if (!isPastLast) {
             setActiveSubtitleIndex(-1);
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
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
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    handleSeek(percentage * duration);
  };

  const toggleSaveWord = (wordText: string) => {
    const nextStyles = new Set(savedWords);
    if (nextStyles.has(wordText)) {
      nextStyles.delete(wordText);
    } else {
      nextStyles.add(wordText);
    }
    setSavedWords(nextStyles);
  };

  if (!song) {
    return <div className="h-screen flex items-center justify-center text-slate-400">Песня не найдена</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-transparent transition-colors duration-300">
      <audio 
        ref={audioRef} 
        src={song.audioUrl} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top Bar */}
      <header className="h-16 border-b border-white/40 dark:border-slate-800/50 flex flex-shrink-0 items-center px-6 justify-between bg-white/60 dark:bg-slate-700/40 backdrop-blur-2xl z-20 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-sm">{song.title}</h1>
          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">{song.artist}</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
        {/* Left Side: Scrolling Lyrics and Top Audio Player */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-8 py-10 md:px-16 flex flex-col relative bg-slate-50/50 dark:bg-slate-900/10">
           {/* Aesthetic background glow */}

           {/* Compact Audio Player (Similar to Poetry Reader) */}
           <div className="max-w-2xl mx-auto w-full mb-12 p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800/80 rounded-2xl shadow-sm flex items-center gap-4 sticky top-0 z-10">
             <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center bg-brand-cyan text-white rounded-full shadow-lg shadow-brand-cyan/30 hover:scale-105 transition-transform"
             >
                {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-1" />}
             </button>
             
             <div className="flex-1 flex flex-col gap-1 sm:gap-1.5 min-w-0">
                <div className="flex justify-between text-[10px] sm:text-xs font-medium text-slate-500 font-mono items-center">
                  <span>{formatTime(currentTime)}</span>
                  <div className="flex items-center gap-2 group relative">
                    <Volume2 className="w-3.5 h-3.5 text-slate-400 hover:text-brand-cyan cursor-pointer" onClick={() => setVolume(v => v === 0 ? 1 : 0)}/>
                    {/* Expandable volume slider on hover */}
                    <div className="hidden sm:group-hover:flex w-20 h-1 bg-slate-200 dark:bg-slate-800 rounded-full cursor-pointer relative items-center"
                         onClick={(e) => {
                           const rect = e.currentTarget.getBoundingClientRect();
                           setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
                         }}>
                       <div className="absolute left-0 top-0 bottom-0 bg-brand-cyan rounded-full pointer-events-none" style={{ width: `${volume * 100}%` }} />
                    </div>
                  </div>
                  <span>{formatTime(duration)}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 sm:h-2 bg-slate-200 dark:bg-slate-800 rounded-full cursor-pointer relative group/progress overflow-hidden" onClick={handleProgressBarClick}>
                   <div 
                     className="absolute top-0 bottom-0 left-0 bg-brand-cyan rounded-full transition-all duration-100 ease-linear pointer-events-none" 
                     style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                   />
                </div>
             </div>
           </div>

           {!hasLrc && (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 relative z-0">
                <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                <p>Текст для данной песни недоступен</p>
             </div>
           )}

           <div className="max-w-xl mx-auto w-full relative z-0 pb-[30vh] pt-4" ref={lyricsContainerRef}>
               {subtitles.map((sub, idx) => (
                 <div 
                   key={idx} 
                   className={cn(
                     "mb-8 transition-all duration-500 cursor-pointer group/line",
                     activeSubtitleIndex === idx 
                       ? "opacity-100 scale-105 transform origin-left" 
                       : "opacity-40 hover:opacity-70"
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
                                "text-2xl sm:text-3xl font-korean transition-all duration-200 rounded-lg px-1.5 -mx-1.5",
                                hoveredWord?.text === word.text ? "bg-brand-cyan/20 text-slate-900 dark:text-white" : "text-slate-800 dark:text-slate-200",
                                isSaved && "text-brand-cyan border-b-2 border-brand-cyan/50 pb-0.5",
                                activeSubtitleIndex === idx ? "font-bold text-brand-cyan cursor-text" : "cursor-pointer"
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

        {/* Right Side: Word Analysis Sidebar */}
        <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-white/40 dark:border-slate-800/50 bg-white/70 dark:bg-slate-700/50 backdrop-blur-2xl flex flex-col flex-shrink-0 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
          {hoveredWord ? (
            <div className="p-6 h-full flex flex-col overflow-y-auto scrollbar-hide animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-4xl font-bold font-korean text-slate-900 dark:text-white">{hoveredWord.baseForm || hoveredWord.text}</h2>
                  <button 
                    onClick={() => toggleSaveWord(hoveredWord.text)}
                    className={cn(
                      "p-2 rounded-xl border transition-all duration-300",
                      savedWords.has(hoveredWord.text) 
                        ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan" 
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-cyan"
                    )}
                  >
                    {savedWords.has(hoveredWord.text) ? <CheckCircle2 className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-2xl text-brand-cyan font-medium">{hoveredWord.translation || "Слово не найдено"}</p>
              </div>

              <div className="space-y-4 flex-1">
                <div className="bg-white/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-white dark:border-slate-800/50 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Грамматический разбор</p>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">{hoveredWord.grammar || "Разбор недоступен для авто-сгенерированных субтитров."}</p>
                  {hoveredWord.particles && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 border-dashed">
                      <span className="text-sm text-slate-500">Частицы/Окончания:</span>
                      <span className="text-brand-cyan font-korean font-medium">{hoveredWord.particles}</span>
                    </div>
                  )}
                </div>

                <div className="bg-brand-cyan/5 dark:bg-brand-cyan/5 rounded-2xl p-4 border border-brand-cyan/20">
                  <p className="text-xs text-brand-cyan uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    ИИ Разбор контекста
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed truncate whitespace-normal">
                    {hoveredWord.culturalComment || `Здесь может быть разбор использования слова ${hoveredWord.text} в контексте данной песни.`}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 h-full flex flex-col justify-center items-center text-center text-slate-400 dark:text-slate-500">
               <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                 <BookOpen className="w-8 h-8 opacity-50" />
               </div>
               <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Наведите на слово</h3>
               {hasLrc ? (
                 <p className="text-sm max-w-[200px]">Выберите любое слово в тексте песни, чтобы увидеть детальный разбор и перевод (если доступен).</p>
               ) : (
                 <p className="text-sm max-w-[200px]">Для данной песни нет доступного разбора.</p>
               )}
            </div>
          )}

          {/* Optional Artistic Translation of the whole song/context at bottom */}
          <div className="p-4 border-t border-white/40 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
               <MessageCircle className="w-3.5 h-3.5" /> Значение строки
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 italic whitespace-pre-line truncate">
              {activeSubtitleIndex !== -1 && subtitles[activeSubtitleIndex] ? subtitles[activeSubtitleIndex].artisticTranslation : "Выберите строку для просмотра значения"}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
