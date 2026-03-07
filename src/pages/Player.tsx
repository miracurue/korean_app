import { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize, Settings, Subtitles, Sparkles, Plus, BookOpen, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

// Mock Data
const MOCK_SUBTITLES = [
  {
    id: 1,
    start: 0,
    end: 3,
    text: "안녕하세요, 저는 한국어를 배웁니다.",
    artisticTranslation: "Здравствуйте, я изучаю корейский язык.",
    words: [
      { text: "안녕", baseForm: "안녕", particles: "하세요", grammar: "Уважительное приветствие", translation: "Здравствуйте", culturalComment: "Используется в формальной и вежливой речи." },
      { text: "하", baseForm: "하다", particles: "세요", grammar: "Глагол 'делать' + уважительное окончание", translation: "Делаете" },
      { text: "세", baseForm: "", particles: "", grammar: "", translation: "" },
      { text: "요,", baseForm: "", particles: "", grammar: "", translation: "" },
      { text: "저", baseForm: "저", particles: "는", grammar: "Скромное местоимение 'я' + выделительная частица", translation: "Я" },
      { text: "는", baseForm: "", particles: "", grammar: "", translation: "" },
      { text: "한국어", baseForm: "한국어", particles: "를", grammar: "Корейский язык + винительный падеж", translation: "Корейский язык" },
      { text: "를", baseForm: "", particles: "", grammar: "", translation: "" },
      { text: "배웁", baseForm: "배우다", particles: "니다", grammar: "Глагол 'изучать' + официально-вежливый стиль", translation: "Изучаю" },
      { text: "니다.", baseForm: "", particles: "", grammar: "", translation: "" }
    ]
  },
  {
    id: 2,
    start: 3.5,
    end: 6,
    text: "드라마를 보면서 공부하면 재미있어요.",
    artisticTranslation: "Учить язык, смотря дорамы, очень весело.",
    words: [
      { text: "드라마", baseForm: "드라마", particles: "를", grammar: "Дорама + винительный падеж", translation: "Дораму" },
      { text: "를", baseForm: "", particles: "", grammar: "", translation: "" },
      { text: "보", baseForm: "보다", particles: "면서", grammar: "Глагол 'смотреть' + деепричастие одновременности", translation: "Смотря" },
      { text: "면서", baseForm: "", particles: "", grammar: "", translation: "" },
      { text: "공부하", baseForm: "공부하다", particles: "면", grammar: "Глагол 'учиться' + условное наклонение", translation: "Если учиться" },
      { text: "면", baseForm: "", particles: "", grammar: "", translation: "" },
      { text: "재미있", baseForm: "재미있다", particles: "어요", grammar: "Прилагательное 'интересный' + неофициально-вежливый стиль", translation: "Интересно" },
      { text: "어요.", baseForm: "", particles: "", grammar: "", translation: "" }
    ]
  }
];

export default function Player() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  const [hoveredWord, setHoveredWord] = useState<any | null>(null);
  const [showSubtitles, setShowSubtitles] = useState(true);
  
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1;
          if (next > 10) return 0;
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const index = MOCK_SUBTITLES.findIndex(sub => currentTime >= sub.start && currentTime <= sub.end);
    if (index !== -1) {
      setActiveSubtitleIndex(index);
    }
  }, [currentTime]);

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    const index = MOCK_SUBTITLES.findIndex(sub => time >= sub.start && time <= sub.end);
    if (index !== -1) setActiveSubtitleIndex(index);
  };

  const activeSubtitle = MOCK_SUBTITLES[activeSubtitleIndex];

  return (
    <div className="h-screen flex flex-col bg-transparent transition-colors duration-300">
      {/* Top Bar */}
      <header className="h-16 border-b border-white/40 dark:border-slate-800/50 flex items-center px-6 justify-between bg-white/60 dark:bg-slate-950/40 backdrop-blur-2xl z-20 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Токкэби (Гоблин)</h1>
          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium">Серия 4</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Player Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Video Container (Always dark for better viewing) */}
          <div className="flex-1 bg-black relative group flex items-center justify-center">
            <img 
              src="https://picsum.photos/seed/kdrama/1920/1080" 
              alt="Video frame" 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            
            {/* On-video Subtitles */}
            {showSubtitles && activeSubtitle && (
              <div className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-none">
                <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
                  <p className="text-3xl font-bold text-white text-center drop-shadow-lg font-korean tracking-wide">
                    {activeSubtitle.text}
                  </p>
                </div>
              </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full mb-4 cursor-pointer relative group/progress">
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-brand-cyan rounded-full"
                  style={{ width: `${(currentTime / 10) * 100}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                  style={{ left: `calc(${(currentTime / 10) * 100}% - 6px)` }}
                />
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
                    <Volume2 className="w-5 h-5" />
                    <div className="w-24 h-1 bg-slate-600 rounded-full">
                      <div className="w-2/3 h-full bg-white rounded-full" />
                    </div>
                  </div>
                  <span className="text-sm text-slate-300 font-medium font-mono">
                    00:00:{(currentTime).toFixed(1).padStart(4, '0')} / 00:00:10.0
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
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Subtitle Panel (Below Video) */}
          <div className="h-64 bg-white/60 dark:bg-slate-950/40 backdrop-blur-2xl border-t border-white/40 dark:border-slate-800/50 flex flex-col transition-colors duration-300">
            {/* Full Phrase Artistic Translation */}
            <div className="px-6 py-4 bg-white/40 dark:bg-slate-900/40 border-b border-white/40 dark:border-slate-800/50 flex items-center justify-between transition-colors duration-300">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1 uppercase tracking-wider">Художественный перевод</p>
                <p className="text-lg text-slate-700 dark:text-slate-300">{activeSubtitle?.artisticTranslation || "..."}</p>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                <Sparkles className="w-4 h-4 text-brand-cyan" />
                Перевести ИИ
              </button>
            </div>

            {/* Word Analysis */}
            <div className="flex-1 p-6 overflow-y-auto">
              {hoveredWord ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 font-korean">{hoveredWord.baseForm || hoveredWord.text}</h3>
                      <p className="text-xl text-brand-cyan font-medium">{hoveredWord.translation}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white transition-colors">
                        <Plus className="w-4 h-4 text-brand-cyan" />
                        В словарь
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-brand-cyan/5 dark:bg-brand-cyan/10 hover:bg-brand-cyan/10 dark:hover:bg-brand-cyan/20 border border-brand-cyan/20 dark:border-brand-cyan/20 rounded-xl text-sm font-medium text-brand-cyan transition-colors">
                        <Sparkles className="w-4 h-4" />
                        ИИ Разбор
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800/50">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Грамматика</p>
                      <p className="text-slate-700 dark:text-slate-300">{hoveredWord.grammar || "Нет данных"}</p>
                      {hoveredWord.particles && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                          Частицы/Окончания: <span className="text-brand-cyan font-korean">{hoveredWord.particles}</span>
                        </p>
                      )}
                    </div>
                    {hoveredWord.culturalComment && (
                      <div className="bg-brand-gold/5 dark:bg-brand-gold/10 rounded-xl p-4 border border-brand-gold/20 dark:border-brand-gold/20">
                        <p className="text-xs text-brand-gold uppercase tracking-wider mb-1 font-semibold flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> Культурный контекст
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{hoveredWord.culturalComment}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                  <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                  <p>Наведите на слово в субтитрах для разбора</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subtitles Sidebar */}
        <div className="w-96 bg-white/60 dark:bg-slate-950/40 backdrop-blur-2xl border-l border-white/40 dark:border-slate-800/50 flex flex-col transition-colors duration-300">
          <div className="p-4 border-b border-white/40 dark:border-slate-800/50 flex justify-between items-center bg-white/40 dark:bg-slate-900/30">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Subtitles className="w-4 h-4 text-brand-cyan" />
              Субтитры
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {MOCK_SUBTITLES.map((sub, idx) => (
              <div 
                key={sub.id}
                onClick={() => handleSeek(sub.start)}
                className={cn(
                  "p-4 rounded-2xl cursor-pointer transition-all duration-300 border",
                  activeSubtitleIndex === idx 
                    ? "bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-brand-cyan/30 shadow-[0_0_20px_rgba(0,184,169,0.1)]" 
                    : "bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-slate-900/40"
                )}
              >
                <div className="flex gap-2 flex-wrap mb-2">
                  {sub.words.map((word, wIdx) => (
                    <span 
                      key={wIdx}
                      onMouseEnter={() => word.baseForm && setHoveredWord(word)}
                      onMouseLeave={() => setHoveredWord(null)}
                      className={cn(
                        "text-lg font-korean transition-colors",
                        activeSubtitleIndex === idx ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400",
                        word.baseForm && "hover:text-brand-cyan hover:bg-brand-cyan/10 rounded px-1 -mx-1 cursor-help"
                      )}
                    >
                      {word.text}
                    </span>
                  ))}
                </div>
                <p className={cn(
                  "text-sm transition-colors",
                  activeSubtitleIndex === idx ? "text-slate-600 dark:text-slate-400" : "text-slate-400 dark:text-slate-600"
                )}>
                  {sub.artisticTranslation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
