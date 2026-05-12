import React, { useState, useMemo, ElementType } from 'react';
import { Heart, Copy, BookOpen, Share2, Plus, TrendingUp, Clock, Sparkles, X, Filter, ChevronRight, MessageCircle, Bookmark, Search } from 'lucide-react';
import { MOCK_QUOTES, getUserById, ALL_TAGS, Quote } from '../data/quotes';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

// ─── AddQuoteModal ─────────────────────────────────────────────────────────────

function AddQuoteModal({ onClose, onAdd }: { onClose: () => void; onAdd: (q: Quote) => void }) {
  const [textKor, setTextKor] = useState('');
  const [textRus, setTextRus] = useState('');
  const [source, setSource] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleSubmit = () => {
    if (!textKor.trim() || !textRus.trim() || !source.trim()) return;
    const newQuote: Quote = {
      id: `q_${Date.now()}`,
      originalCreatorId: 'user_me',
      currentOwnerId: 'user_me',
      isPublic: true,
      textKor: textKor.trim(),
      textRus: textRus.trim(),
      source: source.trim(),
      likesCount: 0,
      clonesCount: 0,
      tags: selectedTags,
      createdAt: Date.now(),
    };
    onAdd(newQuote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-cyan" />
            Добавить цитату
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Корейский текст *
            </label>
            <textarea
              value={textKor}
              onChange={e => setTextKor(e.target.value)}
              rows={3}
              placeholder="한국어 텍스트..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-korean placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 resize-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Перевод *
            </label>
            <textarea
              value={textRus}
              onChange={e => setTextRus(e.target.value)}
              rows={2}
              placeholder="Перевод на русский..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 resize-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Источник *
            </label>
            <input
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="Название дорамы, фильма, песни..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Теги
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                    selectedTags.includes(tag)
                      ? 'bg-brand-cyan border-brand-cyan text-white'
                      : 'bg-transparent border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand-cyan hover:text-brand-cyan'
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={!textKor.trim() || !textRus.trim() || !source.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 text-white font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-brand-cyan/20"
          >
            Добавить в ленту
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QuoteCard ─────────────────────────────────────────────────────────────────

interface QuoteCardProps {
  key?: string | number;
  quote: Quote;
  onLike: (id: string) => void;
  onClone: (id: string) => void;
  liked: boolean;
  cloned: boolean;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
}

function QuoteCard({ quote, onLike, onClone, liked, cloned, onComment, onShare }: QuoteCardProps) {
  const creator = getUserById(quote.originalCreatorId);

  return (
    <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-brand-cyan/10 flex flex-col sm:flex-row gap-0 sm:gap-6">
      {/* Aesthetic Image Side/Top */}
      {quote.bgImage && (
        <div className="w-full sm:w-40 h-40 sm:h-auto shrink-0 relative overflow-hidden">
          <img 
            src={quote.bgImage} 
            alt={quote.source} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent sm:hidden" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Source & Tags */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan px-2 py-0.5 rounded-md bg-brand-cyan/10 border border-brand-cyan/20">
              {quote.source}
            </span>
            <div className="flex gap-2">
              {quote.tags.map(tag => (
                <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-950/40 border border-white/5 px-2 py-0.5 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Text */}
          <div className="space-y-1">
             <p className="text-xl font-bold text-white font-korean leading-snug tracking-tight">
               {quote.textKor}
             </p>
             <p className="text-sm font-medium text-slate-400 leading-relaxed italic">
               "{quote.textRus}"
             </p>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="mt-auto -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 px-5 sm:px-6 py-4 bg-white/[0.03] dark:bg-slate-800/30 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button
                onClick={() => onLike(quote.id)}
                className={cn(
                  'flex items-center gap-1.5 transition-all group/like',
                  liked ? 'text-rose-400' : 'text-slate-500 hover:text-rose-400'
                )}
              >
                <Heart className={cn('w-4 h-4 transition-transform group-hover/like:scale-110', liked && 'fill-rose-400 animate-pop')} />
                <span className="text-xs font-bold tabular-nums">{quote.likesCount + (liked ? 1 : 0)}</span>
              </button>

              <button
                onClick={() => onComment && onComment(quote.id)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-brand-cyan transition-all group/comment"
              >
                <MessageCircle className="w-4 h-4 transition-transform group-hover/comment:scale-110" />
                <span className="text-xs font-bold">8</span>
              </button>
           </div>

           <div className="flex items-center gap-2">
              <button
                onClick={() => onClone(quote.id)}
                className={cn(
                  'p-2 rounded-xl transition-all',
                  cloned ? 'bg-amber-500/20 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'text-slate-500 hover:text-amber-500 hover:bg-white/5'
                )}
                title="В коллекцию"
              >
                <Bookmark className={cn('w-4 h-4', cloned && 'fill-current')} />
              </button>
              
              <Link 
                to={`/quote/${quote.id}`}
                className="p-2 rounded-xl text-slate-500 hover:text-brand-cyan hover:bg-white/5 transition-all"
                title="Разбор"
              >
                <BookOpen className="w-4 h-4" />
              </Link>

              <button 
                onClick={() => onShare && onShare(quote.id)}
                className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                title="Поделиться"
              >
                <Share2 className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

type FeedTab = 'trending' | 'new' | 'my';

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
  const [tab, setTab] = useState<FeedTab>('trending');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [clonedIds, setClonedIds] = useState<Set<string>>(new Set());

  const handleLike = (id: string) =>
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleClone = (id: string) =>
    setClonedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleAdd = (q: Quote) => setQuotes(prev => [q, ...prev]);

  const filtered = useMemo(() => {
    let result = quotes;
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(qObj => 
        qObj.textKor.toLowerCase().includes(q) || 
        qObj.textRus.toLowerCase().includes(q) || 
        qObj.source.toLowerCase().includes(q)
      );
    }
    
    // For 'my' tab, only show quotes created by 'user_me' or cloned by 'user_me'.
    if (tab === 'my') {
      result = result.filter(q => q.originalCreatorId === 'user_me' || clonedIds.has(q.id));
    } else {
      // For global tabs, only show public quotes
      result = result.filter(q => q.isPublic);
    }

    if (activeTag) result = result.filter(q => q.tags.includes(activeTag));
    
    // Sorting
    if (tab === 'trending') {
      return [...result].sort((a, b) => (b.likesCount + b.clonesCount) - (a.likesCount + a.clonesCount));
    }
    // For 'new' and 'my', sort by newest
    return [...result].sort((a, b) => b.createdAt - a.createdAt);
  }, [quotes, tab, activeTag, clonedIds]);

  const tabs: { id: FeedTab; label: string; icon: ElementType }[] = [
    { id: 'trending', label: 'Популярное', icon: TrendingUp },
    { id: 'new', label: 'Новое', icon: Clock },
    { id: 'my', label: 'Мои цитаты', icon: Bookmark },
  ];

  return (
    <div className="p-6 md:p-12 space-y-12 relative max-w-4xl mx-auto">
      {/* Ambient blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-transparent dark:bg-brand-cyan/10 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="absolute bottom-40 left-10 w-48 h-48 bg-transparent dark:bg-brand-pink/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
        <div>
          <h1 className="text-[length:var(--font-size-page-title)] font-heading font-[--font-weight-page-title] tracking-tight text-slate-900 dark:text-[color:var(--color-page-title-dark)] mb-1">Цитатник</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Лучшие фразы из дорам и K-pop — собраны сообществом</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          <div className="relative group flex-1 lg:flex-none lg:w-72">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className="pl-11 pr-5 py-2.5 bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan/50 transition-all text-sm w-full shadow-inner"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-cyan to-brand-cyan-light hover:from-brand-cyan-light hover:to-brand-cyan text-slate-900 rounded-2xl transition-all text-xs font-black shadow-[0_0_15px_rgba(0,184,169,0.3)] hover:shadow-[0_0_20px_rgba(0,184,169,0.5)] active:scale-95 shrink-0 uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>
      </div>

      {/* Tabs & Tag filters */}
      <div className="space-y-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-zinc-900/60 rounded-xl border dark:border-zinc-800/50 overflow-x-auto scrollbar-hide">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  tab === t.id
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200'
                )}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
          <span className="text-slate-400 dark:text-slate-600 text-xs font-medium flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> {filtered.length} цитат
          </span>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide mask-fade-right">
          <button
            onClick={() => setActiveTag(null)}
            className={cn(
              'px-4 py-1.5 rounded-xl text-sm font-medium border transition-all whitespace-nowrap',
              activeTag === null
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            )}
          >
            Все
          </button>
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={cn(
                'px-4 py-1.5 rounded-xl text-sm font-medium border transition-all whitespace-nowrap uppercase tracking-wide',
                activeTag === tag
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Feed - Centered Column */}
      <div className="flex flex-col gap-6 relative z-10 w-full max-w-3xl mx-auto">
        {filtered.map(quote => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            onLike={handleLike}
            onClone={handleClone}
            liked={likedIds.has(quote.id)}
            cloned={clonedIds.has(quote.id)}
            onComment={() => alert('Откроется панель комментариев (Скоро)')}
            onShare={() => alert('Ссылка скопирована в буфер обмена!')}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400 dark:text-slate-600">
          <p className="text-lg">Цитат по этому тегу пока нет</p>
          <p className="text-sm mt-1">Будьте первым — добавьте цитату!</p>
        </div>
      )}

      {/* Add quote modal */}
      {showModal && <AddQuoteModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </div>
  );
}
