import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { 
  ArrowLeft, Play, Pause, Volume2, Maximize, Settings, Subtitles, 
  Bookmark, Sparkles, BookOpen, MessageCircle, CheckCircle2, 
  Upload, FileVideo, FileText, X
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

const parseTime = (timeStr: string) => {
  if (!timeStr) return 0;
  const parts = timeStr.trim().replace(',', '.').split(':');
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
  } else if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return 0;
};

const parseSubtitles = (text: string): SubtitleBlock[] => {
  const blocks: SubtitleBlock[] = [];
  const lines = text.trim().split(/\r?\n/);
  
  let i = 0;
  let id = 0;
  while (i < lines.length) {
    let line = lines[i].trim();
    if (!line || line === 'WEBVTT') {
      i++;
      continue;
    }
    
    // Skip numeric IDs
    if (/^\d+$/.test(line)) {
      i++;
      if (i >= lines.length) break;
      line = lines[i].trim();
    }
    
    // Timestamp line
    if (line.includes('-->')) {
      const parts = line.split('-->');
      const start = parseTime(parts[0]);
      const end = parseTime(parts[1]);
      
      i++;
      let subText = '';
      while (i < lines.length && lines[i].trim() !== '') {
        subText += (subText ? ' ' : '') + lines[i].trim();
        i++;
      }
      
        if (subText) {
          // Fallback: split by spaces to mock words since we don't run AI parsing locally by default
          const words = subText.split(/\s+/).filter(Boolean).map(w => ({ 
            text: w, 
            baseForm: w.replace(/[.,!?]/g, ''),
            translation: 'Нажмите для перевода',
            grammar: 'Нажмите для анализа',
          }));
          blocks.push({ 
            id: id++, 
            start, 
            end, 
            text: subText, 
            translation: 'Нажмите для получения перевода фразы',
            words 
          });
        }
    } else {
      i++;
    }
  }
  return blocks;
};

const formatTime = (time: number) => {
  if (isNaN(time)) return "00:00";
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// Simple form of IndexedDB for local file persistence across reloads
const DB_NAME = 'BYOC_DB';
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

const saveFilesToStore = async (video: File | null, subtitle: File | null) => {
  if (!video) return;
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ video, subtitle }, 'current_session');
  } catch (e) {
    console.error('Failed to save BYOC session:', e);
  }
};

const loadFilesFromStore = async (): Promise<{video: File, subtitle: File | null} | null> => {
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

export default function LocalPlayer() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Upload State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
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

  const { saveProgress, getProgress } = useProgress('video');
  const lastSaveTime = useRef(0);

  const onWordClick = (e: React.MouseEvent, word: SubtitleWord) => {
     e.stopPropagation();
     e.preventDefault();
     setHoveredWord(word);
     if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
     }
     
     // Automatically trigger "server" fetch if it's still a placeholder
     if (word.translation === 'Нажмите для перевода' || word.translation?.includes('недоступен')) {
        handleGenerateBreakdown(word);
     }
  };

  // Handle initialization from router state or IndexedDB
  useEffect(() => {
    let isMounted = true;
    const initFiles = async () => {
      if (location.state) {
        const { videoFile: passedVideo, subtitleFile: passedSub } = location.state as any;
        
        if (passedVideo) {
          setVideoFile(passedVideo);
          setVideoUrl(URL.createObjectURL(passedVideo));
          setIsReadyToPlay(true);
          
          if (passedSub) {
            setSubtitleFile(passedSub);
            const text = await passedSub.text();
            if (isMounted) setSubtitles(parseSubtitles(text));
          }
          await saveFilesToStore(passedVideo, passedSub || null);
        }
        
        // Clear state so we don't accidentally reload on unmount/remount
        navigate('.', { replace: true, state: null });
        return;
      }

      // Try loading from IDB if no router state
      const saved = await loadFilesFromStore();
      if (saved && saved.video && isMounted) {
        setVideoFile(saved.video);
        setVideoUrl(URL.createObjectURL(saved.video));
        setIsReadyToPlay(true);
        if (saved.subtitle) {
          setSubtitleFile(saved.subtitle);
          const text = await saved.subtitle.text();
          if (isMounted) setSubtitles(parseSubtitles(text));
        }
      }
    };
    
    initFiles();
    return () => { isMounted = false; };
  }, [location.state, navigate]);

  // If we don't have files and we finished trying to load them, redirect
  useEffect(() => {
    if (!isReadyToPlay && !videoFile) {
       // We'll give it a tiny delay to ensure IDB had a chance
       const timer = setTimeout(() => {
          if (!videoUrl) navigate('/rooms/video');
       }, 500);
       return () => clearTimeout(timer);
    }
  }, [isReadyToPlay, videoFile, videoUrl, navigate]);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const subtitleListRef = useRef<HTMLDivElement>(null);

  // File Handlers
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setIsPlaying(false);
      saveFilesToStore(file, subtitleFile); // Save explicitly when users upload manually
    }
  };

  const handleSubSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubtitleFile(file);
      const text = await file.text();
      setSubtitles(parseSubtitles(text));
      if (videoFile) saveFilesToStore(videoFile, file); // Save explicitly
    }
  };

  const handleReset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl('');
    setSubtitleFile(null);
    setSubtitles([]);
    setIsPlaying(false);
    setIsReadyToPlay(false);
    navigate('/rooms/video');
  };

  // Video Handlers
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      // Save progress periodically
      const now = Date.now();
      if (now - lastSaveTime.current > 3000 && videoFile) {
        saveProgress({
          id: `local_${videoFile.name}`,
          title: videoFile.name,
          source: 'Локальный файл',
          timestamp: time,
          duration: videoRef.current.duration || 0,
          isLocal: true
        });
        lastSaveTime.current = now;
      }
      
      const index = subtitles.findIndex(sub => time >= sub.start && time < sub.end);
      if (index !== -1 && index !== activeSubtitleIndex) {
        setActiveSubtitleIndex(index);
        
        // Auto-scroll logic
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
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      
      // Auto-resume from saved progress if available
      if (videoFile) {
         const progress = getProgress(`local_${videoFile.name}`);
         if (progress && progress.timestamp > 0) {
            videoRef.current.currentTime = progress.timestamp;
            setCurrentTime(progress.timestamp);
         }
      }
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      if (!isPlaying) {
        videoRef.current.play();
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
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const handleGenerateBreakdown = (targetWord?: SubtitleWord) => {
    const wordToProcess = targetWord || hoveredWord;
    if (!wordToProcess) return;
    setIsGenerating(true);
    
    // Имитация запроса к серверу для получения разбора и перевода
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
      
      // Also update it in the subtitles list if found
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
    
    // Имитация массового перевода всех строк
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

  if (!isReadyToPlay && !videoFile) {
     return (
       <div className="h-screen w-full flex items-center justify-center bg-[#09090b]">
           <div className="animate-pulse flex flex-col items-center gap-4 text-slate-500">
               <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin" />
               <p>Загрузка медиа...</p>
           </div>
       </div>
     );
  }

  // Active Subtitle for Video Overlay
  const activeSubtitle = activeSubtitleIndex !== -1 ? subtitles[activeSubtitleIndex] : null;

  return (
    <div className="h-screen flex flex-col bg-transparent transition-colors duration-300">
            {/* External Header - Seamless Dark */}
      {!isFullscreen && (
        <header className="h-16 flex flex-shrink-0 items-center px-8 bg-transparent">
          <div className="flex items-center gap-4">
            <button onClick={handleReset} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white leading-tight truncate max-w-sm">{videoFile?.name}</h1>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                 {subtitles.length > 0 ? `${subtitles.length} строк субтитров` : 'Без субтитров'}
              </span>
            </div>
          </div>
        </header>
      )}      <main className={cn("flex-1 overflow-hidden transition-all duration-500", !isFullscreen && "p-4 md:p-6 lg:p-8")}>
        <Group 
          orientation="horizontal" 
          className={cn(
            "h-full w-full flex overflow-hidden flex-col md:flex-row transition-all duration-500",
            !isFullscreen && "bg-[#0c0c0e] rounded-3xl border border-zinc-800/50 shadow-2xl max-w-[1600px] mx-auto"
          )}
        >
        
        {/* Left Area: Video (Top) + Subtitles (Bottom) */}
        <Panel defaultSize={40} minSize={20} className="flex flex-col relative bg-[#0c0c0e] overflow-hidden">
          <Group orientation="vertical">
            <Panel defaultSize={55} minSize={20}>
              {/* Video Container Area */}
              <div 
                 ref={playerContainerRef} 
                 className="w-full h-full relative flex flex-col items-center bg-black group transition-all duration-300 flex-shrink-0"
              >
             <video 
               ref={videoRef}
               src={videoUrl}
               className="w-full h-full object-contain"
               onClick={togglePlay}
               onTimeUpdate={handleTimeUpdate}
               onLoadedMetadata={handleLoadedMetadata}
               onEnded={() => setIsPlaying(false)}
               onPlay={() => setIsPlaying(true)}
               onPause={() => setIsPlaying(false)}
               playsInline
             />
             
             {/* On-video Floating Subtitles */}
             {showSubtitles && activeSubtitle && subtitles.length > 0 && (
                <div className="absolute bottom-10 left-0 right-0 flex justify-center z-30 px-8 transition-opacity duration-300 pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 shadow-2xl inline-block pointer-events-auto max-w-[90%]">
                    <div className={cn("flex flex-wrap justify-center gap-x-1 gap-y-1 font-korean tracking-wide", isFullscreen ? "text-4xl md:text-5xl lg:text-6xl" : "text-2xl md:text-3xl")}>
                       {activeSubtitle.words.map((word, wIdx) => {
                          const isHovered = hoveredWord?.text === word.text;
                          return (
                            <span
                              key={wIdx}
                              onClick={(e) => onWordClick(e, word)}
                              className={cn(
                                "cursor-pointer transition-all duration-200 rounded-xl px-1.5 -mx-1.5 py-1 hover:bg-indigo-500/20 hover:text-white drop-shadow-lg",
                                isHovered ? "bg-indigo-500 text-white font-bold scale-110 shadow-[0_0_20px_rgba(99,102,241,0.4)]" : "text-white"
                              )}
                            >
                               {word.text}
                            </span>
                          )
                       })}
                    </div>
                  </div>
                </div>
              )}

             {/* Minimalist Controls Overlay from VideoPlayer */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6 pb-4 z-20">
               {/* Progress Bar */}
               <div className="w-full h-1.5 bg-slate-800 rounded-full mb-4 cursor-pointer relative group/progress" onClick={handleProgressClick}>
                 <div 
                   className="absolute left-0 top-0 bottom-0 bg-indigo-500 rounded-full transition-all duration-100 ease-linear pointer-events-none" 
                   style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                 />
                 <div 
                   className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none" 
                   style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 6px)` }} 
                 />
               </div>

               {/* Buttons */}
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4 md:gap-6">
                   <button 
                     onClick={togglePlay}
                     className="text-white hover:text-indigo-400 transitions-colors"
                   >
                     {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current" />}
                   </button>
                   <div className="flex items-center gap-2 text-white/90">
                     <Volume2 className="w-5 h-5 cursor-pointer hover:text-white" onClick={() => setVolume(v => v === 0 ? 1 : 0)} />
                     <div className="hidden sm:block w-20 h-1.5 bg-slate-700/80 rounded-full cursor-pointer relative"
                          onClick={(e) => {
                             const rect = e.currentTarget.getBoundingClientRect();
                             setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
                          }}>
                       <div className="absolute left-0 top-0 bottom-0 bg-white rounded-full pointer-events-none" style={{ width: `${volume * 100}%` }} />
                     </div>
                   </div>
                   <span className="text-xs md:text-sm text-slate-300 font-medium font-mono tabular-nums">
                     {formatTime(currentTime)} / {formatTime(duration)}
                   </span>
                 </div>
                 
                 <div className="flex items-center gap-3 md:gap-4">
                   {subtitles.length > 0 && (
                     <button 
                       onClick={() => setShowSubtitles(!showSubtitles)}
                       title={showSubtitles ? "Скрыть субтитры на видео" : "Показать субтитры на видео"}
                       className={cn("px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border", showSubtitles ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" : "text-slate-400 hover:text-white bg-slate-800/80 border-slate-700")}
                     >
                       <Subtitles className="w-5 h-5 pointer-events-none" />
                       <span className="hidden sm:inline pointer-events-none">{showSubtitles ? 'Вкл' : 'Выкл'}</span>
                     </button>
                   )}
                   <button onClick={toggleFullscreen} className="text-slate-400 hover:text-white transition-colors">
                     <Maximize className="w-5 h-5" />
                   </button>
                 </div>
               </div>
              </div>
           </div>
         </Panel>

         {/* Resizer Handle for Video/Subtitles */}
         <Separator className={cn("h-px bg-transparent hover:bg-brand-cyan/50 transition-colors cursor-row-resize", isFullscreen && "hidden")} />

         {/* Subtitles Scrolling List (Bottom Area) */}
         <Panel 
             defaultSize={45} 
             minSize={20}
             ref={subtitleListRef} 
             className={cn(
               "flex-1 overflow-y-auto scrollbar-hide px-6 pt-3 pb-24 bg-[#0c0c0e] transition-all duration-300 w-full",
               isFullscreen ? "hidden" : "block z-10 relative"
             )}
          >
             {subtitles.length > 0 ? (
                <div className="max-w-4xl mx-auto flex flex-col">
                   <div className="mb-4 flex justify-center">
                     <button
                       onClick={handleTranslateAll}
                       disabled={isTranslatingAll}
                       className={cn(
                         "flex items-center gap-2 px-6 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-sm font-medium hover:bg-indigo-500/20 transition-all cursor-pointer",
                         isTranslatingAll && "opacity-50 cursor-not-allowed"
                       )}
                     >
                       {isTranslatingAll ? (
                         <>
                           <div className="w-4 h-4 border-t-2 border-indigo-400 rounded-full animate-spin" />
                           Переводим...
                         </>
                       ) : (
                         <>
                           <Sparkles className="w-4 h-4" />
                           Перевести все субтитры (перевод появится под фразами)
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
                               ? "opacity-100 scale-[1.02] translate-x-2 bg-indigo-500/10 border-indigo-500/20 rounded-2xl -ml-4 pl-4 py-3" 
                               : isPast 
                                 ? "opacity-30 hover:opacity-60" 
                                 : "opacity-60 hover:opacity-80"
                           )}
                         >
                            {/* Decorative indicator for active line */}
                            {isActive && <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                            
                            {/* Timestamp Button */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeek(sub.start);
                              }}
                              className={cn(
                                "shrink-0 h-fit px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all mt-1.5 cursor-pointer",
                                isActive 
                                  ? "bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]" 
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
                                           "text-base font-medium transition-all duration-200 rounded px-1 -mx-0.5 border border-transparent font-korean cursor-pointer hover:bg-indigo-500/20 hover:text-indigo-300",
                                           isHovered ? "bg-indigo-500/30 text-white font-bold" : (isActive ? "text-white" : "text-white/90"),
                                           isSaved && "text-indigo-400 border-b-2 border-indigo-500/50 pb-0.5"
                                         )}
                                       >
                                         {word.text}
                                       </span>
                                    )
                                 })}
                              </div>
                               {sub.translation && (
                                 <div className={cn("text-[13px] font-medium transition-colors duration-300", isActive ? "text-brand-cyan/80" : "text-white/60")}>
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
           </Panel>
         </Group>
       </Panel>

        {/* Right Side Sidebar (Dictionary from VideoPlayer) */}
        {!isFullscreen && (
          <>
          <Separator className="w-px bg-transparent hover:bg-brand-cyan/50 transition-colors cursor-col-resize hidden md:block" />
          <Panel defaultSize={60} minSize={30} className="w-full md:w-full bg-[#161618]/95 dark:bg-[#161618]/95 backdrop-blur-2xl flex flex-col flex-shrink-0 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] relative z-10">
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
                        ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan shadow-[0_0_15px_rgba(20,184,166,0.15)]" 
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
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold font-korean">Частицы / Морфемы</p>
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
               <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-3">Словарь</h3>
                 <p className="text-sm max-w-[200px] leading-relaxed">Выберите любое слово в тексте субтитров, чтобы увидеть перевод.</p>
              </div>
            )}
          </Panel>
          </>
        )}

      </Group>
      </main>
    </div>
  );
}
