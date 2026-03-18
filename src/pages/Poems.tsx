import { useState } from 'react';
import { Search, Filter, Volume2, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { POEMS } from '../data/poems';
import { cn } from '../lib/utils';

export default function Poems() {
  const [activeTag, setActiveTag] = useState('Все');
  const ALL_TAGS = ['Все', 'Детские стихи', 'Классика', 'Песни', 'Философия', 'Природа'];

  const filtered = activeTag === 'Все'
    ? POEMS
    : POEMS.filter(p => p.tags.includes(activeTag));

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Поэзия и Стихи</h1>
          <p className="text-zinc-400">Читайте и изучайте корейский через поэзию.</p>
        </div>
        <div className="relative shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Поиск..."
            className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm w-52"
          />
        </div>
      </header>

      {/* Tag filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {ALL_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap',
              activeTag === tag
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(poem => (
          <Link
            key={poem.id}
            to={`/poem/${poem.id}`}
            className="group relative block rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800/80 hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] hover:-translate-y-0.5"
          >
            {/* Cover image */}
            <div className="w-full aspect-video relative overflow-hidden bg-black shrink-0">
              <img
                src={poem.image}
                alt={poem.koreanTitle}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />

              {/* Badges */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {poem.hasAudio && (
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/80 backdrop-blur-md text-white text-[11px] font-bold tracking-wider uppercase shadow-sm flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> Аудио
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md text-white text-[11px] font-bold tracking-wider uppercase border border-white/20">
                  Стихи
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-5 relative">
              {/* Floating icon button */}
              <div className="absolute right-5 -top-6 w-12 h-12 bg-indigo-500 hover:bg-indigo-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transform group-hover:scale-110 transition-all duration-300">
                <BookOpen size={20} />
              </div>

              <h3 className="text-xl font-bold text-white mb-0.5 group-hover:text-indigo-300 transition-colors line-clamp-1">
                {poem.koreanTitle}
              </h3>
              <p className="text-sm text-zinc-500 mb-4 line-clamp-1">
                {poem.title} &mdash; {poem.author}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {poem.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="text-xs font-medium text-zinc-500 bg-zinc-950/80 border border-zinc-800/50 px-2 py-1 rounded-lg"
                  >
                    #{tag}
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

