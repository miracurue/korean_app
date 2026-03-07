import { Search, Filter, Play, Star, Tv, BookOpen, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DRAMAS } from '../data/dramas';

export default function Dramas() {
  return (
    <div className="p-8 space-y-8 relative">
      <div className="flex justify-between items-center relative z-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Каталог дорам</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Поиск дорам..." 
              className="pl-10 pr-4 py-2 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan transition-colors w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-xl text-slate-700 dark:text-white hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
            Фильтры
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['Все', 'Романтика', 'Комедия', 'Триллер', 'Фэнтези', 'Исторический', 'Школа'].map(tag => (
          <button key={tag} className="px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-brand-cyan transition-colors whitespace-nowrap shadow-sm">
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {DRAMAS.map(drama => {
          const totalEpisodes = drama.episodes.length;
          const wordsLearned = drama.episodes.reduce((sum, ep) => sum + (ep.wordsLearned || 0), 0);
          const phrasesLearned = Math.floor(wordsLearned / 5);

          return (
            <Link key={drama.id} to={`/dramas/${drama.id}`} className="group block bg-[#13141f] border border-slate-800/80 rounded-[28px] overflow-hidden hover:shadow-[0_8px_30px_-5px_rgba(0,184,169,0.2)] hover:border-brand-cyan/40 transition-all duration-500 hover:-translate-y-1">
              <div className="relative aspect-[4/5] overflow-hidden m-2 rounded-[20px] isolate bg-slate-900">
                <img src={drama.image} alt={drama.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#13141f]/80 via-transparent to-black/60 opacity-80" />
                
                {/* Rating at Top Right */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="px-2.5 py-1 rounded-[10px] bg-black/40 backdrop-blur-md text-white font-bold flex items-center gap-1.5 shadow-sm border border-white/10 flex-shrink-0">
                    <Star className="w-4 h-4 text-brand-gold fill-current" />
                    {drama.rating}
                  </div>
                </div>

                {/* Title at Bottom */}
                <div className="absolute bottom-0 inset-x-0 p-4 pt-10 bg-gradient-to-t from-[#13141f] via-[#13141f]/40 to-transparent z-10">
                  <h3 className="text-white font-bold text-xl leading-tight drop-shadow-md">{drama.title}</h3>
                </div>
                
                {/* Play button overlay on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-brand-cyan text-white flex items-center justify-center shadow-[0_0_20px_rgba(0,184,169,0.6)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-6 h-6 ml-1 fill-current" />
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-1">
                <div className="text-slate-400 text-sm mb-4 truncate text-shadow-sm font-medium">
                  {drama.year} • {drama.tags.join(', ')}
                </div>

                <div className="border-t border-slate-800 pt-4 flex items-center">
                  {/* Episodes */}
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <Tv className="w-4 h-4 text-[#8f93a2]" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#8f93a2] leading-tight">Серий:</span>
                      <span className="text-xs font-bold text-white leading-tight">{totalEpisodes}</span>
                    </div>
                  </div>
                  
                  <div className="w-px h-6 bg-slate-800" />

                  {/* Words */}
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#8f93a2]" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#8f93a2] leading-tight">Слов</span>
                      <span className="text-xs font-bold text-white leading-tight">{wordsLearned}</span>
                    </div>
                  </div>

                  <div className="w-px h-6 bg-slate-800" />

                  {/* Phrases */}
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#8f93a2]" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#8f93a2] leading-tight">Фраз</span>
                      <span className="text-xs font-bold text-white leading-tight">{phrasesLearned}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
