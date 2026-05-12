import { useState, useMemo } from 'react';
import { Search, Filter, Play, Music as MusicIcon, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MUSIC } from '../data/music';

const ITEMS_PER_PAGE = 24;

export default function Music() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Все');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Get unique tags from data
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    MUSIC.forEach(song => song.tags.forEach(tag => tags.add(tag)));
    return ['Все', ...Array.from(tags).sort()];
  }, []);

  const filteredMusic = useMemo(() => {
    return MUSIC.filter(song => {
      const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            song.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'Все' || song.tags.includes(activeFilter);
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  const displayedMusic = filteredMusic.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMusic.length;

  const handleFilterClick = (tag: string) => {
    setActiveFilter(tag);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="p-8 space-y-8 relative">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-transparent dark:bg-brand-gold/10 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="flex justify-between items-center relative z-10 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Каталог музыки</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Поиск песен..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan transition-colors w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-xl text-slate-700 dark:text-white hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
            Фильтры
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide relative z-10">
        {allTags.map(tag => (
          <button 
            key={tag} 
            onClick={() => handleFilterClick(tag)}
            className={`px-4 py-1.5 rounded-full backdrop-blur-xl border whitespace-nowrap shadow-sm transition-colors ${
              activeFilter === tag 
                ? 'bg-brand-cyan text-white border-brand-cyan' 
                : 'bg-white/60 dark:bg-slate-900/50 border-white/40 dark:border-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-brand-cyan'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 relative z-10">
        {displayedMusic.map(song => (
          <Link key={song.id} to={`/player/${song.id}`} className="group block">
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-900 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 group-hover:shadow-[0_0_30px_-5px_rgba(0,184,169,0.3)] transition-shadow duration-500">
              <img src={song.image} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-brand-cyan text-white flex items-center justify-center shadow-lg shadow-brand-cyan/30 transform scale-75 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 ml-1" />
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                {song.lrcUrl && (
                  <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-brand-cyan uppercase tracking-wider">
                    LRC
                  </div>
                )}
                <div className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white">
                  <MusicIcon className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
            <h3 className="text-slate-900 dark:text-white font-medium truncate group-hover:text-brand-cyan transition-colors">{song.title}</h3>
            <p className="text-sm text-slate-500 truncate mt-0.5">{song.artist}</p>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {song.tags.map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
        {displayedMusic.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            Ничего не найдено
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8 relative z-10">
          <button 
            onClick={handleLoadMore}
            className="flex items-center gap-2 px-6 py-3 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-xl text-slate-700 dark:text-white hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors shadow-sm"
          >
            Показать еще
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
