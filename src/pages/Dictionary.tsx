import React, { useState, useMemo } from 'react';
import { Book, CheckCircle, Clock, Play, Search, Filter, Film, Music, AlignLeft, Quote as QuoteIcon, X, MoveRight, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

// ─── Types and Mock Data ──────────────────────────────────────────────────

export type WordStatus = 'learning' | 'learned' | 'ignored';

export type Word = {
  id: string;
  korean: string;
  romaja: string;
  translation: string;
  status: WordStatus;
  isScheduled?: boolean;
  source: {
    type: 'video' | 'audio' | 'poem' | 'quote';
    label: string;
    url: string;
  };
};

const INITIAL_WORDS: Word[] = [
  { id: '1', korean: '사랑', romaja: '[sarang]', translation: 'любовь', status: 'learning', isScheduled: true, source: { type: 'video', label: 'Токкэби Ep.1', url: '/rooms/video' } },
  { id: '2', korean: '행복', romaja: '[haengbok]', translation: 'счастье', status: 'learned', source: { type: 'poem', label: 'Стих о весне', url: '/poem/1' } },
  { id: '3', korean: '기억', romaja: '[gieok]', translation: 'память, воспоминание', status: 'learning', source: { type: 'audio', label: 'Love Scenario', url: '/rooms/audio' } },
  { id: '4', korean: '약속', romaja: '[yaksok]', translation: 'обещание', status: 'learning', isScheduled: true, source: { type: 'quote', label: 'Цитата дня', url: '/quote/q1' } },
  { id: '5', korean: '마음', romaja: '[maeum]', translation: 'душа, сердце, чувства', status: 'learning', source: { type: 'video', label: 'Start-Up Ep.4', url: '/rooms/video' } },
  { id: '6', korean: '별', romaja: '[byeol]', translation: 'звезда', status: 'learning', source: { type: 'poem', label: 'Ночное небо', url: '/poem/2' } },
  { id: '7', korean: '눈물', romaja: '[nunmul]', translation: 'слезы', status: 'learned', source: { type: 'video', label: 'Goblin', url: '/rooms/video' } },
  { id: '8', korean: '시간', romaja: '[sigan]', translation: 'время', status: 'learning', source: { type: 'audio', label: 'Spring Day', url: '/rooms/audio' } },
  { id: '9', korean: '바다', romaja: '[bada]', translation: 'море', status: 'learning', source: { type: 'video', label: 'Our Blues', url: '/rooms/video' } },
  { id: '10', korean: '햇살', romaja: '[haessal]', translation: 'солнечный свет', status: 'ignored', source: { type: 'poem', label: 'Утро', url: '/poem/3' } },
  { id: '11', korean: '꿈', romaja: '[kkum]', translation: 'мечта, сон', status: 'learning', source: { type: 'quote', label: 'Вдохновение', url: '/quote/q2' } },
  { id: '12', korean: '여행', romaja: '[yeohaeng]', translation: 'путешествие', status: 'learning', source: { type: 'video', label: 'Hometown Cha-Cha-Cha', url: '/rooms/video' } },
  { id: '13', korean: '바람', romaja: '[baram]', translation: 'ветер', status: 'learning', source: { type: 'poem', label: 'Осенний ветер', url: '/poem/4' } },
  { id: '14', korean: '친구', romaja: '[chingu]', translation: 'друг', status: 'learned', source: { type: 'video', label: 'Crash Landing on You', url: '/rooms/video' } },
  { id: '15', korean: '하늘', romaja: '[haneul]', translation: 'небо', status: 'learning', source: { type: 'quote', label: 'Мудрость', url: '/quote/q3' } },
  { id: '16', korean: '노래', romaja: '[norae]', translation: 'песня', status: 'ignored', source: { type: 'audio', label: 'Stay With Me', url: '/rooms/audio' } },
  { id: '17', korean: '기다림', romaja: '[gidarim]', translation: 'ожидание', status: 'learning', source: { type: 'video', label: 'Twenty-Five Twenty-One', url: '/rooms/video' } },
  { id: '18', korean: '미소', romaja: '[miso]', translation: 'улыбка', status: 'learning', source: { type: 'quote', label: 'Радость', url: '/quote/q4' } },
  { id: '19', korean: '노력', romaja: '[noryeok]', translation: 'усилие, старание', status: 'learning', source: { type: 'video', label: 'Itaewon Class', url: '/rooms/video' } },
  { id: '20', korean: '영원', romaja: '[yeongwon]', translation: 'вечность', status: 'learning', source: { type: 'poem', label: 'Стих о вечном', url: '/poem/5' } },
];

const SourceIcon = ({ type }: { type: Word['source']['type'] }) => {
  switch (type) {
    case 'video': return <Film className="w-3.5 h-3.5" />;
    case 'audio': return <Music className="w-3.5 h-3.5" />;
    case 'poem': return <AlignLeft className="w-3.5 h-3.5" />;
    case 'quote': return <QuoteIcon className="w-3.5 h-3.5" />;
  }
};

// ─── Component ────────────────────────────────────────────────────────────

export default function Dictionary() {
  const [words, setWords] = useState<Word[]>(INITIAL_WORDS);
  const [activeTab, setActiveTab] = useState<WordStatus>('learning');
  const [searchQuery, setSearchQuery] = useState('');

  // Learning Modal State
  const [learningModalOpen, setLearningModalOpen] = useState(false);
  const [learningStage, setLearningStage] = useState<'amount' | 'card'>('amount');
  const [learningQueue, setLearningQueue] = useState<Word[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Derived state
  const learningWords = words.filter(w => w.status === 'learning' || w.status === 'ignored');
  const learnedWords = words.filter(w => w.status === 'learned');
  const ignoredWords = words.filter(w => w.status === 'ignored');
  const actualLearningWords = words.filter(w => w.status === 'learning'); // For training sessions
  
  const filteredWords = useMemo(() => {
    let list = activeTab === 'learning' ? learningWords : learnedWords;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(w => 
        w.korean.toLowerCase().includes(q) || 
        w.translation.toLowerCase().includes(q) ||
        w.romaja.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, learningWords, learnedWords, searchQuery]);

  // Actions
  const toggleWordStatus = (id: string, newStatus: WordStatus) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, status: newStatus, isScheduled: false } : w));
  };

  const toggleScheduling = (id: string) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, isScheduled: !w.isScheduled } : w));
  };

  const startLearning = (amount: number) => {
    // 1. Prioritize scheduled words
    const scheduled = actualLearningWords.filter(w => w.isScheduled);
    const others = actualLearningWords.filter(w => !w.isScheduled).sort(() => 0.5 - Math.random());
    
    const combined = [...scheduled, ...others];
    const finalQueue = combined.slice(0, Math.min(amount, combined.length));

    if (finalQueue.length === 0) {
      alert('Нет слов для изучения!');
      return;
    }

    setLearningQueue(finalQueue);
    setCurrentCardIndex(0);
    setLearningStage('card');
    setLearningModalOpen(true);
  };

  const handleFlashcardLearn = (wordId: string) => {
    toggleWordStatus(wordId, 'learned');
    nextFlashcard();
  };

  const handleFlashcardSkip = (wordId: string) => {
    // 1. Mark as ignored
    toggleWordStatus(wordId, 'ignored');

    // 2. Try to find a replacement word to maintain the quota
    // Pool = learning words NOT in the current queue AND not the one we just ignored
    const queueIds = new Set(learningQueue.map(w => w.id));
    const pool = words.filter(w => 
      w.status === 'learning' && 
      !queueIds.has(w.id) && 
      w.id !== wordId
    );
    
    // Prioritize scheduled replacements
    const scheduledReplacements = pool.filter(w => w.isScheduled);
    const otherReplacements = pool.filter(w => !w.isScheduled).sort(() => 0.5 - Math.random());
    
    const replacementPool = [...scheduledReplacements, ...otherReplacements];

    if (replacementPool.length > 0) {
      const newWord = replacementPool[0];
      setLearningQueue(prev => {
        const newQueue = [...prev];
        newQueue[currentCardIndex] = newWord;
        return newQueue;
      });
      // Word is replaced in-place, user stays on current index to see the new word
    } else {
      // No replacement available, just remove it
      const currentQueueLength = learningQueue.length;
      
      setLearningQueue(prev => prev.filter(w => w.id !== wordId));
      
      if (currentCardIndex >= currentQueueLength - 1 && currentCardIndex > 0) {
        setCurrentCardIndex(prev => prev - 1);
      }
      
      // If the queue becomes empty or this was the last word, finish the session
      if (currentQueueLength <= 1) {
        setTimeout(() => {
          setLearningModalOpen(false);
          setLearningStage('amount');
        }, 300);
      }
    }
  };
  
  // ... table implementation truncated for readability within the tool instruction ...
  // Full replacements are safer for state updates.


  const nextFlashcard = () => {
    if (currentCardIndex + 1 < learningQueue.length) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // Done learning
      setLearningStage('amount');
      setLearningModalOpen(false);
      alert('Сессия завершена! Вы молодец!');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 relative max-w-5xl mx-auto font-sans selection:bg-brand-cyan/20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Мой словарь</h1>
          <p className="text-slate-500 dark:text-slate-400">Слова изученные в процессе просмотра и чтения</p>
        </div>
        <button 
          onClick={() => {
            if (actualLearningWords.length === 0) {
              alert('Все слова выучены! Добавьте новые из каталога.');
              return;
            }
            setLearningStage('amount');
            setLearningModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-cyan to-blue-500 rounded-xl text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-brand-cyan/20 active:scale-95"
        >
          <Play className="w-5 h-5 fill-current" />
          Тренировка
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-cyan/20 flex items-center justify-center text-brand-cyan shrink-0">
            <Book className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Всего слов</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{words.length}</p>
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Выучено</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{learnedWords.length}</p>
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Учу сейчас</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{actualLearningWords.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('learning')}
          className={cn(
            "pb-4 px-2 text-lg font-medium transition-colors relative blur-none",
            activeTab === 'learning' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          Учу
          {activeTab === 'learning' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan rounded-t-full" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('learned')}
          className={cn(
            "pb-4 px-2 text-lg font-medium transition-colors relative blur-none",
            activeTab === 'learned' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          Выучено
          {activeTab === 'learned' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan rounded-t-full" />
          )}
        </button>
      </div>

      {/* Search & Table Wrapper */}
      <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-700/20">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Поиск по слову или переводу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 pl-9 pr-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all shadow-sm"
            />
          </div>
          <button className="hidden sm:flex p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <Filter className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-5 font-semibold w-1/4">Слово</th>
                <th className="p-5 font-semibold w-1/3">Перевод</th>
                <th className="p-5 font-semibold">Где встретилось</th>
                <th className="p-5 font-semibold text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredWords.length > 0 ? (
                filteredWords.map(word => (
                  <tr key={word.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-slate-900 dark:text-white font-korean">{word.korean}</span>
                        <span className="text-xs font-mono text-brand-cyan/80">{word.romaja}</span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-600 dark:text-slate-300 font-medium">
                      {word.translation}
                    </td>
                    <td className="p-5">
                      <Link 
                        to={word.source.url}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <SourceIcon type={word.source.type} />
                        <span className="truncate max-w-[120px]">{word.source.label}</span>
                      </Link>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        {activeTab === 'learning' ? (
                          <>
                            {word.status === 'ignored' ? (
                              <button 
                                onClick={() => toggleWordStatus(word.id, 'learning')}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                              >
                                Не учим
                              </button>
                            ) : (
                              <button 
                                onClick={() => toggleScheduling(word.id)}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                  word.isScheduled 
                                    ? "bg-brand-gold text-white shadow-md shadow-brand-gold/20" 
                                    : "bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan hover:text-white"
                                )}
                              >
                                {word.isScheduled ? 'В плане' : 'Учить'}
                              </button>
                            )}
                            <button 
                              onClick={() => toggleWordStatus(word.id, 'learned')}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={word.status === 'ignored'}
                            >
                              Выучил
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => toggleWordStatus(word.id, 'learning')}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors"
                          >
                            Вернуть к изучению
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Слов не найдено. Добавьте новые слова из плеера или ридера!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Flashcard Learning Modal ──────────────────────────────────────── */}
      
      {learningModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setLearningModalOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col min-h-[400px]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Book className="w-4 h-4" /> Изучение слов
              </span>
              <button 
                onClick={() => setLearningModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-center items-center">
              {learningStage === 'amount' ? (
                <div className="text-center w-full space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Сколько слов учить сегодня?</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Короткие сессии помогают лучше запоминать.</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[5, 10, 15, actualLearningWords.length].map((amount, idx) => {
                      if (amount > actualLearningWords.length && idx !== 3) return null; // Don't show numeric buttons higher than available words
                      
                      const label = idx === 3 ? `Все (${actualLearningWords.length})` : `${amount} слов`;
                      
                      return (
                        <button 
                          key={idx}
                          onClick={() => startLearning(amount)}
                          className="py-4 bg-slate-50 dark:bg-slate-800 hover:bg-brand-cyan/10 hover:border-brand-cyan/50 hover:text-brand-cyan border-2 border-transparent text-slate-700 dark:text-slate-300 rounded-2xl font-bold transition-all"
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col">
                  {/* Progress indicator */}
                  <div className="flex justify-between text-xs font-bold text-slate-400 mb-4 px-2">
                    <span>Слово {currentCardIndex + 1} из {learningQueue.length}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-8">
                    <div 
                      className="h-full bg-brand-cyan transition-all duration-300"
                      style={{ width: `${((currentCardIndex + 1) / learningQueue.length) * 100}%` }}
                    />
                  </div>

                  {/* Flashcard with Navigation */}
                  <div className="flex-1 flex items-center justify-between gap-4 mb-8 group">
                    <button 
                      onClick={() => currentCardIndex > 0 && setCurrentCardIndex(prev => prev - 1)}
                      disabled={currentCardIndex === 0}
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={32} />
                    </button>

                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="space-y-2">
                        <h2 className="text-6xl font-black text-slate-900 dark:text-white font-korean tracking-tighter">
                          {learningQueue[currentCardIndex]?.korean}
                        </h2>
                        <p className="text-brand-cyan font-mono text-lg">{learningQueue[currentCardIndex]?.romaja}</p>
                      </div>
                      
                      {/* Add a subtle visual divider */}
                      <div className="w-12 h-1 bg-slate-200 dark:border-slate-800 rounded-full mx-auto" />

                      <h3 className="text-3xl font-medium text-slate-700 dark:text-slate-300">
                        {learningQueue[currentCardIndex]?.translation}
                      </h3>

                      {/* Source hint */}
                      <div className="mt-4 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl inline-flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Где встретилось</span>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                          <SourceIcon type={learningQueue[currentCardIndex]?.source.type} />
                          {learningQueue[currentCardIndex]?.source.label}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => currentCardIndex < learningQueue.length - 1 && setCurrentCardIndex(prev => prev + 1)}
                      disabled={currentCardIndex === learningQueue.length - 1}
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={32} />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button 
                      onClick={() => handleFlashcardSkip(learningQueue[currentCardIndex].id)}
                      className="py-4 rounded-xl font-bold text-slate-500 border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Не буду учить
                    </button>
                    <button 
                      onClick={() => handleFlashcardLearn(learningQueue[currentCardIndex].id)}
                      className="py-4 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      Выучил!
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
