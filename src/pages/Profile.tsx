import { ElementType } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Star, Users, MessageSquareQuote, ArrowLeft, Bookmark, MessageCircle, BookOpen, Share2 } from 'lucide-react';
import { MOCK_USERS, MOCK_QUOTES } from '../data/quotes';
import { cn } from '../lib/utils';

/** Renders one row in the stats "Карма" section */
function StatBadge({ icon: Icon, label, value }: { icon: ElementType; label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-white/60 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/50 rounded-2xl px-6 py-4 shadow-sm">
      <Icon className="w-5 h-5 text-brand-cyan mb-0.5" />
      <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const user = MOCK_USERS.find(u => u.username === username);

  if (!user) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <MessageSquareQuote className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Профиль не найден</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Пользователя <code>@{username}</code> не существует.</p>
        <Link to="/quotes" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-cyan text-white text-sm font-medium hover:bg-brand-cyan/90 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Вернуться в ленту
        </Link>
      </div>
    );
  }

  // Determine the set of public quotes belonging to this user
  const userQuotes = MOCK_QUOTES.filter(q => q.originalCreatorId === user.id && q.isPublic);
  const totalLikes = userQuotes.reduce((acc, q) => acc + q.likesCount, 0);
  const totalClones = userQuotes.reduce((acc, q) => acc + q.clonesCount, 0);
  const isOwnProfile = username === 'me';

  return (
    <div className="p-8 space-y-8 relative max-w-3xl mx-auto">
      {/* Ambient blobs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-transparent dark:bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back link */}
      <Link to="/quotes" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-cyan transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Назад в ленту
      </Link>

      {/* Profile card */}
      <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm relative z-10">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Avatar */}
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-20 h-20 rounded-2xl border-2 border-white dark:border-slate-700 shadow-lg bg-slate-100 dark:bg-slate-800"
          />

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.displayName}</h1>
              <span className="text-slate-500 dark:text-slate-400 text-sm">@{user.username}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">{user.bio}</p>

            {/* Achievements */}
            {user.achievements.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {user.achievements.map(ach => (
                  <span
                    key={ach}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-brand-cyan/10 text-brand-cyan text-xs font-medium border border-brand-cyan/20"
                  >
                    <Star className="w-3 h-3" />
                    {ach}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* CTA for own profile */}
          {isOwnProfile && (
            <button className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap">
              Редактировать
            </button>
          )}
        </div>
      </div>

      {/* Karma stats */}
      <div className="grid grid-cols-3 gap-4 relative z-10">
        <StatBadge icon={MessageSquareQuote} label="Цитат добавлено" value={userQuotes.length} />
        <StatBadge icon={Heart} label="Лайков получено" value={totalLikes.toLocaleString('ru-RU')} />
        <StatBadge icon={Users} label="Учеников" value={totalClones.toLocaleString('ru-RU')} />
      </div>

      {/* Public quotes collection */}
      <div className="relative z-10 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Цитаты от {user.displayName}
        </h2>

        {userQuotes.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-600">
            Пока нет публичных цитат
          </div>
        ) : (
          <div className="space-y-4">
            {userQuotes.map(q => (
              <div
                key={q.id}
                className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl p-5 shadow-sm hover:border-brand-cyan/20 transition-all"
              >
                <p className="text-lg font-medium text-slate-900 dark:text-white font-korean leading-relaxed mb-2">
                  {q.textKor}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{q.textRus}</p>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center gap-4 text-slate-500 text-sm">
                    <button className="flex items-center gap-1.5 hover:text-rose-500 transition-colors" title="Лайк">
                      <Heart className="w-3.5 h-3.5" /> {q.likesCount}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-brand-cyan transition-colors" title="Комментарии">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-amber-500 transition-colors" title="Добавить к себе">
                      <Bookmark className="w-3.5 h-3.5" /> {q.clonesCount}
                    </button>
                    <Link to={`/quote/${q.id}`} className="flex items-center gap-1.5 hover:text-brand-cyan transition-colors" title="Разбор">
                      <BookOpen className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <button className="ml-auto flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" title="Поделиться">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
