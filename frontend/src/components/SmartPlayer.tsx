import React, { useState, useRef, useEffect } from 'react';
import { Clip, Phrase, Word } from '../data/clips';
import { Play, Pause, Volume2, Maximize, Sparkles, Loader2 } from 'lucide-react';
import { useProgress } from '../lib/useProgress';

interface SmartPlayerProps {
  clip: Clip;
}

export default function SmartPlayer({ clip }: SmartPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { saveProgress } = useProgress('video');
  const lastSaveTime = useRef(0);

  const handleGenerateBreakdown = () => {
    if (!selectedWord) return;
    setIsGenerating(true);
    
    // Имитация запроса к ИИ (заглушка для будущего API)
    setTimeout(() => {
      setSelectedWord({
        ...selectedWord,
        base: selectedWord.base || selectedWord.kor,
        particles: selectedWord.particles || '[Сгенерировано ИИ] Окончание вежливого стиля',
        grammar: selectedWord.grammar || '[Сгенерировано ИИ] Подробное объяснение этой грамматики в данном контексте...',
        context: selectedWord.context || '[Сгенерировано ИИ] Дополнительных нюансов употребления не найдено.'
      });
      setIsGenerating(false);
    }, 1500);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      
      const now = Date.now();
      if (now - lastSaveTime.current > 3000) { // save every 3s
        saveProgress({
          id: clip.id,
          title: clip.title,
          source: clip.source,
          timestamp: time,
          duration: video.duration || 0,
          isLocal: clip.id === 'local'
        });
        lastSaveTime.current = now;
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [clip.mediaUrl]);

  // Auto-scroll transcript
  useEffect(() => {
    if (!transcriptRef.current) return;
    
    // Find the active phrase element
    const activeElement = transcriptRef.current.querySelector('.phrase-active');
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const handlePhraseClick = (phrase: Phrase) => {
    if (videoRef.current) {
      videoRef.current.currentTime = phrase.start;
      videoRef.current.play();
    }
  };

  const handleWordClick = (e: React.MouseEvent, word: Word) => {
    e.stopPropagation(); // Не перематываем видео при клике на слово
    if (videoRef.current && isPlaying) {
      videoRef.current.pause(); // Ставим на паузу для изучения слова
    }
    setSelectedWord(word);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-0 bg-zinc-950 rounded-2xl border border-zinc-800/50 overflow-hidden shadow-2xl h-auto lg:h-full w-full max-w-[1400px] mx-auto min-h-0">
      {/* Left Column: Media (Top) + Transcript (Bottom) */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-zinc-800/50">
        
        {/* Media Player */}
        <div className="relative w-full aspect-video shrink-0 bg-zinc-900 flex items-center justify-center group shadow-[0_4px_24px_-12px_rgba(0,0,0,0.8)] z-10">
          {clip.type === 'video' ? (
            <video
              ref={videoRef}
              src={clip.mediaUrl}
              className="w-full h-full object-contain bg-black"
              playsInline
            />
          ) : (
            <div className="w-full h-full relative flex items-center justify-center bg-black">
               <img src={clip.coverUrl || clip.coverUrls?.[0]} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Cover" />
               <audio ref={videoRef as any} src={clip.mediaUrl} />
               <Volume2 className="w-20 h-20 text-indigo-500/50 relative z-10" />
            </div>
          )}
          
          {/* Custom Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
            <div className="w-full bg-zinc-600/50 h-1.5 rounded-full overflow-hidden relative cursor-pointer group/progress" onClick={handleProgressClick}>
                <div 
                  className="absolute top-0 left-0 h-full bg-indigo-500 group-hover/progress:bg-indigo-400 transition-colors" 
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="p-2 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white transition-all transform hover:scale-105 active:scale-95">
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                </button>
                <span className="text-zinc-300 text-sm font-medium tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration || 0)}
                </span>
              </div>
              <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Transcript Section (Bottom Left) */}
        <div 
          className="flex-1 p-3 lg:p-5 min-h-0 overflow-y-auto scrollbar-hide bg-zinc-950/80 relative z-0" 
          ref={transcriptRef}
        >
          <div className="w-full space-y-2 pb-16">
            {clip.dialogue.map((phrase) => {
              const isActive = currentTime >= phrase.start && currentTime < phrase.end;
              const isPast = currentTime > phrase.end;

              return (
                <div 
                  key={phrase.id}
                  onClick={() => handlePhraseClick(phrase)}
                  className={`px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent backdrop-blur-sm ${
                    isActive 
                      ? 'phrase-active bg-indigo-500/15 border-indigo-500/30 shadow-sm' 
                      : isPast 
                        ? 'bg-transparent hover:bg-zinc-800/40 opacity-70 hover:opacity-100'
                        : 'bg-transparent hover:bg-zinc-800/60'
                  }`}
                >
                  {phrase.speaker && (
                    <div className={`text-[11px] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-2 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-700'}`} />
                      {phrase.speaker}
                    </div>
                  )}
                  
                  <div className="text-base font-medium mb-1 leading-relaxed flex flex-wrap gap-x-1.5 gap-y-1">
                    {phrase.words ? (
                      phrase.words.map((word, i) => (
                        <span 
                          key={word.id || i}
                          onClick={(e) => handleWordClick(e, word)}
                          className={`hover:text-indigo-300 hover:bg-indigo-500/20 px-1 -mx-1 rounded transition-colors ${
                            isActive ? 'text-white' : 'text-zinc-300'
                          }`}
                        >
                          {word.kor}
                        </span>
                      ))
                    ) : (
                      <span className={isActive ? 'text-white' : 'text-zinc-300'}>
                        {phrase.kor}
                      </span>
                    )}
                  </div>
                  
                  <div className={`text-[13px] font-medium ${isActive ? 'text-indigo-200/80' : 'text-zinc-500/90'}`}>
                    {phrase.rus}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Dictionary / Grammar Breakdown */}
      <div className="lg:col-span-6 xl:col-span-7 flex flex-col min-h-0 bg-zinc-900/60">
        {selectedWord ? (
          <div className="p-5 lg:p-8 flex-1 min-h-0 overflow-y-auto scrollbar-hide animate-in slide-in-from-right-4 fade-in duration-300 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-4xl md:text-5xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
                  {selectedWord.kor}
                </h3>
                {selectedWord.base && (
                  <div className="text-sm font-medium text-zinc-400 bg-zinc-800/80 inline-block px-2.5 py-1 rounded border border-zinc-700/50">
                    н.ф: <span className="text-zinc-200">{selectedWord.base}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setSelectedWord(null)} 
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <p className="text-zinc-100 text-2xl font-medium mb-8">{selectedWord.rus}</p>
            
            <div className="space-y-6 lg:space-y-8 mb-8">
              {selectedWord.particles && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    Частицы / Морфемы
                  </h4>
                  <div className="text-base text-zinc-200 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl leading-relaxed">
                    {selectedWord.particles}
                  </div>
                </div>
              )}
              
              {selectedWord.grammar && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                    Грамматика
                  </h4>
                  <div className="text-base text-zinc-200 bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl leading-relaxed">
                    {selectedWord.grammar}
                  </div>
                </div>
              )}

              {selectedWord.context && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    Контекст / Идиома
                  </h4>
                  <div className="text-base text-amber-100/90 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl leading-relaxed">
                    {selectedWord.context}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <button 
                onClick={handleGenerateBreakdown}
                disabled={isGenerating}
                className="w-full lg:w-max px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-200 font-medium rounded-xl transition-all border border-zinc-700 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                    Генерация разбора...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    Сгенерировать ИИ-разбор
                  </>
                )}
              </button>
              
              <button className="w-full lg:w-max px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
                Добавить в личный словарь
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-8 opacity-40">
             <div className="w-24 h-24 rounded-3xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mb-6 shadow-inner">
               <span className="text-5xl font-serif text-zinc-500">가</span>
             </div>
             <h3 className="text-2xl font-bold text-zinc-300 mb-2">Разбор предложения</h3>
             <p className="text-zinc-400 font-medium max-w-sm text-lg">
               Кликните на любое слово в субтитрах слева, чтобы увидеть подробный разбор конструкции и перевод.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
