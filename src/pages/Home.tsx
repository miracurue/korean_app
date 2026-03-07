import { Play, ArrowRight, Quote, BookOpen, Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="p-8 space-y-12">
      {/* Header */}
      <header className="flex justify-between items-end relative">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-transparent dark:bg-brand-pink/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="relative z-10 flex-1">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            С возвращением, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-cream">Дорамщик!</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Продолжай погружаться в корейский язык.</p>
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

      {/* Continue Watching/Listening */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Продолжить</h2>
          <Link to="/dramas" className="text-brand-cyan hover:text-brand-cyan/80 flex items-center gap-1 text-sm font-medium transition-colors">
            Все дорамы <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <Link to="/player/1" className="group relative block rounded-3xl overflow-hidden bg-slate-900 dark:bg-slate-950 border border-slate-800 hover:border-brand-cyan/50 transition-all duration-500 shadow-lg hover:shadow-[0_0_40px_-10px_rgba(0,184,169,0.3)]">
          
          {/* Image on the right */}
          <div className="absolute right-0 top-0 bottom-0 w-2/3 overflow-hidden">
            <img 
              src="/pics/Guardian The Lonely and Great God.png" 
              alt="Goblin" 
              className="absolute right-0 top-0 bottom-0 h-full w-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
            />
            {/* Gradient to blend image into the left side */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 z-10" />
          </div>

          {/* Decorative SVG Pattern - masked to only show on the left */}
          <div className="absolute inset-0 z-10 opacity-20 mix-blend-overlay pointer-events-none [mask-image:linear-gradient(to_right,black_30%,transparent_60%)]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")` }} />
          
          <div className="relative z-20 p-8 flex flex-col justify-between h-64 w-2/3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-brand-cyan/20 text-brand-cyan text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                Дорама
              </span>
              <span className="text-slate-300 text-sm font-medium">Серия 4</span>
            </div>
            
            <div>
              <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-brand-cyan transition-colors">
                Токкэби (Гоблин)
              </h3>
              <p className="text-slate-300 dark:text-slate-400 mb-6 max-w-md line-clamp-2">
                Бессмертный демон ищет свою невесту, чтобы снять проклятие вечной жизни.
              </p>
              
              <div className="flex items-center gap-6 relative">
                <button className="w-14 h-14 rounded-full bg-brand-cyan text-white flex items-center justify-center shadow-[0_0_30px_rgba(0,184,169,0.5)] group-hover:scale-110 transition-transform animate-float">
                  <Play className="w-6 h-6 ml-1" />
                </button>
                <div className="flex-1 max-w-md">
                  <div className="flex justify-between text-xs text-slate-300 dark:text-slate-400 mb-2 font-medium">
                    <span>34:12</span>
                    <span>1:02:45</span>
                  </div>
                  <div className="h-2 bg-slate-700 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-pink to-brand-cream w-[55%] rounded-full relative">
                      <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
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
