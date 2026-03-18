import React, { useState, useMemo, ElementType } from 'react';
import { Heart, Copy, BookOpen, Share2, Plus, TrendingUp, Clock, Sparkles, X, Filter, ChevronRight, MessageCircle, Bookmark } from 'lucide-react';
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
    <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl p-6 hover:border-brand-cyan/30 transition-all duration-300 group shadow-sm hover:shadow-lg hover:-translate-y-1 flex flex-col gap-4">
      {/* Korean text */}
      <div>
        <div className="w-8 h-8 mb-3 text-slate-200 dark:text-slate-800 group-hover:text-brand-cyan/20 transition-colors">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
        </div>
        <p className="text-xl font-medium text-slate-900 dark:text-white font-korean leading-relaxed">
          {quote.textKor}
        </p>
        <p className="mt-2 text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
          {quote.textRus}
        </p>
      </div>

      {/* Source + tags */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-brand-cyan font-semibold text-sm">{quote.source}</span>
        {quote.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs">
            #{tag}
          </span>
        ))}
      </div>

      {/* Contributor */}
      {creator && (
        <Link
          to={`/profile/${creator.username}`}
          className="flex items-center gap-2 group/creator w-fit"
        >
          <img
            src={creator.avatarUrl}
            alt={creator.displayName}
            className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
          />
          <span className="text-xs text-slate-400 dark:text-slate-500 group-hover/creator:text-brand-cyan transition-colors">
            {creator.displayName}
          </span>
        </Link>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-slate-200/60 dark:border-slate-800/50 pt-4 overflow-x-auto scrollbar-hide">
        {/* Like */}
        <button
          onClick={() => onLike(quote.id)}
          className={cn(
            'flex items-center gap-1.5 text-sm font-medium transition-all shrink-0',
            liked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'
          )}
        >
          <Heart className={cn('w-4 h-4 transition-all', liked && 'fill-current scale-110')} />
          {quote.likesCount + (liked ? 1 : 0)}
        </button>

        {/* Comment */}
        <button
          onClick={() => onComment && onComment(quote.id)}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-cyan transition-all shrink-0"
          title="Комментарии"
        >
          <MessageCircle className="w-4 h-4" />
        </button>

        {/* Save (Clone) */}
        <button
          onClick={() => onClone(quote.id)}
          className={cn(
            'flex items-center gap-1.5 text-sm font-medium transition-all shrink-0',
            cloned ? 'text-amber-500' : 'text-slate-500 hover:text-amber-500'
          )}
          title={cloned ? "В вашей коллекции" : "Добавить к себе"}
        >
          <Bookmark className={cn('w-4 h-4 transition-all', cloned && 'fill-current scale-110')} />
        </button>

        {/* Reader / Analyze */}
        <Link 
          to={`/quote/${quote.id}`}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-cyan transition-colors shrink-0" 
          title="Разобрать грамматику и слова"
        >
          <BookOpen className="w-4 h-4" />
        </Link>

        {/* Share */}
        <button 
          onClick={() => onShare && onShare(quote.id)}
          className="ml-auto flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0" 
          title="Поделиться"
        >
          <Share2 className="w-4 h-4" />
        </button>
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
    <div className="p-8 space-y-8 relative max-w-4xl mx-auto">
      {/* Ambient blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-transparent dark:bg-brand-cyan/10 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="absolute bottom-40 left-10 w-48 h-48 bg-transparent dark:bg-brand-pink/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-end relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Цитатник</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Лучшие фразы из дорам и K-pop — собраны сообществом</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-cyan hover:bg-brand-cyan/90 rounded-xl text-white transition-colors text-sm font-medium shadow-lg shadow-brand-cyan/20"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tab === t.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
        <span className="text-slate-400 dark:text-slate-600 text-xs font-medium flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> {filtered.length} цитат
        </span>
      </div>

      {/* Tag filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide relative z-10">
        <button
          onClick={() => setActiveTag(null)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap',
            activeTag === null
              ? 'bg-brand-cyan border-brand-cyan text-white'
              : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand-cyan hover:text-brand-cyan'
          )}
        >
          Все
        </button>
        {ALL_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap',
              activeTag === tag
                ? 'bg-brand-cyan border-brand-cyan text-white'
                : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand-cyan hover:text-brand-cyan'
            )}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
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
