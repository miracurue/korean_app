import { Search, Filter, Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const DRAMAS = [
  { id: 1, title: 'Токкэби (Гоблин)', year: 2016, rating: 4.9, tags: ['Фэнтези', 'Романтика', 'Драма'], image: '/pics/Guardian The Lonely and Great God.png' },
  { id: 2, title: 'Аварийная посадка любви', year: 2019, rating: 4.8, tags: ['Романтика', 'Комедия'], image: 'https://picsum.photos/seed/crash/400/600' },
  { id: 3, title: 'Итэвон Класс', year: 2020, rating: 4.7, tags: ['Драма', 'Бизнес'], image: 'https://picsum.photos/seed/itaewon/400/600' },
  { id: 4, title: 'Винченцо', year: 2021, rating: 4.8, tags: ['Криминал', 'Комедия'], image: 'https://picsum.photos/seed/vincenzo/400/600' },
  { id: 5, title: 'Слава', year: 2022, rating: 4.9, tags: ['Триллер', 'Месть'], image: 'https://picsum.photos/seed/glory/400/600' },
  { id: 6, title: 'Алхимия душ', year: 2022, rating: 4.8, tags: ['Фэнтези', 'Исторический'], image: 'https://picsum.photos/seed/alchemy/400/600' },
];

export default function Dramas() {
  return (
    <div className="p-8 space-y-8 relative">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-transparent dark:bg-brand-cyan/10 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '3s' }} />
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {DRAMAS.map(drama => (
          <Link key={drama.id} to={`/player/${drama.id}`} className="group block">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-900 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 group-hover:shadow-[0_0_30px_-5px_rgba(0,184,169,0.3)] transition-shadow duration-500">
              <img src={drama.image} alt={drama.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-brand-cyan text-white flex items-center justify-center shadow-lg shadow-brand-cyan/30 transform scale-75 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 ml-1" />
                </div>
              </div>
              <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                {drama.rating}
              </div>
            </div>
            <h3 className="text-slate-900 dark:text-white font-medium truncate group-hover:text-brand-cyan transition-colors">{drama.title}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>{drama.year}</span>
              <span>•</span>
              <span className="truncate">{drama.tags.join(', ')}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
