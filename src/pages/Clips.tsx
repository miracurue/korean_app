import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Search, SlidersHorizontal, X, Clapperboard, ChevronDown } from 'lucide-react';
import { sampleClips } from '../data/clips';
import { cn } from '../lib/utils';

// ─── Filter groups definition ────────────────────────────────────────────────
type FilterGroup = {
  label: string;
  emoji: string;
  tags: string[];
};

const FILTER_GROUPS: FilterGroup[] = [
  {
    label: 'Тема / Ситуация',
    emoji: '🎬',
    tags: ['знакомство', 'ресторан', 'еда', 'прощание', 'признание', 'работа', 'офис', 'кафе', 'аэропорт', 'дружба'],
  },
  {
    label: 'Настроение',
    emoji: '💡',
    tags: ['эмоциональное', 'смешное', 'романтика', 'умное', 'деловой', 'конфликт'],
  },
  {
    label: 'Стиль речи',
    emoji: '🗣',
    tags: ['разговорный', 'вежливость', 'сленг', 'грамматика'],
  },
  {
    label: 'Уровень',
    emoji: '📊',
    tags: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  },
];

// Convenience set for level highlighting
const LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  A2: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  B1: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  B2: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  C1: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  C2: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
};

// ─── Searchable Source Dropdown ───────────────────────────────────────────────
interface SourceDropdownProps {
  sources: string[];
  selected: string | null;
  onSelect: (src: string) => void;
}

function SourceDropdown({ sources, selected, onSelect }: SourceDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? sources.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : sources;

  return (
    <div ref={ref}>
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Clapperboard className="w-3.5 h-3.5" /> Дорама / Источник
      </p>
      <div className="relative w-72">
        {/* Trigger */}
        <button
          onClick={() => setOpen(v => !v)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm transition-all',
            selected
              ? 'bg-rose-600/20 border-rose-500/50 text-rose-300'
              : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
          )}
        >
          <span className="truncate">
            {selected ? <><Clapperboard className="w-3.5 h-3.5 inline mr-1.5 opacity-70" />{selected}</> : 'Все дорамы'}
          </span>
          <ChevronDown className={cn('w-4 h-4 shrink-0 transition-transform', open && 'rotate-180')} />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full mt-2 left-0 w-full z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Search */}
            <div className="p-2 border-b border-zinc-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Поиск по дораме..."
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-56 overflow-y-auto scrollbar-hide py-1">
              {/* "All" reset option */}
              <button
                onClick={() => { if (selected) onSelect(selected); setOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm transition-colors',
                  !selected ? 'text-zinc-300 bg-zinc-800/50' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                )}
              >
                Все дорамы
              </button>

              {filtered.length === 0 && (
                <p className="px-3 py-3 text-sm text-zinc-600 text-center">Ничего не найдено</p>
              )}

              {filtered.map(source => (
                <button
                  key={source}
                  onClick={() => { onSelect(source); setOpen(false); setQuery(''); }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2',
                    selected === source
                      ? 'bg-rose-600/20 text-rose-300'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  )}
                >
                  {selected === source && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />}
                  {source}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Clips() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  // Derive unique sources dynamically so it always stays up to date
  const allSources = useMemo(
    () => Array.from(new Set(sampleClips.map(c => c.source))).sort(),
    []
  );

  const toggleTag = (tag: string) => {
    setActiveTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const clearAll = () => {
    setActiveTags(new Set());
    setSelectedSource(null);
    setSearchQuery('');
  };

  // Filter clips reactively based on search, tags, and selected source
  const filteredClips = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return sampleClips.filter(clip => {
      // Search filter
      if (q && !clip.title.toLowerCase().includes(q) && !clip.source.toLowerCase().includes(q) && !clip.tags.some(t => t.toLowerCase().includes(q))) {
        return false;
      }
      // Source filter — single-select, exact match
      if (selectedSource && clip.source !== selectedSource) return false;
      // Active tag filter: clip must match ALL selected tags
      for (const tag of activeTags) {
        if (LEVELS.has(tag)) {
          if (clip.level !== tag) return false;
        } else {
          if (!clip.tags.includes(tag)) return false;
        }
      }
      return true;
    });
  }, [searchQuery, activeTags, selectedSource]);

  const hasActiveFilters = activeTags.size > 0 || searchQuery.trim() || selectedSource;

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Дорамы</h1>
          <p className="text-zinc-400">Изучайте корейский через короткие сцены из ваших любимых дорам.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              id="clips-search"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm w-52"
            />
          </div>
          {/* Toggle filter panel */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all',
              showFilters
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Фильтры
            {activeTags.size > 0 && (
              <span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {activeTags.size}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/50 transition-all bg-zinc-900"
            >
              <X className="w-4 h-4" />
              Сброс
            </button>
          )}
        </div>
      </header>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-zinc-900/70 rounded-2xl border border-zinc-800/70 p-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {FILTER_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span>{group.emoji}</span> {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.tags.map(tag => {
                  const isLevel = LEVELS.has(tag);
                  const active = activeTags.has(tag);
                  return (
                    <button
                      key={tag}
                      id={`filter-${tag}`}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200',
                        active
                          ? isLevel
                            ? `${LEVEL_COLORS[tag]} border-current ring-1 ring-current scale-105`
                            : 'bg-indigo-600 border-indigo-500 text-white scale-105 shadow-md shadow-indigo-500/20'
                          : isLevel
                            ? 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                            : 'bg-zinc-800/60 border-zinc-700/70 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                      )}
                    >
                      {isLevel ? tag : `#${tag}`}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Source / Drama filter — searchable dropdown */}
          <SourceDropdown
            sources={allSources}
            selected={selectedSource}
            onSelect={src => setSelectedSource(prev => prev === src ? null : src)}
          />
        </div>
      )}

      {/* Results count + active filter chips */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-zinc-500">
          {filteredClips.length === sampleClips.length
            ? `Всего сцен: ${sampleClips.length}`
            : `Найдено: ${filteredClips.length} из ${sampleClips.length}`}
        </p>
        {(activeTags.size > 0 || selectedSource) && (
          <div className="flex flex-wrap gap-1.5">
            {/* Source chip */}
            {selectedSource && (
              <span
                onClick={() => setSelectedSource(null)}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-pointer hover:bg-rose-500/30 transition-colors"
              >
                <Clapperboard className="w-3 h-3" />
                {selectedSource}
                <X className="w-3 h-3" />
              </span>
            )}
            {/* Tag chips */}
            {[...activeTags].map(tag => (
              <span
                key={tag}
                onClick={() => toggleTag(tag)}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 cursor-pointer hover:bg-indigo-500/30 transition-colors"
              >
                {LEVELS.has(tag) ? tag : `#${tag}`}
                <X className="w-3 h-3" />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Clips Grid */}
      {filteredClips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClips.map(clip => (
            <Link
              key={clip.id}
              to={`/clip/${clip.id}`}
              className="group relative block rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800/80 hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] hover:-translate-y-0.5"
            >
              <div className="w-full aspect-video relative overflow-hidden bg-black shrink-0">
                <img
                  src={clip.coverUrl || clip.coverUrls?.[0]}
                  alt={clip.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />

                {/* Level + Type badges */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase border',
                    LEVEL_COLORS[clip.level] || 'bg-indigo-500/80 text-white border-indigo-400/30'
                  )}>
                    {clip.level}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md text-white text-[11px] font-bold tracking-wider uppercase border border-white/20">
                    {clip.type === 'video' ? 'Видео' : 'Аудио'}
                  </span>
                </div>
              </div>

              <div className="p-5 relative">
                {/* Floating play button */}
                <div className="absolute right-5 -top-6 w-12 h-12 bg-indigo-500 hover:bg-indigo-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transform group-hover:scale-110 transition-all duration-300">
                  <Play size={22} fill="currentColor" className="ml-0.5" />
                </div>

                <h3 className="text-xl font-bold text-white mb-1.5 group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {clip.title}
                </h3>
                <p className="text-sm text-zinc-500 mb-4 line-clamp-1">{clip.source}</p>

                <div className="flex flex-wrap gap-1.5">
                  {clip.tags.slice(0, 4).map(tag => (
                    <span
                      key={tag}
                      onClick={e => { e.preventDefault(); toggleTag(tag); }}
                      className={cn(
                        'text-xs font-medium px-2 py-1 rounded-lg border cursor-pointer transition-colors',
                        activeTags.has(tag)
                          ? 'bg-indigo-500/30 text-indigo-300 border-indigo-500/40'
                          : 'text-zinc-500 bg-zinc-950/80 border-zinc-800/50 hover:text-indigo-400 hover:border-indigo-500/30'
                      )}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4 opacity-50">
          <span className="text-6xl">🔍</span>
          <h3 className="text-xl font-bold text-zinc-300">Ничего не найдено</h3>
          <p className="text-zinc-500 max-w-sm">Попробуйте убрать некоторые фильтры или изменить поисковый запрос.</p>
          <button
            onClick={clearAll}
            className="mt-2 px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
          >
            Сбросить все фильтры
          </button>
        </div>
      )}
    </div>
  );
}
