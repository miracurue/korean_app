import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { 
  ArrowLeft, Play, Pause, Volume2, Maximize, Settings, Subtitles, 
  Bookmark, Sparkles, BookOpen, MessageCircle, CheckCircle2, 
  Upload, FileVideo, FileText, X, Music
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useProgress } from '../lib/useProgress';

interface SubtitleWord {
  text: string;
  baseForm?: string;
  translation?: string;
  grammar?: string;
  particles?: string;
}

interface SubtitleBlock {
  id: number;
  start: number;
  end: number;
  text: string;
  translation?: string;
  words: SubtitleWord[];
}

const parseLrcSubtitles = (text: string): SubtitleBlock[] => {
  const blocks: SubtitleBlock[] = [];
  const lines = text.trim().split(/\r?\n/);
  
  let id = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Match [mm:ss.xx] format
    const match = line.match(/^\[(\d{2,}):(\d{2}(?:\.\d{1,3})?)\]\s*(.*)$/);
    if (match) {
      const min = parseInt(match[1]);
      const sec = parseFloat(match[2]);
      const start = min * 60 + sec;
      const subText = match[3].trim();
      
      if (subText) {
        const words = subText.split(/\s+/).filter(Boolean).map(w => ({ 
          text: w, 
          baseForm: w.replace(/[.,!?]/g, ''),
          translation: 'Нажмите для перевода',
          grammar: 'Нажмите для анализа',
        }));
        blocks.push({ 
          id: id++, 
          start, 
          end: start + 4, // Default end
          text: subText, 
          translation: 'Нажмите для получения перевода фразы',
          words 
        });
      }
    }
  }

  // Adjust end times based on the next start time
  for (let i = 0; i < blocks.length - 1; i++) {
    blocks[i].end = blocks[i + 1].start;
  }

  return blocks;
};

const formatTime = (time: number) => {
  if (isNaN(time)) return "00:00";
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const DB_NAME = 'BYOC_AUDIO_DB';
const STORE_NAME = 'files_store';

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

const saveFilesToStore = async (audio: File | null, subtitle: File | null) => {
  if (!audio) return;
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ audio, subtitle }, 'current_session');
  } catch (e) {
    console.error('Failed to save BYOC session:', e);
  }
};

const loadFilesFromStore = async (): Promise<{audio: File, subtitle: File | null} | null> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get('current_session');
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
};

const clearStore = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete('current_session');
  } catch (e) {}
};

export default function LocalAudioPlayer() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleBlock[]>([]);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(-1);
  const [hoveredWord, setHoveredWord] = useState<SubtitleWord | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  const { saveProgress, getProgress } = useProgress('audio');
  const lastSaveTime = useRef(0);

  const onWordClick = (e: React.MouseEvent, word: SubtitleWord) => {
     e.stopPropagation();
     e.preventDefault();
     setHoveredWord(word);
     if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
     }
     
     if (word.translation === 'Нажмите для перевода' || word.translation?.includes('недоступен')) {
        handleGenerateBreakdown(word);
     }
  };

  useEffect(() => {
    let isMounted = true;
    const initFiles = async () => {
      if (location.state) {
        const { audioFile: passedAudio, subtitleFile: passedSub } = location.state as any;
        
        if (passedAudio) {
          setAudioFile(passedAudio);
          setAudioUrl(URL.createObjectURL(passedAudio));
          setIsReadyToPlay(true);
          
          if (passedSub) {
            setSubtitleFile(passedSub);
            const text = await passedSub.text();
            if (isMounted) setSubtitles(parseLrcSubtitles(text));
          }
          await saveFilesToStore(passedAudio, passedSub || null);
        }
        
        navigate('.', { replace: true, state: null });
        return;
      }

      const saved = await loadFilesFromStore();
      if (saved && saved.audio && isMounted) {
        setAudioFile(saved.audio);
        setAudioUrl(URL.createObjectURL(saved.audio));
        setIsReadyToPlay(true);
        if (saved.subtitle) {
          setSubtitleFile(saved.subtitle);
          const text = await saved.subtitle.text();
          if (isMounted) setSubtitles(parseLrcSubtitles(text));
        }
      }
    };
    
    initFiles();
    return () => { isMounted = false; };
  }, [location.state, navigate]);

  useEffect(() => {
    if (!isReadyToPlay && !audioFile) {
       const timer = setTimeout(() => {
          if (!audioUrl) navigate('/rooms/audio');
       }, 500);
       return () => clearTimeout(timer);
    }
  }, [isReadyToPlay, audioFile, audioUrl, navigate]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const subtitleListRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(null);
    setAudioUrl('');
    setSubtitleFile(null);
    setSubtitles([]);
    setIsPlaying(false);
    setIsReadyToPlay(false);
    navigate('/rooms/audio');
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      
      const now = Date.now();
      if (now - lastSaveTime.current > 3000 && audioFile) {
        saveProgress({
          id: `local_audio_${audioFile.name}`,
          title: audioFile.name,
          source: 'Локальный файл',
          timestamp: time,
          duration: audioRef.current.duration || 0,
          isLocal: true
        });
        lastSaveTime.current = now;
      }
      
      const index = subtitles.findIndex(sub => time >= sub.start && time < sub.end);
      if (index !== -1 && index !== activeSubtitleIndex) {
        setActiveSubtitleIndex(index);
        
        if (subtitleListRef.current) {
          const activeEl = subtitleListRef.current.children[0]?.children[index] as HTMLElement;
          if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      } else if (index === -1) {
         setActiveSubtitleIndex(-1);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      
      if (audioFile) {
         const progress = getProgress(`local_audio_${audioFile.name}`);
         if (progress && progress.timestamp > 0) {
            audioRef.current.currentTime = progress.timestamp;
            setCurrentTime(progress.timestamp);
         }
      }
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    handleSeek(percentage * duration);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleSaveWord = (wordText: string) => {
    const nextWords = new Set(savedWords);
    if (nextWords.has(wordText)) {
      nextWords.delete(wordText);
    } else {
      nextWords.add(wordText);
    }
    setSavedWords(nextWords);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleGenerateBreakdown = (targetWord?: SubtitleWord) => {
    const wordToProcess = targetWord || hoveredWord;
    if (!wordToProcess) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      const updatedWord = {
        ...wordToProcess,
        translation: '[С сервера] Перевод слова',
        grammar: '[С сервера] Подробный грамматический анализ.',
        particles: '[С сервера] Морфология'
      };
      
      const phraseTranslation = '[С сервера] Перевод всей фразы целиком для контекста.';
      
      if (wordToProcess.text === hoveredWord?.text) {
        setHoveredWord(updatedWord);
      }
      
      setSubtitles(prev => prev.map(block => {
        const hasWord = block.words.some(w => w.text === wordToProcess.text);
        return {
          ...block,
          translation: hasWord ? phraseTranslation : block.translation,
          words: block.words.map(w => w.text === wordToProcess.text ? updatedWord : w)
        };
      }));
      
      setIsGenerating(false);
    }, 800);
  };

  const handleTranslateAll = () => {
    if (subtitles.length === 0) return;
    setIsTranslatingAll(true);
    
    setTimeout(() => {
      setSubtitles(prev => prev.map(sub => ({
        ...sub,
        translation: '[С сервера] Перевод всей фразы целиком.',
        words: sub.words.map(w => ({
          ...w,
          translation: '[С сервера] Перевод',
          grammar: '[С сервера] Разбор'
        }))
      })));
      setIsTranslatingAll(false);
    }, 1500);
  };

  if (!isReadyToPlay && !audioFile) {
     return (
       <div className="h-screen w-full flex items-center justify-center bg-[#09090b]">
           <div className="animate-pulse flex flex-col items-center gap-4 text-slate-500">
               <div className="w-12 h-12 rounded-full border-t-2 border-teal-500 animate-spin" />
               <p>Загрузка медиа...</p>
           </div>
       </div>
     );
  }

  const activeSubtitle = activeSubtitleIndex !== -1 ? subtitles[activeSubtitleIndex] : null;

  return (
    <div className="h-screen flex flex-col bg-transparent transition-colors duration-300">
            {/* External Header - Seamless Dark */}
      <header className="h-16 flex flex-shrink-0 items-center px-12 bg-transparent">
        <div className="flex items-center gap-4">
          <button onClick={handleReset} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white leading-tight truncate max-w-sm">{audioFile?.name}</h1>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
               {subtitles.length > 0 ? `${subtitles.length} строк субтитров` : 'Без субтитров'}
            </span>
          </div>
        </div>
      </header>      <main className="flex-1 overflow-hidden p-4 md:p-6 lg:p-8">
        <Group 
          orientation="horizontal" 
          className="h-full w-full flex overflow-hidden flex-col md:flex-row bg-[#0c0c0e] rounded-3xl border border-zinc-800/50 shadow-2xl max-w-[1600px] mx-auto"
        >
        
        <Panel defaultSize={40} minSize={20} className="flex flex-col relative bg-[#0c0c0e] overflow-hidden">
          {/* Aesthetic Audio Track Player */}
          <div className="w-full relative flex flex-col items-center bg-[#0c0c0e] flex-shrink-0 z-20 py-4">
             <audio 
               ref={audioRef}
               src={audioUrl}
               onTimeUpdate={handleTimeUpdate}
               onLoadedMetadata={handleLoadedMetadata}
               onEnded={() => setIsPlaying(false)}
               onPlay={() => setIsPlaying(true)}
               onPause={() => setIsPlaying(false)}
             />
             
             <div className="w-full max-w-4xl px-6 flex flex-col gap-3">
               {/* Progress Bar */}
               <div className="w-full h-2 bg-slate-800 rounded-full cursor-pointer relative group/progress flex-shrink-0" onClick={handleProgressClick}>
                 <div 
                   className="absolute left-0 top-0 bottom-0 bg-brand-cyan rounded-full transition-all duration-100 ease-linear pointer-events-none" 
                   style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                 />
                 <div 
                   className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none" 
                   style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 8px)` }} 
                 />
               </div>

               {/* Controls */}
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <button 
                     onClick={togglePlay}
                     className="w-10 h-10 rounded-full bg-brand-cyan hover:bg-brand-cyan/80 text-white flex items-center justify-center transition-colors shadow-lg shadow-brand-cyan/20"
                   >
                     {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                   </button>
                   
                   <span className="text-sm text-slate-400 font-medium font-mono tabular-nums">
                     {formatTime(currentTime)} / {formatTime(duration)}
                   </span>
                 </div>
                 
                 <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 text-slate-400">
                     <Volume2 className="w-5 h-5 cursor-pointer hover:text-white transition-colors" onClick={() => setVolume(v => v === 0 ? 1 : 0)} />
                     <div className="w-20 h-1.5 bg-slate-800 rounded-full cursor-pointer relative"
                          onClick={(e) => {
                             const rect = e.currentTarget.getBoundingClientRect();
                             setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
                          }}>
                       <div className="absolute left-0 top-0 bottom-0 bg-brand-cyan rounded-full pointer-events-none transition-all" style={{ width: `${volume * 100}%` }} />
                     </div>
                   </div>
                 </div>
               </div>
             </div>
          </div>

          {/* Subtitles (Takes up rest of the space) */}
          <div ref={subtitleListRef} className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-8 pb-32 bg-[#0c0c0e] transition-all duration-300 relative z-10">
             {subtitles.length > 0 ? (
                <div className="max-w-4xl mx-auto flex flex-col">
                   <div className="mb-4 flex justify-center">
                     <button
                       onClick={handleTranslateAll}
                       disabled={isTranslatingAll}
                       className={cn(
                         "flex items-center gap-2 px-6 py-2 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-full text-sm font-medium hover:bg-brand-cyan/20 transition-all cursor-pointer",
                         isTranslatingAll && "opacity-50 cursor-not-allowed"
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
                   {subtitles.map((sub, idx) => {
                      const isActive = activeSubtitleIndex === idx;
                      const isPast = activeSubtitleIndex > idx;
                      
                      return (
                         <div 
                           key={idx}
                           className={cn(
                             "mb-6 md:mb-8 transition-all duration-300 origin-left relative flex gap-4 pr-4",
                             isActive 
                               ? "opacity-100 scale-[1.02] translate-x-2 bg-brand-cyan/10 border-brand-cyan/20 rounded-2xl -ml-4 pl-4 py-3" 
                               : isPast 
                                 ? "opacity-30 hover:opacity-60" 
                                 : "opacity-60 hover:opacity-80"
                           )}
                         >
                            {isActive && <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-brand-cyan rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />}
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeek(sub.start);
                              }}
                              className={cn(
                                "shrink-0 h-fit px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all mt-1.5 cursor-pointer",
                                isActive 
                                  ? "bg-brand-cyan text-white shadow-[0_0_10px_rgba(34,211,238,0.3)]" 
                                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                              )}
                            >
                              {formatTime(sub.start)}
                            </button>

                            <div className="flex-1">
                              <div 
                                className="flex flex-wrap gap-x-1 gap-y-1 mb-1.5"
                                onClick={() => handleSeek(sub.start)}
                              >
                                 {sub.words.map((word, wIdx) => {
                                    const isSaved = savedWords.has(word.text);
                                    const isHovered = hoveredWord?.text === word.text;
                                    
                                    return (
                                       <span
                                         key={wIdx}
                                         onClick={(e) => onWordClick(e, word)}
                                         className={cn(
                                           "text-base font-medium transition-all duration-200 rounded px-1 -mx-0.5 border border-transparent font-korean cursor-pointer hover:bg-brand-cyan/20 hover:text-brand-cyan-light",
                                           isHovered ? "bg-brand-cyan/30 text-white font-bold" : (isActive ? "text-white" : "text-white/90"),
                                           isSaved && "text-brand-cyan border-b-2 border-brand-cyan/50 pb-0.5"
                                         )}
                                       >
                                         {word.text}
                                       </span>
                                    )
                                 })}
                              </div>
                              {sub.translation && (
                                <div className={cn("text-[13px] font-medium transition-colors duration-300", isActive ? "text-brand-cyan/70" : "text-white/60")}>
                                  {sub.translation}
                                </div>
                              )}
                            </div>
                         </div>
                      )
                   })}
                </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-white">
                   <Subtitles className="w-12 h-12 mb-4" />
                   <p className="text-lg">Субтитры не загружены</p>
                </div>
             )}
          </div>
        </Panel>

        <Separator className="w-px bg-transparent hover:bg-brand-cyan/50 transition-colors cursor-col-resize hidden md:block" />
        <Panel defaultSize={60} minSize={30} className="w-full h-full bg-[#161618]/95 dark:bg-[#161618]/95 backdrop-blur-2xl flex flex-col flex-shrink-0 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] relative z-10">
              {hoveredWord ? (
              <div className="p-6 h-full flex flex-col overflow-y-auto scrollbar-hide animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6 flex items-start justify-between">
                   <div>
                    <h2 className="text-4xl font-bold font-korean text-white mb-2">{hoveredWord.baseForm || hoveredWord.text}</h2>
                    <p className="text-xl text-brand-cyan font-medium">{hoveredWord.translation}</p>
                  </div>
                  <button 
                    onClick={() => toggleSaveWord(hoveredWord.text)}
                    className={cn(
                      "p-2.5 rounded-xl border transition-all duration-300 shrink-0",
                      savedWords.has(hoveredWord.text) 
                        ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan shadow-[0_0_15px_rgba(34,211,238,0.15)]" 
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-cyan"
                    )}
                  >
                    {savedWords.has(hoveredWord.text) ? <CheckCircle2 className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                </div>

                <div className="space-y-4 flex-1 mt-4">
                  <div className="bg-white/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-white dark:border-slate-800/50 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Грамматика</p>
                    <p className="text-slate-700 dark:text-slate-300 mb-2 leading-relaxed">{hoveredWord.grammar}</p>
                  </div>

                  {hoveredWord.particles && (
                    <div className="bg-white/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-white dark:border-slate-800/50 shadow-sm">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Частицы / Морфемы</p>
                      <p className="text-slate-700 dark:text-slate-300 mb-2 leading-relaxed">{hoveredWord.particles}</p>
                    </div>
                  )}

                  <div className="mt-8 flex flex-col gap-3">
                    <button 
                      onClick={handleGenerateBreakdown}
                      disabled={isGenerating}
                      className="w-full px-8 py-3.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed text-brand-cyan font-medium rounded-xl transition-all border border-brand-cyan/20 flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-5 h-5 border-t-2 border-brand-cyan rounded-full animate-spin" />
                          Связываемся с сервером...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 text-brand-cyan" />
                          AI разбор
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 flex-1 flex flex-col justify-center items-center text-center text-slate-400 dark:text-slate-500">
                 <div className="w-20 h-20 mb-6 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                   <BookOpen className="w-8 h-8 opacity-50" />
                 </div>
              </div>
            )}
          </Panel>
      </Group>
      </main>
    </div>
  );
}
