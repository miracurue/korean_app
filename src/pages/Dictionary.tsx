import { useState } from 'react';
import { Book, CheckCircle, Clock, Play, Search, Filter } from 'lucide-react';

const WORDS = [
  { id: 1, korean: '사랑', translation: 'любовь', status: 'learning', nextReview: 'через 2 часа', progress: 40 },
  { id: 2, korean: '행복', translation: 'счастье', status: 'learned', nextReview: 'через 5 дней', progress: 100 },
  { id: 3, korean: '기억', translation: 'память, воспоминание', status: 'learning', nextReview: 'завтра', progress: 60 },
  { id: 4, korean: '약속', translation: 'обещание', status: 'new', nextReview: 'сейчас', progress: 0 },
  { id: 5, korean: '마음', translation: 'душа, сердце, чувства', status: 'learning', nextReview: 'через 4 часа', progress: 20 },
];

const PHRASES = [
  { id: 1, korean: '사랑은 미안하다고 말하지 않는 거야.', translation: 'Любовь означает никогда не говорить, что тебе жаль.', source: 'Зимняя соната', status: 'learning', nextReview: 'завтра', progress: 30 },
  { id: 2, korean: '너와 함께한 시간 모두 눈부셨다.', translation: 'Всё время, проведённое с тобой, было ослепительным.', source: 'Токкэби', status: 'new', nextReview: 'сейчас', progress: 0 },
];

export default function Dictionary() {
  const [activeTab, setActiveTab] = useState<'words' | 'phrases'>('words');

  return (
    <div className="p-8 space-y-8 relative">
      <div className="absolute top-40 left-20 w-72 h-72 bg-transparent dark:bg-brand-gold/10 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '1s' }} />
      <div className="flex justify-between items-end relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Мой словарь</h1>
          <p className="text-slate-500 dark:text-slate-400">Слова и фразы, добавленные из дорам и песен</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-pink to-brand-cream rounded-xl text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-brand-pink/20">
          <Play className="w-5 h-5 fill-current" />
          Учить {activeTab === 'words' ? 'слова' : 'фразы'} (12)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-brand-cyan/20 flex items-center justify-center text-brand-cyan">
              <Book className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Всего {activeTab === 'words' ? 'слов' : 'фраз'}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeTab === 'words' ? '458' : '24'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Выучено</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeTab === 'words' ? '124' : '5'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-brand-gold/20 flex items-center justify-center text-brand-gold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">На повторение</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeTab === 'words' ? '12' : '3'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('words')}
          className={`pb-4 px-2 text-lg font-medium transition-colors relative ${activeTab === 'words' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Слова
          {activeTab === 'words' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan rounded-t-full" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('phrases')}
          className={`pb-4 px-2 text-lg font-medium transition-colors relative ${activeTab === 'phrases' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Фразы
          {activeTab === 'phrases' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan rounded-t-full" />
          )}
        </button>
      </div>

      <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder={`Поиск ${activeTab === 'words' ? 'слов' : 'фраз'}...`}
              className="pl-9 pr-4 py-1.5 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan transition-colors w-64 shadow-sm"
            />
          </div>
          <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <Filter className="w-4 h-4" />
          </button>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
              <th className="p-4 font-medium">{activeTab === 'words' ? 'Слово' : 'Фраза'}</th>
              <th className="p-4 font-medium">Перевод</th>
              {activeTab === 'phrases' && <th className="p-4 font-medium">Источник</th>}
              <th className="p-4 font-medium">Прогресс</th>
              <th className="p-4 font-medium">Повторение</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {activeTab === 'words' ? (
              WORDS.map(word => (
                <tr key={word.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="p-4">
                    <span className="text-lg font-bold text-slate-900 dark:text-white font-korean">{word.korean}</span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{word.translation}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${word.progress === 100 ? 'bg-emerald-500' : 'bg-brand-cyan'}`}
                          style={{ width: `${word.progress}%` }}
                        />
                      </div>
                      <span className="text-slate-500 text-xs">{word.progress}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      word.status === 'learned' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                      word.status === 'new' ? 'bg-brand-cyan/10 text-brand-cyan' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {word.nextReview}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              PHRASES.map(phrase => (
                <tr key={phrase.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="p-4 max-w-xs">
                    <span className="text-base font-medium text-slate-900 dark:text-white font-korean leading-relaxed">{phrase.korean}</span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">{phrase.translation}</td>
                  <td className="p-4 text-slate-500 text-xs">{phrase.source}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${phrase.progress === 100 ? 'bg-emerald-500' : 'bg-brand-cyan'}`}
                          style={{ width: `${phrase.progress}%` }}
                        />
                      </div>
                      <span className="text-slate-500 text-xs">{phrase.progress}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      phrase.status === 'learned' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                      phrase.status === 'new' ? 'bg-brand-cyan/10 text-brand-cyan' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {phrase.nextReview}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
