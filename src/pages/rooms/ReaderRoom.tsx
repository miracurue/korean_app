import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, History, ChevronRight, FileText, Sparkles, Loader2, Upload, Play } from 'lucide-react';
import { useProgress } from '../../lib/useProgress';

export default function ReaderRoom() {
  const navigate = useNavigate();
  const { history, getLastProgress } = useProgress('reader');
  const [activeTab, setActiveTab] = useState<'continue' | 'upload'>('continue');
  const [isTranslating, setIsTranslating] = useState(false);
  const [customText, setCustomText] = useState('');
  const textInputRef = useRef<HTMLInputElement>(null);

  const lastProgress = getLastProgress();

  const handleTranslateAI = () => {
    if (!customText.trim()) return;
    setIsTranslating(true);
    
    // Имитация процесса перевода и генерации разбора (с ИИ)
    setTimeout(() => {
      setIsTranslating(false);
      alert('AI: Художественный перевод и разбор сгенерированы! Открываем ридер...');
      // В реальном приложении здесь был бы роутинг на кастомный PoemReader
      navigate('/poem/local');
    }, 2500);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col min-h-[80vh] animate-in fade-in duration-500">
      
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Кабинет Чтения
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Читайте стихи, цитаты и свои тексты с умным переводом</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-8">
        <button 
          onClick={() => setActiveTab('continue')}
          className={`pb-4 px-2 text-lg font-medium transition-colors relative ${activeTab === 'continue' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Продолжить чтение
          {activeTab === 'continue' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('upload')}
          className={`pb-4 px-2 text-lg font-medium transition-colors relative ${activeTab === 'upload' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Свой текст (BYOC)
          {activeTab === 'upload' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full" />
          )}
        </button>
      </div>

      <div className="flex-1 w-full max-w-4xl flex flex-col min-h-0">
        {activeTab === 'continue' ? (
          <div className="flex flex-col gap-6 h-full">
            {/* Main Resume Card */}
            {lastProgress ? (
              <div 
                className="bg-[#09090b] rounded-3xl p-6 md:p-8 border border-zinc-800 shadow-xl shadow-purple-500/5 relative overflow-hidden group cursor-pointer hover:border-purple-500/30 transition-all duration-500 hover:shadow-purple-500/10"
                onClick={() => navigate(lastProgress.isLocal ? '/poem/local' : `/poem/${lastProgress.id}`)}
              >
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-zinc-900 flex flex-shrink-0 items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500 shadow-inner">
                    <BookOpen className="w-10 h-10 text-zinc-700" />
                    <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/20 transition-colors backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center">
                       <div className="w-12 h-12 bg-white/90 dark:bg-slate-900/90 rounded-full flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-100">
                          <Play className="w-5 h-5 text-purple-500 fill-current ml-1" />
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full text-center md:text-left flex flex-col justify-center">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-purple-500 font-bold text-xs uppercase tracking-widest">
                       Продолжить чтение
                    </div>
                    <h3 className="text-2xl font-black text-white mb-1 leading-tight line-clamp-1">
                      {lastProgress.title}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-6 line-clamp-1">
                      {lastProgress.source || 'Прочитано недавно'} • {new Date(lastProgress.lastAccessed).toLocaleDateString()}
                    </p>
                    
                    {/* Integrated Progress Bar */}
                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 max-w-md mx-auto md:mx-0">
                       <span>{Math.floor(lastProgress.timestamp / 60)}:{(lastProgress.timestamp % 60).toFixed(0).padStart(2, '0')}</span>
                       <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-300" 
                             style={{ width: `${lastProgress.duration ? (lastProgress.timestamp / lastProgress.duration) * 100 : 0}%`}} 
                          />
                       </div>
                       <span>{Math.floor((lastProgress.duration || 0) / 60)}:{((lastProgress.duration || 0) % 60).toFixed(0).padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#09090b] rounded-3xl p-10 border border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-500/50">
                    <BookOpen className="w-10 h-10" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Начните обучение</h3>
                 <p className="text-sm text-zinc-500 max-w-sm">
                   Здесь появится текст, который вы читали последним.
                 </p>
              </div>
            )}

            {/* History List Section */}
            <div className="flex flex-col flex-1 min-h-0 mt-2">
               <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2 text-zinc-200">
                    <History className="w-4 h-4 text-zinc-500" />
                    <h3 className="font-bold text-lg">Недавние тексты</h3>
                  </div>
               </div>
               
               <div className="overflow-y-auto flex-1 scrollbar-stylish pr-2">
                 {history.length <= 1 ? (
                   <div className="p-8 text-center text-zinc-500 text-sm bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-dashed border-zinc-800">
                     У вас пока нет истории чтения.
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 gap-3">
                     {history.slice(1).map(item => (
                       <div 
                         key={item.id} 
                         className="group flex items-center gap-4 p-3 pr-4 bg-[#09090b] rounded-2xl border border-zinc-800 shadow-sm hover:shadow-md hover:border-purple-500/30 transition-all cursor-pointer"
                         onClick={() => navigate(item.isLocal ? '/poem/local' : `/poem/${item.id}`)}
                       >
                         <div className="w-14 h-14 rounded-xl bg-zinc-900 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                           <FileText className="w-5 h-5 text-zinc-700" />
                           <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 transition-colors" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-sm text-white truncate group-hover:text-purple-400 transition-colors line-clamp-1">{item.title}</h4>
                           <div className="flex items-center gap-2 mt-1">
                             <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                               <div className="h-full bg-purple-500/60" style={{ width: `${item.duration ? (item.timestamp / item.duration) * 100 : 0}%`}} />
                             </div>
                             <span className="text-[10px] text-zinc-500 font-mono flex-shrink-0">
                               {new Date(item.lastAccessed).toLocaleDateString()}
                             </span>
                           </div>
                         </div>
                         <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-purple-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col items-start min-h-[400px]">
             
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <FileText className="w-64 h-64 text-purple-500" />
             </div>

             <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 relative z-10">Добавить свой текст (BYOC)</h2>
             
             <div className="w-full flex-1 relative z-10 flex flex-col">
               <textarea 
                 value={customText}
                 onChange={(e) => setCustomText(e.target.value)}
                 className="w-full flex-1 min-h-[300px] bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none font-korean text-lg shadow-inner"
                 placeholder="Вставьте корейский текст сюда..."
               />
               
               <div className="flex flex-wrap justify-end mt-6 gap-4">
                 <input 
                   type="file" 
                   className="hidden" 
                   ref={textInputRef} 
                   onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) {
                       const reader = new FileReader();
                       reader.onload = (event) => setCustomText(event.target?.result as string);
                       reader.readAsText(file);
                     }
                   }}
                   accept=".txt"
                 />

                 <button 
                   onClick={() => textInputRef.current?.click()}
                   className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2"
                 >
                   <Upload className="w-4 h-4" />
                   Загрузить файл (.txt)
                 </button>

                 {/* MOCK AI BUTTON */}
                 <button 
                   onClick={handleTranslateAI}
                   disabled={isTranslating || !customText.trim()}
                   className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                 >
                   {isTranslating ? (
                     <>
                       <Loader2 className="w-5 h-5 animate-spin" />
                       Анализ...
                     </>
                   ) : (
                     <>
                       <Sparkles className="w-5 h-5" />
                       AI: Перевести
                     </>
                   )}
                 </button>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
