import React, { useState, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { Sparkles, BookOpen, Volume2, CheckCircle2, Loader2, ArrowLeft, Heart, Bookmark, Share2, Quote as QuoteIcon, Upload, Music, Plus, Minus } from 'lucide-react';
import { MOCK_QUOTES } from '../data/quotes';
import { cn } from '../lib/utils';

export default function QuoteReader() {
  const { id } = useParams();
  
  // Find quote by ID or default to the first one
  const activeQuote = id ? MOCK_QUOTES.find(q => q.id === id) : MOCK_QUOTES[0];
  
  const [selectedWord, setSelectedWord] = useState<{
    text: string;
    translation: string;
    baseForm?: string;
    particles?: string;
    grammar?: string;
  } | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Default size in pixels (text-lg equivalent)

  if (!activeQuote) return <Navigate to="/quotes" />;

  // Split quote into words for interactive selection
  const words = activeQuote.textKor.split(' ').map(word => ({
    text: word,
    // Mock data for words - in a real app this would come from an API or a dictionary
    translation: 'Перевод слова...',
    baseForm: word.replace(/[은는이가을를요]$/, ''),
    particles: 'Окончание/Частица',
    grammar: 'Грамматическое пояснение для этого слова в контексте.'
  }));

  const handleWordClick = (word: typeof words[0]) => {
    setSelectedWord(word);
  };

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (selectedWord) {
        setSelectedWord({
          ...selectedWord,
          grammar: '[Сгенерировано ИИ] В данной фразе используется специфическая конструкция, выражающая намерение или вежливую просьбу. Окончание указывает на разговорный стиль.',
          particles: '[Сгенерировано ИИ] Морфема анализируется как корень + суффикс вежливости.'
        });
      }
      setIsGenerating(false);
    }, 1500);
  };

  const handleGenerateAudio = () => {
    setIsGeneratingAudio(true);
    setTimeout(() => {
      setIsGeneratingAudio(false);
      alert('Аудио успешно сгенерировано ИИ!');
    }, 2000);
  };

  return (
    <div className="p-4 md:p-6 pb-0 w-full max-w-[1600px] mx-auto lg:h-[calc(100vh-24px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* External Header - Seamless Dark */}
      <div className="mb-4 shrink-0 flex items-center justify-between px-2">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Link to="/quotes" className="p-2 -ml-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
             <h1 className="text-lg font-bold text-white leading-tight">
               Разбор цитаты <span className="text-sm text-zinc-500 font-normal ml-1">({activeQuote.source})</span>
             </h1>
             <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">— Цитатник</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-1 shrink-0">
          <button 
            onClick={() => setFontSize(prev => Math.max(16, prev - 4))}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Minus size={16} />
          </button>
          <div className="w-8 text-center text-[11px] font-bold text-zinc-500 tabular-nums">
            {fontSize}
          </div>
          <button 
            onClick={() => setFontSize(prev => Math.min(120, prev + 4))}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      {/* Main Reader Layout */}
      <Group orientation="horizontal" className="flex flex-col lg:flex-row gap-0 bg-zinc-950 rounded-2xl border border-zinc-800/50 overflow-hidden shadow-2xl h-auto lg:h-full w-full max-w-[1400px] mx-auto min-h-0">
        
        {/* Left Column: Quote Text & Audio Controls */}
        <Panel defaultSize={40} minSize={25} className="flex flex-col min-h-0 border-b lg:border-b-0 border-zinc-800/50 bg-zinc-950">
          
          {/* Audio Action Area (Matching PoemReader player structure) */}
          <div className="w-full shrink-0 bg-zinc-900/80 p-6 border-b border-zinc-800/50 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
            {/* Background aesthetic blur */}
            <div className="absolute inset-0 bg-brand-cyan/10 opacity-30 blur-3xl pointer-events-none" />

            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 shadow-xl shadow-black/50 ring-1 ring-white/10 relative bg-zinc-950 flex items-center justify-center p-4 text-center">
               <QuoteIcon className="absolute top-2 left-2 w-8 h-8 text-white/5" />
               <span className="text-white/30 font-korean font-bold text-lg leading-tight line-clamp-3 z-10">{activeQuote.textKor}</span>
               <div className="absolute inset-0 bg-black/20 pointer-events-none" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center z-20">
                 <Music className="w-4 h-4 text-white" />
               </div>
            </div>
            
            <div className="flex-1 w-full flex flex-col justify-center relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Озвучка цитаты</h3>
                  <p className="text-sm text-zinc-400">Загрузите свой файл или сгенерируйте ИИ-войслайн</p>
                </div>
              </div>

              <div className="flex gap-3 relative z-10 mt-2">
                <button 
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all border border-zinc-700 shadow-sm"
                  onClick={() => alert('Открытие диалога выбора файла...')}
                >
                  <Upload className="w-4 h-4 text-brand-cyan" />
                  ЗАГРУЗИТЬ
                </button>
                <button 
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan rounded-xl text-xs font-bold transition-all border border-brand-cyan/20 shadow-sm"
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                >
                  {isGeneratingAudio ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  СГЕНЕРИРОВАТЬ
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Text Display */}
          <div className="flex-1 p-4 lg:p-6 min-h-0 overflow-y-auto scrollbar-hide bg-zinc-950/80 relative z-0">
            <QuoteIcon className="absolute top-10 right-10 w-32 h-32 text-zinc-800/20 -z-10" />
            
            <div className="w-full space-y-6 pb-16">
              <div className="space-y-1">
                <div className="px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent backdrop-blur-sm bg-transparent hover:bg-zinc-800/60">
                  <div className="font-medium mb-1.5 leading-relaxed flex flex-wrap gap-x-1 gap-y-1 font-korean" style={{ fontSize: `${fontSize}px` }}>
                    {words.map((word, wIdx) => (
                      <span 
                        key={wIdx}
                        onClick={() => handleWordClick(word)}
                        className={cn(
                          "px-1 -mx-0.5 rounded transition-colors",
                          selectedWord?.text === word.text 
                            ? "bg-brand-cyan text-white shadow-lg shadow-brand-cyan/20" 
                            : "text-white hover:text-brand-cyan hover:bg-brand-cyan/20"
                        )}
                      >
                        {word.text}
                      </span>
                    ))}
                  </div>
                  <div className="text-[13px] font-medium text-white/60">
                    {activeQuote.textRus}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Separator className="w-px bg-transparent hover:bg-brand-cyan/50 transition-colors cursor-col-resize hidden lg:block" />

        {/* Right Column: Breakdown & AI Analysis (Standardized with PoemReader) */}
        <Panel defaultSize={60} minSize={30} className="flex flex-col min-h-0 bg-zinc-900/95 dark:bg-zinc-900/95 backdrop-blur-md">
          {selectedWord ? (
            <div className="p-5 lg:p-8 flex-1 min-h-0 overflow-y-auto scrollbar-hide animate-in slide-in-from-right-4 fade-in duration-300 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-2">
                    {selectedWord.text}
                  </h3>
                  {selectedWord.baseForm && (
                    <div className="text-sm font-medium text-zinc-400 bg-zinc-800/80 inline-block px-2.5 py-1 rounded border border-zinc-700/50">
                      н.ф: <span className="text-zinc-200">{selectedWord.baseForm}</span>
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
              
              <p className="text-zinc-100 text-2xl font-medium mb-8">{selectedWord.translation}</p>
              
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
                    <h4 className="text-xs font-bold uppercase tracking-widest text-brand-cyan mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0" />
                      Грамматика
                    </h4>
                    <div className="text-base text-zinc-200 bg-brand-cyan/5 border border-brand-cyan/20 p-4 rounded-xl leading-relaxed">
                      {selectedWord.grammar}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="w-full lg:w-max px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-200 font-medium rounded-xl transition-all border border-zinc-700 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-brand-cyan" />
                      Генерация разбора...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-brand-cyan" />
                      Сгенерировать ИИ-разбор
                    </>
                  )}
                </button>
                
                <button className="w-full lg:w-max px-8 py-3.5 bg-brand-cyan hover:bg-brand-cyan/90 text-white font-medium rounded-xl transition-all shadow-lg shadow-brand-cyan/20 active:scale-[0.98]">
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
                 Кликните на любое слово в цитате слева, чтобы увидеть подробный разбор конструкции и перевод.
               </p>
            </div>
          )}
        </Panel>
      </Group>
      
      {/* Footer / Floating Actions */}
      <div className="mt-6 flex justify-center gap-4 py-4 relative z-20">
        <button className="flex items-center gap-2 text-zinc-500 hover:text-rose-500 transition-colors px-4 py-2 bg-zinc-900/50 rounded-full border border-zinc-800">
          <Heart className="w-4 h-4" /> <span className="text-xs font-bold">ЛАЙК</span>
        </button>
        <button className="flex items-center gap-2 text-zinc-500 hover:text-amber-500 transition-colors px-4 py-2 bg-zinc-900/50 rounded-full border border-zinc-800">
          <Bookmark className="w-4 h-4" /> <span className="text-xs font-bold">СОХРАНИТЬ</span>
        </button>
        <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors px-4 py-2 bg-zinc-900/50 rounded-full border border-zinc-800">
          <Share2 className="w-4 h-4" /> <span className="text-xs font-bold">ПОДЕЛИТЬСЯ</span>
        </button>
      </div>
    </div>
  );
}
