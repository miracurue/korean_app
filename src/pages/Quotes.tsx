import { Quote, Heart, Plus, MessageCircle } from 'lucide-react';

const QUOTES = [
  {
    id: 1,
    korean: "너와 함께한 시간 모두 눈부셨다. 날이 좋아서, 날이 좋지 않아서, 날이 적당해서, 모든 날이 좋았다.",
    translation: "Всё время, проведённое с тобой, было ослепительным. Потому что погода была хорошей, потому что погода была плохой, потому что погода была подходящей. Все дни были хорошими.",
    source: "Токкэби (Гоблин)",
    likes: 1240,
    comments: 45,
    tags: ["Любовь", "Грусть"]
  },
  {
    id: 2,
    korean: "사랑은 미안하다고 말하지 않는 거야.",
    translation: "Любовь означает никогда не говорить, что тебе жаль.",
    source: "Зимняя соната",
    likes: 892,
    comments: 12,
    tags: ["Классика", "Романтика"]
  },
  {
    id: 3,
    korean: "포기하지 마. 포기하는 순간 경기는 끝나는 거야.",
    translation: "Не сдавайся. В тот момент, когда ты сдаешься, игра заканчивается.",
    source: "Итэвон Класс",
    likes: 2105,
    comments: 89,
    tags: ["Мотивация", "Жизнь"]
  }
];

export default function Quotes() {
  return (
    <div className="p-8 space-y-8 relative">
      <div className="absolute top-20 right-10 w-64 h-64 bg-transparent dark:bg-brand-cyan/10 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="flex justify-between items-end relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Цитатник</h1>
          <p className="text-slate-500 dark:text-slate-400">Лучшие фразы из дорам и песен, собранные сообществом</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-xl text-slate-700 dark:text-white hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors text-sm font-medium shadow-sm">
            Мои цитаты
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-cyan hover:bg-brand-cyan/90 rounded-xl text-white transition-colors text-sm font-medium shadow-lg shadow-brand-cyan/20">
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['Популярные', 'Новые', 'Мотивация', 'Любовь', 'Грусть', 'Из песен', 'Из дорам'].map(tag => (
          <button key={tag} className="px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-brand-cyan transition-colors whitespace-nowrap text-sm shadow-sm">
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {QUOTES.map(quote => (
          <div key={quote.id} className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl p-6 hover:border-brand-cyan/30 transition-all duration-300 group shadow-sm hover:shadow-md hover:-translate-y-1">
            <Quote className="w-8 h-8 text-slate-200 dark:text-slate-800 mb-4 group-hover:text-brand-cyan/20 transition-colors" />
            <p className="text-2xl font-medium text-slate-900 dark:text-white mb-4 font-korean leading-relaxed">
              {quote.korean}
            </p>
            <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {quote.translation}
            </p>
            
            <div className="flex justify-between items-end border-t border-slate-200 dark:border-slate-800/50 pt-4">
              <div>
                <span className="text-brand-cyan font-medium text-sm block mb-2">{quote.source}</span>
                <div className="flex gap-2">
                  {quote.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800/50 text-slate-500 text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="flex items-center gap-1.5 text-slate-500 hover:text-brand-cyan transition-colors text-sm font-medium">
                  <Heart className="w-4 h-4" />
                  {quote.likes}
                </button>
                <button className="flex items-center gap-1.5 text-slate-500 hover:text-brand-gold transition-colors text-sm font-medium">
                  <MessageCircle className="w-4 h-4" />
                  {quote.comments}
                </button>
                <button className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium ml-2 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Plus className="w-4 h-4" />
                  В словарь фраз
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
