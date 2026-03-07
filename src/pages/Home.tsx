import { Play, ArrowRight, Quote, BookOpen, Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="p-8 space-y-12">
      {/* Header */}
      <header className="flex justify-between items-end relative">
        <div className="relative z-10 flex-1">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 flex flex-wrap items-center gap-x-3 gap-y-4">
            <span className="text-2xl opacity-90">С возвращением,</span>
            <span className="inline-flex items-center gap-0 px-0 py-2 rounded-full bg-gradient-to-b from-brand-pink to-[#9d0b4a] text-white border-[3.5px] border-white/95 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4),inset_0_-2px_6px_rgba(0,0,0,0.4),0_12px_24px_-4px_rgba(0,0,0,0.3),0_0_20px_rgba(219,39,119,0.3)] -rotate-3 translate-y-[15px] transition-all duration-300 hover:-rotate-1 hover:translate-y-[12px] hover:scale-105 active:scale-95 group/pill relative isolate cursor-pointer">
              <span className="text-4xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover/pill:scale-125 translate-x-1 translate-y-0 -rotate-12 select-none">🫰</span>
              <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] font-black text-3xl pb-1 px-1 tracking-tighter select-none">Дорамщик!</span>
              <span className="text-5xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover/pill:scale-125 translate-x-0 -translate-y-4 rotate-12 select-none">🎬</span>
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mt-6">Продолжай погружаться в корейский язык.</p>
        </div>

        <div className="flex gap-4 relative z-10">
          <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-cyan">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Выучено слов</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">1,204</p>
            </div>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Просмотрено</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">48 ч</p>
            </div>
          </div>
        </div>
      </header>

      {/* Continue Studying */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Продолжить изучение</h2>
        </div>
        
        {/* Mocked state: replace with dynamic data later */}
        {true ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Continue Drama */}
            <Link to="/player/video/1/4" className="group relative block rounded-3xl overflow-hidden bg-slate-900 dark:bg-slate-950 border border-slate-800 hover:border-brand-cyan/50 transition-all duration-500 shadow-md">
              <div className="absolute inset-0 opacity-80 group-hover:opacity-90 transition-opacity rounded-3xl overflow-hidden isolate">
                <img src="/pics/Guardian The Lonely and Great God.png" alt="" className="w-full h-full object-cover text-transparent group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>
              <div className="relative z-10 p-6 flex flex-col h-56 justify-end">
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-brand-cyan text-white text-[10px] font-bold uppercase tracking-wider">
                  Видео
                </div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-cyan transition-colors">Токкэби</h3>
                <p className="text-slate-300 text-sm mb-4">Серия 4 • 34:12 / 1:02:45</p>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-brand-cyan w-[55%] rounded-full" />
                </div>
                <div className="flex items-center gap-2 text-brand-cyan text-sm font-medium">
                  <Play className="w-4 h-4" /> Смотреть
                </div>
              </div>
            </Link>

            {/* Continue Audio */}
            <Link to="/player/audio" className="group relative block rounded-3xl overflow-hidden bg-slate-900 dark:bg-slate-950 border border-slate-800 hover:border-brand-pink/50 transition-all duration-500 shadow-md">
              <div className="absolute inset-0 opacity-80 group-hover:opacity-90 transition-opacity rounded-3xl overflow-hidden isolate">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>
              <div className="relative z-10 p-6 flex flex-col h-56 justify-end">
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-brand-pink text-white text-[10px] font-bold uppercase tracking-wider">
                  Аудио
                </div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-pink transition-colors">Butter - BTS</h3>
                <p className="text-slate-300 text-sm mb-4">Музыка • 01:15 / 02:44</p>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-brand-pink w-[45%] rounded-full" />
                </div>
                <div className="flex items-center gap-2 text-brand-pink text-sm font-medium">
                  <Play className="w-4 h-4" /> Слушать
                </div>
              </div>
            </Link>

            {/* Continue Poem */}
            <Link to="/poem/4" className="group relative block rounded-3xl overflow-hidden bg-slate-900 dark:bg-slate-700 border border-slate-800 hover:border-brand-gold/50 transition-all duration-500 shadow-md">
               <div className="absolute inset-0 opacity-80 group-hover:opacity-90 transition-opacity rounded-3xl overflow-hidden isolate">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>
              <div className="relative z-10 p-6 flex flex-col h-56 justify-end">
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-brand-gold text-white text-[10px] font-bold uppercase tracking-wider">
                  Стихи
                </div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-gold transition-colors">Азалея</h3>
                <p className="text-slate-300 text-sm mb-4">Строфа 1 • Прочитано: 20%</p>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-brand-gold w-[20%] rounded-full" />
                </div>
                <div className="flex items-center gap-2 text-brand-gold text-sm font-medium">
                  <BookOpen className="w-4 h-4" /> Читать
                </div>
              </div>
            </Link>

          </div>
        ) : (
          <div className="w-full bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
             <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Play className="w-6 h-6 text-slate-400" />
             </div>
             <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">Начните изучение</h3>
             <p className="text-slate-500 max-w-sm mb-6">Здесь будет отображаться контент (дорамы, музыка или стихи), который вы начали изучать.</p>
             <div className="flex gap-4">
                <Link to="/dramas" className="px-4 py-2 bg-brand-cyan/10 text-brand-cyan rounded-xl text-sm font-medium hover:bg-brand-cyan/20 transition-colors">Выбрать дораму</Link>
                <Link to="/poems" className="px-4 py-2 bg-brand-gold/10 text-brand-gold rounded-xl text-sm font-medium hover:bg-brand-gold/20 transition-colors">К стихам</Link>
             </div>
          </div>
        )}
      </section>

      {/* Top Quotes */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Популярные цитаты</h2>
          <Link to="/quotes" className="text-brand-cyan hover:text-brand-cyan/80 flex items-center gap-1 text-sm font-medium transition-colors">
            Больше цитат <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              korean: "너와 함께한 시간 모두 눈부셨다.",
              russian: "Всё время, проведённое с тобой, было ослепительным.",
              source: "Токкэби",
              likes: 1240
            },
            {
              korean: "사랑은 미안하다고 말하지 않는 거야.",
              russian: "Любовь означает никогда не говорить, что тебе жаль.",
              source: "Зимняя соната",
              likes: 892
            }
          ].map((quote, i) => (
            <div key={i} className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl p-6 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1">
              <Quote className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-4 group-hover:text-brand-cyan/50 transition-colors" />
              <p className="text-xl font-medium text-slate-900 dark:text-white mb-2 font-korean">{quote.korean}</p>
              <p className="text-slate-500 dark:text-slate-400 mb-4">{quote.russian}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-brand-cyan font-medium">{quote.source}</span>
                <span className="text-slate-500">{quote.likes} ❤️</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
