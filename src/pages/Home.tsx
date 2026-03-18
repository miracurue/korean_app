import { Play, Flame, Trophy, Users, Quote as QuoteIcon, BookOpen, Star, Film, MoreHorizontal, ChevronRight, Heart, Share2, Filter, Sparkles, GraduationCap, Zap, MessageCircle, Bookmark, MessageSquareQuote, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { MOCK_USERS, MOCK_QUOTES } from '../data/quotes';

// ─── Mock Data ─────────────────────────────────────────────────────────────

const CURRENT_USER = MOCK_USERS[2]; // 'me'

const MOCK_ACTIVITY_POSTS = [
  {
    id: 'post_1',
    user: MOCK_USERS[0],
    timeAgo: '2 часа назад',
    actionText: 'поделилась цитатой из',
    source: 'Токкэби',
    quoteId: 'q1',
    type: 'new_quote'
  },
  {
    id: 'post_2',
    user: MOCK_USERS[1],
    timeAgo: '4 часа назад',
    actionText: 'добавила в коллекцию цитату @hana_학생',
    quoteId: 'q2',
    type: 'clone'
  },
  {
    id: 'post_3',
    isAchievement: true,
    user: MOCK_USERS[0],
    timeAgo: 'Вчера',
    achievement: 'Полиглот 🔥',
    description: 'Изучено более 1000 слов в словаре!',
    type: 'achievement'
  }
];

const QUOTES_MAP = Object.fromEntries(MOCK_QUOTES.map(q => [q.id, q]));
const QUOTE_OF_THE_DAY = MOCK_QUOTES[0];

// ─── Component ─────────────────────────────────────────────────────────────

export default function Home() {
  const currentLevel = 12;
  const currentXP = 2450;
  const nextLevelXP = 3000;
  const progressPercent = (currentXP / nextLevelXP) * 100;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 relative min-h-screen font-sans selection:bg-brand-cyan/20">
      
      {/* ─── Левая/Центральная колонка (Main Feed) ───────────────────────────── */}
      <main className="flex-1 w-full max-w-2xl space-y-6 relative z-10">
        
        {/* Универсальный блок "Продолжить обучение" — V4: Компактный и светлый */}
        <section className="relative group">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 p-5 rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              
              {/* Compact Thumbnail */}
              <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden relative shrink-0 border border-slate-100 dark:border-slate-800">
                <img 
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80" 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-brand-cyan/90 rounded-md text-[9px] font-bold text-white tracking-wider uppercase">A1 • Drama</div>
              </div>

              {/* Content Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-1.5 text-brand-cyan font-bold text-[11px] tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5" /> На чем мы остановились
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    Диалог: Знакомство в кафе
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Осталось разобрать <span className="text-slate-900 dark:text-white font-semibold">4 фразы</span>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <Link 
                    to="/clip/cafe_meeting_sample" 
                    className="px-5 py-2 bg-brand-cyan text-white text-xs font-bold rounded-xl transition-all hover:bg-brand-cyan/90 active:scale-95 flex items-center gap-1.5 shadow-sm shadow-brand-cyan/20"
                  >
                    <Play className="w-3 h-3 fill-current" /> ПРОДОЛЖИТЬ
                  </Link>
                  
                  <div className="flex flex-col gap-1 min-w-[100px]">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Прогресс</span>
                      <span className="text-brand-cyan">55%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-cyan rounded-full transition-all duration-1000" style={{ width: '55%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Заголовок Ленты */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-brand-pink" /> 
            Пульс сообщества
          </h2>
          <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Посты (Feed) — Тонкие, светлые, компактные */}
        <div className="space-y-4">
          {MOCK_ACTIVITY_POSTS.map((post) => (
            <div 
              key={post.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <Link to={`/profile/${post.user.username}`} className="shrink-0">
                    <img 
                      src={post.user.avatarUrl} 
                      alt="" 
                      className="w-9 h-9 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 shadow-sm" 
                    />
                  </Link>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link to={`/profile/${post.user.username}`} className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-cyan mt-[-2px]">
                        {post.user.displayName}
                      </Link>
                      <span className="text-slate-400 text-xs font-medium tracking-tight">{post.actionText}</span>
                      {post.source && (
                        <span className="text-brand-cyan font-bold text-[11px] bg-brand-cyan/5 px-2 py-0.5 rounded-md">
                          {post.source}
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{post.timeAgo}</p>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600 p-1">
                  <MoreHorizontal className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Post Body */}
              {post.isAchievement ? (
                <div className="rounded-xl border border-brand-gold/20 bg-brand-gold/5 p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-brand-gold/30 shrink-0">
                    <Trophy className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{post.achievement}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{post.description}</p>
                  </div>
                </div>
              ) : (
                post.quoteId && QUOTES_MAP[post.quoteId] && (
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/80 dark:border-slate-700/50 rounded-xl p-4 relative overflow-hidden">
                    <QuoteIcon className="absolute top-2 right-4 w-10 h-10 text-slate-200 dark:text-slate-800/40 opacity-20 pointer-events-none" />
                    
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-slate-900 dark:text-white font-korean leading-snug">
                        {QUOTES_MAP[post.quoteId].textKor}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {QUOTES_MAP[post.quoteId].textRus}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 overflow-x-auto scrollbar-hide">
                      <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors shrink-0">
                        <Heart className="w-3.5 h-3.5" /> {QUOTES_MAP[post.quoteId].likesCount}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand-cyan transition-colors shrink-0" title="Комментарии">
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-500 transition-colors shrink-0" title="Добавить к себе">
                        <Bookmark className="w-3.5 h-3.5" /> {QUOTES_MAP[post.quoteId].clonesCount}
                      </button>
                      <Link 
                        to={`/quote/${post.quoteId}`}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand-cyan transition-colors shrink-0" 
                        title="Разобрать грамматику и слова"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </Link>
                      <button className="ml-auto flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0" title="Поделиться">
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          ))}
          
          <button className="w-full py-3 text-xs font-bold text-slate-400 hover:text-brand-cyan transition-all flex items-center justify-center gap-2">
            ПОКАЗАТЬ ЕЩЕ <ChevronRight className="w-3.5 h-3.5 rotate-90" />
          </button>
        </div>
      </main>

      {/* ─── Правая колонка (Sidebar) ───────────────────────────────────────── */}
      <aside className="w-full lg:w-[280px] shrink-0 space-y-6 md:pt-1">
        
        {/* Vibrant Mini-Profile Card — V7: Colorful & Energetic */}
        <section className="relative group/side overflow-hidden rounded-[2rem]">
          {/* Internal Glow/Background for the block to make it vibrant */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 via-brand-green/5 to-brand-gold/5 opacity-60" />
          
          <div className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-2 border-slate-100 dark:border-slate-800/60 p-6 shadow-xl shadow-brand-cyan/5 text-center">
            
            {/* Avatar with Vibrant Ring */}
            <Link to="/profile/me" className="relative block w-max mx-auto mb-5 group">
              <div className="absolute inset-[-4px] rounded-2xl bg-gradient-to-tr from-brand-cyan via-brand-green to-brand-gold animate-gradient-xy opacity-100" />
              <img 
                src={CURRENT_USER.avatarUrl} 
                alt="" 
                className="relative w-16 h-16 rounded-xl border-2 border-white dark:border-slate-900 bg-white shadow-md transform group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-brand-cyan to-brand-green text-white text-[9px] font-black px-2 py-0.5 rounded-lg border-2 border-white dark:border-slate-900 shadow-lg">
                Ур. {currentLevel}
              </div>
            </Link>

            <div className="space-y-0.5 mb-6">
              <h2 className="font-black text-lg text-slate-900 dark:text-white leading-tight tracking-tight">
                {CURRENT_USER.displayName}
              </h2>
              <div className="inline-block px-2 py-0.5 rounded-full bg-brand-pink/10 text-brand-pink font-bold text-[10px] tracking-tight">
                @{CURRENT_USER.username}
              </div>
            </div>

            <div className="w-full space-y-5">
              {/* XP Progress with custom vibrant styling */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
                  <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3 text-brand-cyan" /> Мастерство</span>
                  <span className="text-brand-cyan">{currentXP} XP</span>
                </div>
                <div className="h-2 w-full bg-white dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner border border-slate-100 dark:border-slate-700">
                  <div className="h-full bg-gradient-to-r from-brand-cyan to-brand-green rounded-full relative shadow-[0_0_10px_rgba(112,161,215,0.3)]" style={{ width: `${progressPercent}%` }}>
                    <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                  </div>
                </div>
              </div>

              {/* Stats Grid with vibrant cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#ff467e]/5 to-white dark:from-[#ff467e]/10 dark:to-slate-800/50 border border-[#ff467e]/10 flex flex-col items-center group/stat hover:scale-[1.02] transition-transform">
                  <div className="w-8 h-8 rounded-full bg-[#ff467e]/10 flex items-center justify-center mb-1 group-hover/stat:bg-[#ff467e]/20 transition-colors">
                    <Flame className="w-4 h-4 text-[#ff467e] animate-pulse" />
                  </div>
                  <span className="text-base font-black text-slate-950 dark:text-white leading-none">14</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1">Стрик</span>
                </div>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-brand-green/5 to-white dark:from-brand-green/10 dark:to-slate-800/50 border border-brand-green/10 flex flex-col items-center group/stat hover:scale-[1.02] transition-transform">
                  <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center mb-1 group-hover/stat:bg-brand-green/20 transition-colors">
                    <BookOpen className="w-4 h-4 text-brand-green" />
                  </div>
                  <span className="text-base font-black text-slate-950 dark:text-white leading-none">1.2k</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1">Слов</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Small Quote Widget */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-1.5 mb-3 text-[10px] font-bold uppercase tracking-widest text-brand-gold">
            <Star className="w-3.5 h-3.5 fill-brand-gold" /> Цитата дня
          </div>
          
          <p className="text-base font-bold text-slate-900 dark:text-white font-korean leading-snug mb-2">
            {QUOTE_OF_THE_DAY.textKor}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 italic">
            {QUOTE_OF_THE_DAY.textRus}
          </p>
          
          <div className="flex items-center gap-3 pt-3 border-t border-slate-50 dark:border-slate-800">
            <span className="text-[10px] font-medium text-slate-400 mr-auto">{QUOTE_OF_THE_DAY.source}</span>
            <button className="text-slate-300 hover:text-rose-500 transition-colors" title="Лайк">
              <Heart className="w-3.5 h-3.5" />
            </button>
            <button className="text-slate-300 hover:text-brand-cyan transition-colors" title="Комментарии">
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
            <button className="text-slate-300 hover:text-amber-500 transition-colors" title="Сохранить">
              <Bookmark className="w-3.5 h-3.5" />
            </button>
            <Link to={`/quote/${QUOTE_OF_THE_DAY.id}`} className="text-slate-300 hover:text-brand-cyan transition-colors" title="Разобрать">
              <BookOpen className="w-3.5 h-3.5" />
            </Link>
            <button className="text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors" title="Поделиться">
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="text-center px-4">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-70">
            <Link to="/directory" className="hover:text-brand-cyan">Каталог</Link>
            <Link to="/leaderboard" className="hover:text-brand-cyan">Рейтинг</Link>
            <Link to="/help" className="hover:text-brand-cyan">Помощь</Link>
          </div>
          <p className="mt-3 text-[8px] font-bold text-slate-300 uppercase tracking-widest">
            © 2026 K-LINGUA
          </p>
        </footer>

      </aside>
    </div>
  );
}
