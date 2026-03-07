import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, Maximize, Settings, Subtitles, Bookmark, Sparkles, BookOpen, MessageCircle, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { DRAMAS } from '../data/dramas';
import { cn } from '../lib/utils';

export default function VideoPlayer() {
  const { dramaId, episodeId } = useParams<{ dramaId: string, episodeId: string }>();
  const navigate = useNavigate();
  
  const drama = DRAMAS.find(d => d.id === Number(dramaId));
  const episode = drama?.episodes.find(e => e.id === Number(episodeId));

  const [isPlaying, setIsPlaying] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [hoveredWord, setHoveredWord] = useState<any | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

  if (!drama || !episode) {
    return <div className="h-screen flex items-center justify-center text-slate-400">Эпизод не найден</div>;
  }

  // Mock subtitle data for demonstration
  const activeSubtitle = {
    text: "이거 정말 맛있네요",
    translation: "Это действительно вкусно",
    words: [
      { text: "이거", baseForm: "이것", translation: "Эта вещь", grammar: "Местоимение 유", particles: "이/가" },
      { text: "정말", baseForm: "정말", translation: "Действительно", grammar: "Наречие" },
      { text: "맛있네요", baseForm: "맛있다", translation: "Вкусно", grammar: "Прилагательное + 전 (восклицание)", particles: "네요" }
    ]
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

  return (
    <div className="h-screen flex flex-col bg-transparent transition-colors duration-300">
      
      {/* Top Bar */}
      <header className="h-16 border-b border-white/40 dark:border-slate-800/50 flex flex-shrink-0 items-center px-6 justify-between bg-white/60 dark:bg-slate-700/40 backdrop-blur-2xl z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate max-w-sm">{episode.title}</h1>
            <span className="text-xs text-slate-500 dark:text-slate-400">{drama.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-brand-cyan/10 text-brand-cyan rounded-lg font-medium hover:bg-brand-cyan/20 transition-colors">
              <BookOpen className="w-4 h-4" />
              <span>Мой словарь (12)</span>
            </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col relative bg-black">
          {/* Video Container (Mock image here) */}
          <div className="flex-1 relative group flex items-center justify-center">
            <img 
              src={drama.image} 
              alt="Video frame" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 blur-sm"
            />
            {/* Center Cover / Actual Video Mock */}
            <div className="w-[80%] aspect-video bg-black rounded-lg shadow-2xl relative overflow-hidden border border-white/10 flex items-center justify-center">
                 <h2 className="text-white/50 text-2xl font-light">Вставьте видеофайл .mp4</h2>
                 
                 {/* On-video Subtitles */}
                {showSubtitles && (
                  <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100">
                      <p className="text-3xl font-bold text-white text-center drop-shadow-lg font-korean tracking-wide">
                        {activeSubtitle.text}
                      </p>
                    </div>
                  </div>
                )}
            </div>

            {/* Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none">
              <div className="pointer-events-auto">
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mb-4 cursor-pointer relative group/progress">
                    <div className="absolute left-0 top-0 bottom-0 bg-brand-cyan rounded-full w-[35%]" />
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" style={{ left: 'calc(35% - 6px)' }} />
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="text-white hover:text-brand-cyan transition-colors"
                      >
                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                      </button>
                      <div className="flex items-center gap-2 text-white">
                        <Volume2 className="w-5 h-5 cursor-pointer" />
                        <div className="w-24 h-1.5 bg-slate-600 rounded-full cursor-pointer relative">
                          <div className="absolute left-0 top-0 bottom-0 bg-white rounded-full w-[80%]" />
                        </div>
                      </div>
                      <span className="text-sm text-slate-300 font-medium font-mono">
                        12:45 / 1:02:18
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setShowSubtitles(!showSubtitles)}
                        className={cn("p-2 rounded-lg transition-colors", showSubtitles ? "text-brand-cyan bg-brand-cyan/10" : "text-slate-400 hover:text-white")}
                      >
                        <Subtitles className="w-5 h-5" />
                      </button>
                      <button className="text-slate-400 hover:text-white transition-colors">
                        <Settings className="w-5 h-5" />
                      </button>
                      <button className="text-slate-400 hover:text-white transition-colors">
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Subtitles Interaction Strip */}
          <div className="h-24 bg-white/10 backdrop-blur-3xl border-t border-white/20 flex items-center justify-center px-8 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 to-transparent opacity-20 pointer-events-none" />
             <button className="absolute left-4 p-2 text-white/50 hover:text-white"><ChevronLeft className="w-6 h-6" /></button>
             
             <div className="flex gap-3 relative z-10">
                 {activeSubtitle.words.map((word, wIdx) => {
                    const isSaved = savedWords.has(word.text);
                    return (
                      <span 
                        key={wIdx}
                        onMouseEnter={() => setHoveredWord(word)}
                        className={cn(
                          "text-3xl font-korean transition-all duration-200 cursor-pointer rounded-lg px-2",
                          hoveredWord?.text === word.text ? "bg-brand-cyan/30 text-white font-bold transform -translate-y-1" : "text-slate-300",
                          isSaved && "border-b-2 border-brand-cyan pb-1"
                        )}
                      >
                        {word.text}
                      </span>
                    );
                 })}
             </div>

             <button className="absolute right-4 p-2 text-white/50 hover:text-white"><ChevronRight className="w-6 h-6" /></button>
          </div>
        </div>

        {/* Right Side: Word Analysis Sidebar */}
        <div className="w-96 border-l border-white/40 dark:border-slate-800/50 bg-white/70 dark:bg-slate-700/50 backdrop-blur-2xl flex flex-col flex-shrink-0 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
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
                <p className="text-2xl text-brand-cyan font-medium">{hoveredWord.translation}</p>
              </div>

              <div className="space-y-4 flex-1">
                <div className="bg-white/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-white dark:border-slate-800/50 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Грамматический разбор</p>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">{hoveredWord.grammar}</p>
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
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    В данном эпизоде герой использует <span className="font-korean">{hoveredWord.text}</span> с особым ударением, чтобы выразить удивление.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 h-full flex flex-col justify-center items-center text-center text-slate-400 dark:text-slate-500">
               <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                 <Subtitles className="w-8 h-8 opacity-50" />
               </div>
               <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Наведите на слово</h3>
               <p className="text-sm max-w-[200px]">Выберите любое слово в субтитрах под видео, чтобы увидеть детальный разбор и перевод.</p>
            </div>
          )}

          <div className="p-4 border-t border-white/40 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
               <MessageCircle className="w-3.5 h-3.5" /> Значение фразы
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 italic whitespace-pre-line truncate">
              {activeSubtitle.translation}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
