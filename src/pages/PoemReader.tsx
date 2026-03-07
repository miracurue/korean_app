import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Play, Pause, Bookmark, Sparkles, BookOpen, Volume2, CheckCircle2, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { POEMS } from '../data/poems';

export default function PoemReader() {
  const { id } = useParams();
  
  // Find poem by ID or default to the first one if no matching ID
  const activePoem = id ? POEMS.find(p => p.id === parseInt(id)) : POEMS[0];
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredWord, setHoveredWord] = useState<any | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

  // Early return or redirect if not found (though default handled above)
  if (!activePoem) return <Navigate to="/poems" />;

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
      {/* Top Header */}
      <header className="h-16 border-b border-white/40 dark:border-slate-800/50 flex flex-shrink-0 items-center px-6 justify-between bg-white/60 dark:bg-slate-950/40 backdrop-blur-2xl z-20">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-brand-gold" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {activePoem.koreanTitle} <span className="text-sm font-normal text-slate-500 ml-2">({activePoem.title})</span>
          </h1>
          <span className="text-sm text-slate-400 font-medium ml-2">— {activePoem.author}</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors">
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">В закладки</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
        {/* Main Reading Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-10 md:px-12 flex flex-col relative bg-slate-50/50 dark:bg-slate-900/10">
          
          {/* Aesthetic background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-brand-gold/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Audio Player pinned to top of text area */}
          {activePoem.hasAudio && (
            <div className="max-w-2xl mx-auto w-full mb-12 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4 sticky top-0 z-10 text-slate-900 dark:text-white">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-brand-gold text-white rounded-full shadow-lg shadow-brand-gold/30 hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
              </button>
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>00:00</span>
                  <div className="flex items-center gap-1.5 text-brand-gold">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Оригинальная озвучка</span>
                  </div>
                  <span>02:15</span>
                </div>
                {/* Simulated Waveform / Progress bar */}
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full cursor-pointer relative group/progress overflow-hidden">
                   <div className="absolute top-0 bottom-0 left-0 bg-brand-gold w-1/3 rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* Poem Text Container */}
          <div className="max-w-2xl mx-auto w-full relative z-0">
            {activePoem.stanzas.map(stanza => (
              <div key={stanza.id} className="mb-12 space-y-8">
                {stanza.lines.map(line => (
                  <div key={line.id} className="group/line">
                    <div className="flex flex-wrap gap-x-2 gap-y-3 mb-2">
                       {line.words.map((word, wIdx) => {
                          const isSaved = savedWords.has(word.text);
                          return (
                            <span 
                              key={wIdx}
                              onMouseEnter={() => setHoveredWord(word)}
                              className={cn(
                                "text-2xl sm:text-3xl font-korean transition-all duration-200 cursor-pointer rounded-lg px-1.5 -mx-1.5",
                                hoveredWord?.text === word.text ? "bg-brand-gold/20 text-slate-900 dark:text-white" : "text-slate-800 dark:text-slate-200 hover:text-brand-gold",
                                isSaved && "text-brand-cyan border-b-2 border-brand-cyan/50 pb-0.5"
                              )}
                            >
                              {word.text}
                            </span>
                          );
                       })}
                    </div>
                    {/* Line Translation - visible softly, full opacity on line hover */}
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 opacity-60 group-hover/line:opacity-100 transition-opacity">
                      {line.translation}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Word Analysis Sidebar */}
        <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-white/40 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/50 backdrop-blur-2xl flex flex-col flex-shrink-0 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
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
                <p className="text-2xl text-brand-gold font-medium">{hoveredWord.translation}</p>
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

                <div className="bg-brand-gold/5 dark:bg-brand-gold/5 rounded-2xl p-4 border border-brand-gold/20">
                  <p className="text-xs text-brand-gold uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    ИИ Разбор контекста
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    В поэзии форма <span className="font-korean">{hoveredWord.text}</span> часто используется для придания лиричности. В повседневной речи обычно говорят иначе.
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
               <p className="text-sm max-w-[200px]">Выберите любое слово в строке, чтобы увидеть детальный разбор и перевод.</p>
            </div>
          )}

          {/* Optional Artistic Translation of the whole stanza/poem at bottom */}
          <div className="p-4 border-t border-white/40 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
               <MessageCircle className="w-3.5 h-3.5" /> Художественный перевод
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 italic whitespace-pre-line">
              {activePoem.artisticTranslation}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
