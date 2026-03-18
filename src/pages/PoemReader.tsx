import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Minus, Play, Pause, RotateCcw, 
  Volume2, Sparkles, Loader2, BookOpen
} from 'lucide-react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { cn } from '../lib/utils';

interface PoemWord {
  text: string;
  baseForm?: string;
  translation?: string;
  grammar?: string;
}

interface PoemLine {
  korean: string;
  translation: string;
  words: PoemWord[];
}

interface Poem {
  id: number;
  title: string;
  koreanTitle: string;
  author: string;
  content: PoemLine[];
  image: string;
  audioUrl: string;
  artisticTranslation: string;
}

const POEMS: Poem[] = [
  {
    id: 1,
    title: "Цветок",
    koreanTitle: "꽃",
    author: "Ким Чхун Су (김춘수)",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=800",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    artisticTranslation: "До того как я назвал его по имени,\nон был всего лишь робким движением.\nКогда я назвал его по имени,\nон пришел ко мне и стал цветком.",
    content: [
      {
        korean: "내가 그의 이름을 불러 주기 전에는",
        translation: "До того как я назвал его по имени",
        words: [
          { text: "내가", baseForm: "나", translation: "Я (им. падеж)", grammar: "Местоимение + частица 가" },
          { text: "그의", baseForm: "그", translation: "Его", grammar: "Местоимение + притяжательная частица 의" },
          { text: "이름을", baseForm: "이름", translation: "Имя (вин. падеж)", grammar: "Существительное + частица 을" },
          { text: "불러", baseForm: "부르다", translation: "Звать, называть", grammar: "Глагол в а/о форме" },
          { text: "주기", baseForm: "주다", translation: "Давать (делание для кого-то)", grammar: "Глагол + окончание 기" },
          { text: "전에는", baseForm: "전", translation: "До, прежде", grammar: "Существительное + частица 에는" }
        ]
      },
      {
        korean: "그는 다만 하나의 몸짓에 지나지 않았다",
        translation: "он был всего лишь робким движением",
        words: [
          { text: "그는", baseForm: "그", translation: "Он (тем. падеж)", grammar: "Местоимение + частица 는" },
          { text: "다만", baseForm: "다만", translation: "Только, лишь", grammar: "Наречие" },
          { text: "하나의", baseForm: "하나", translation: "Одного", grammar: "" },
          { text: "몸짓에", baseForm: "몸짓", translation: "Движение, жест", grammar: "" },
          { text: "지나지", baseForm: "지나다", translation: "Проходить, превышать", grammar: "" },
          { text: "않았다", baseForm: "않다", translation: "Не делать", grammar: "Отрицание в прошедшем времени" }
        ]
      }
    ]
  }
];

export default function PoemReader() {
  const [activePoem] = useState<Poem>(POEMS[0]);
  const [fontSize, setFontSize] = useState(24);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [selectedWord, setSelectedWord] = useState<PoemWord | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const p = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = p * audioRef.current.duration;
    }
  };

  const handleWordClick = (e: React.MouseEvent, word: PoemWord) => {
    e.stopPropagation();
    setSelectedWord(word);
  };

  const handleGenerateBreakdown = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-4 md:p-6 pb-0 w-full max-w-[1600px] mx-auto lg:h-[calc(100vh-24px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* External Header - Seamless Dark */}
      <div className="mb-4 shrink-0 flex items-center justify-between px-2">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Link to="/poems" className="p-2 -ml-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
             <h1 className="text-lg font-bold text-white leading-tight">
               {activePoem.koreanTitle} <span className="text-sm text-zinc-500 font-normal ml-1">({activePoem.title})</span>
             </h1>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">— {activePoem.author}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-1 shrink-0">
          <button 
            onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Minus size={16} />
          </button>
          <div className="w-8 text-center text-[11px] font-bold text-zinc-500 tabular-nums">
            {fontSize}
          </div>
          <button 
            onClick={() => setFontSize(prev => Math.min(48, prev + 2))}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <Group orientation="horizontal" className="flex flex-col lg:flex-row gap-0 bg-zinc-950 rounded-2xl border border-zinc-800/50 overflow-hidden shadow-2xl h-auto lg:h-full w-full max-w-[1400px] mx-auto min-h-0">
        
        {/* Left Column: Media (Top) + Transcript (Bottom) */}
        <Panel defaultSize={40} minSize={20} className="flex flex-col min-h-0 bg-zinc-950">
          
          {/* Media Player (Audio for Poems) */}
          <div className="w-full shrink-0 bg-zinc-900/80 p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
            {/* Background aesthetic blur */}
            <div className="absolute inset-0 bg-indigo-500/10 opacity-30 blur-3xl pointer-events-none" />
            
            <audio 
              ref={audioRef}
              src={activePoem.audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />

            <div className="relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-xl border border-white/10 shrink-0 group">
              <img src={activePoem.image} alt={activePoem.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
              </div>
            </div>

            <div className="flex-1 w-full space-y-4 relative z-10">
               <div>
                  <h2 className="text-indigo-400 text-sm font-semibold uppercase tracking-wider mb-1">Оригинальное чтение</h2>
                  <div className="flex items-center gap-4">
                     <button onClick={togglePlay} className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                     </button>
                     <div className="flex-1 space-y-2">
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full cursor-pointer relative group/progress" onClick={handleProgressClick}>
                          <div className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" style={{ left: `calc(${progress}% - 6px)` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                           <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                           <span>{formatTime(audioRef.current?.duration || 0)}</span>
                        </div>
                     </div>
                     <div className="hidden md:flex items-center gap-2 group/vol">
                        <Volume2 size={16} className="text-zinc-500 group-hover/vol:text-indigo-400 transition-colors" />
                        <div className="w-16 h-1 bg-zinc-800 rounded-full cursor-pointer relative overflow-hidden">
                           <div className="absolute top-0 left-0 h-full bg-zinc-400" style={{ width: `${volume * 100}%` }} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Transcript / Text scrolling area */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-6 lg:p-10 bg-zinc-950/20">
            <div className="max-w-3xl mx-auto space-y-12">
              {activePoem.content.map((line, idx) => (
                <div key={idx} className="group flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div 
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {line.words.map((word, wIdx) => (
                      <span 
                        key={wIdx}
                        onClick={(e) => handleWordClick(e, word)}
                        className="text-white hover:text-indigo-300 hover:bg-indigo-500/20 px-1 -mx-0.5 rounded transition-colors"
                      >
                        {word.text}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-[13px] font-medium text-white/60">
                    {line.translation}
                  </div>
                </div>
              ))}

              <div className="pt-12 mt-12 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">
                  <span className="w-8 h-px bg-indigo-500/30" />
                  Художественный перевод
                </div>
                <p className="text-zinc-400 text-lg md:text-xl italic leading-relaxed whitespace-pre-line font-serif">
                  {activePoem.artisticTranslation}
                </p>
              </div>
            </div>
          </div>
        </Panel>

        <Separator className="w-px bg-transparent hover:bg-indigo-500/50 transition-colors cursor-col-resize hidden lg:block" />

        {/* Right Column: Dictionary / Grammar Breakdown */}
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
                  className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              <div className="grid gap-6">
                <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl relative overflow-hidden group">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    Перевод
                  </h4>
                  <p className="text-2xl md:text-3xl font-bold text-white leading-tight">
                    {selectedWord.translation}
                  </p>
                </div>

                {selectedWord.grammar && (
                  <div className="p-6 bg-zinc-800/40 border border-zinc-700/50 rounded-2xl">
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                      Грамматика
                    </h4>
                    <div className="text-base text-zinc-200 bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl leading-relaxed">
                      {selectedWord.grammar}
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
               <h3 className="text-2xl font-bold text-zinc-300 mb-2">Разбор предложения</h3>
               <p className="text-zinc-400 font-medium max-w-sm text-lg">
                 Кликните на любое слово в стихотворении слева, чтобы увидеть подробный разбор конструкции и перевод.
               </p>
            </div>
          )}
        </Panel>
      </Group>
    </div>
  );
}
