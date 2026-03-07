import { Search, Filter, Volume2, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { POEMS } from '../data/poems';

export default function Poems() {
  return (
    <div className="p-8 space-y-8 relative">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-transparent dark:bg-brand-gold/10 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '3s' }} />
      <div className="flex justify-between items-center relative z-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Поэзия и Стихи</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Поиск по названию или автору..." 
              className="pl-10 pr-4 py-2 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan transition-colors w-72 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-xl text-slate-700 dark:text-white hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
            Фильтры
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['Все', 'Детские стихи', 'Классика', 'Песни', 'Философия', 'Природа'].map(tag => (
          <button key={tag} className="px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-brand-cyan transition-colors whitespace-nowrap shadow-sm">
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
        {POEMS.map(poem => (
          <Link key={poem.id} to={`/poem/${poem.id}`} className="group block h-full">
            <div className="relative flex flex-col h-full rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-[0_0_30px_-5px_rgba(255,188,14,0.2)] transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden rounded-t-2xl isolate">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                  <h3 className="text-xl text-white font-bold truncate group-hover:text-brand-gold transition-colors block">{poem.koreanTitle}</h3>
                  <p className="text-sm text-slate-200">{poem.title} • {poem.author}</p>
                </div>
                {poem.hasAudio && (
                  <div className="absolute top-3 right-3 z-10 px-2 py-1.5 rounded-lg bg-black/50 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 ring-1 ring-white/20">
                    <Volume2 className="w-3.5 h-3.5 text-brand-cyan" />
                    Аудио
                  </div>
                )}
                <div className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-brand-pink/80 transition-colors opacity-0 group-hover:opacity-100">
                  <Bookmark className="w-4 h-4" />
                </div>
              </div>
              <div className="p-4 flex flex-wrap gap-2 flex-1 items-start content-start">
                {poem.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
