import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Play, Music, Loader2, Sparkles, Headphones, ChevronRight, History } from 'lucide-react';
import { useProgress } from '../../lib/useProgress';
import { cn } from '../../lib/utils';

export default function AudioRoom() {
  const navigate = useNavigate();
  const { history, getLastProgress } = useProgress('audio');
  const [activeTab, setActiveTab] = useState<'continue' | 'upload'>('continue');
  const [isHovering, setIsHovering] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  const lastProgress = getLastProgress();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const audioFile = files.find(f => f.type.startsWith('audio/'));
    if (audioFile) {
       setFileSelected(audioFile);
    }
  };

  const handleExtractAI = () => {
    if (!fileSelected) return;
    setIsExtracting(true);
    
    setTimeout(() => {
      setIsExtracting(false);
      navigate('/local-audio-player', { 
         state: { 
            audioFile: fileSelected, 
            subtitleFile: subtitleFile 
         } 
      }); 
    }, 2500);
  };

  const handleWatchNow = () => {
    if (!fileSelected) return;
    navigate('/local-audio-player', { 
       state: { 
          audioFile: fileSelected, 
          subtitleFile: subtitleFile 
       } 
    }); 
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col min-h-[80vh] animate-in fade-in duration-500">
      
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
          <Headphones className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Кабинет Аудио
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Слушайте подкасты и песни с караоке-субтитрами</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-8">
        <button 
          onClick={() => setActiveTab('continue')}
          className={`pb-4 px-2 text-lg font-medium transition-colors relative ${activeTab === 'continue' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Продолжить прослушивание
          {activeTab === 'continue' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-t-full" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('upload')}
          className={`pb-4 px-2 text-lg font-medium transition-colors relative ${activeTab === 'upload' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Загрузить свое (BYOC)
          {activeTab === 'upload' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-t-full" />
          )}
        </button>
      </div>

      <div className="flex-1 w-full max-w-4xl flex flex-col min-h-0">
        {activeTab === 'continue' ? (
          <div className="flex flex-col gap-6 h-full">
            {/* Main Resume Card */}
            {lastProgress ? (
              <div 
                className="bg-[#09090b] rounded-3xl p-6 md:p-8 border border-zinc-800 shadow-xl shadow-teal-500/5 relative overflow-hidden group cursor-pointer hover:border-teal-500/30 transition-all duration-500 hover:shadow-teal-500/10"
                onClick={() => navigate(lastProgress.isLocal ? '/local-audio-player' : `/player/${lastProgress.id}`)}
              >
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-zinc-900 flex flex-shrink-0 items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500 shadow-inner">
                    <Music className="w-10 h-10 text-zinc-700" />
                    <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/20 transition-colors backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center">
                       <div className="w-12 h-12 bg-white/90 dark:bg-slate-900/90 rounded-full flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-100">
                          <Play className="w-5 h-5 text-teal-500 fill-current ml-1" />
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full text-center md:text-left flex flex-col justify-center">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-teal-500 font-bold text-xs uppercase tracking-widest">
                       Продолжить прослушивание
                    </div>
                    <h3 className="text-2xl font-black text-white mb-1 leading-tight line-clamp-1">
                      {lastProgress.title}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-6 line-clamp-1">
                      {lastProgress.source || 'Прослушано недавно'} • {new Date(lastProgress.lastAccessed).toLocaleDateString()}
                    </p>
                    
                    {/* Integrated Progress Bar */}
                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 max-w-md mx-auto md:mx-0">
                       <span>{Math.floor(lastProgress.timestamp / 60)}:{(lastProgress.timestamp % 60).toFixed(0).padStart(2, '0')}</span>
                       <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)] transition-all duration-300" 
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
                 <div className="w-20 h-20 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-6 text-teal-500/50">
                    <Music className="w-10 h-10" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Начните обучение</h3>
                 <p className="text-sm text-zinc-500 max-w-sm">
                   Здесь появится аудио, которое вы слушали последним.
                 </p>
              </div>
            )}

            {/* History List Section */}
            <div className="flex flex-col flex-1 min-h-0 mt-2">
               <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2 text-zinc-200">
                    <History className="w-4 h-4 text-zinc-500" />
                    <h3 className="font-bold text-lg">Недавние аудио</h3>
                  </div>
               </div>
               
               <div className="overflow-y-auto flex-1 scrollbar-stylish pr-2">
                 {history.length <= 1 ? (
                   <div className="p-8 text-center text-zinc-500 text-sm bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-dashed border-zinc-800">
                     У вас пока нет истории прослушиваний.
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 gap-3">
                     {history.slice(1).map(item => (
                       <div 
                         key={item.id} 
                         className="group flex items-center gap-4 p-3 pr-4 bg-[#09090b] rounded-2xl border border-zinc-800 shadow-sm hover:shadow-md hover:border-teal-500/30 transition-all cursor-pointer"
                         onClick={() => navigate(item.isLocal ? '/local-audio-player' : `/player/${item.id}`)}
                       >
                         <div className="w-14 h-14 rounded-xl bg-zinc-900 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                           <Music className="w-5 h-5 text-zinc-700" />
                           <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/10 transition-colors" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-sm text-white truncate group-hover:text-teal-400 transition-colors line-clamp-1">{item.title}</h4>
                           <div className="flex items-center gap-2 mt-1">
                             <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                               <div className="h-full bg-teal-500/60" style={{ width: `${item.duration ? (item.timestamp / item.duration) * 100 : 0}%`}} />
                             </div>
                             <span className="text-[10px] text-zinc-500 font-mono flex-shrink-0">
                               {new Date(item.lastAccessed).toLocaleDateString()}
                             </span>
                           </div>
                         </div>
                         <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-teal-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
             
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Music className="w-64 h-64 text-teal-500" />
             </div>

             <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 relative z-10">Загрузка своего аудио</h2>
             
             {!fileSelected ? (
                 <div 
                   onDragOver={handleDragOver}
                   onDragLeave={handleDragLeave}
                   onDrop={handleDrop}
                   onClick={() => fileInputRef.current?.click()}
                   className={`w-full aspect-video md:aspect-[21/9] border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group shadow-inner relative z-10
                     ${isHovering 
                       ? 'border-teal-500 bg-teal-500/5 dark:bg-teal-500/10' 
                       : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 hover:border-teal-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                     }`}
                 >
                   <input 
                     type="file" 
                     className="hidden" 
                     ref={fileInputRef} 
                     onChange={handleFileInput}
                     accept="audio/*,.srt,.vtt,.lrc"
                     multiple
                   />
                   
                   <div className="w-20 h-20 bg-white dark:bg-slate-800 group-hover:bg-teal-500 group-hover:scale-110 rounded-full flex items-center justify-center mb-6 transition-all duration-500 shadow-sm group-hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]">
                     <Upload className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors duration-300" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Перетащите файлы сюда</h3>
                   <p className="text-slate-500 dark:text-slate-400 text-sm group-hover:text-teal-500/70 transition-colors max-w-xs text-center">Поддерживаются .mp3, .wav и файлы субтитров (.lrc / .srt)</p>
                   
                   <button className="mt-8 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-500 transition-colors shadow-sm">
                     Выбрать файлы
                   </button>
                 </div>
             ) : (
                 <div className="w-full aspect-video md:aspect-[21/9] rounded-[2rem] bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-500/20 flex flex-col items-center justify-center p-8 relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center mb-6">
                      <Music className="w-10 h-10 text-teal-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 text-center truncate w-full max-w-md">
                      {fileSelected.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                       Размер: {(fileSelected.size / (1024 * 1024)).toFixed(1)} MB
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg justify-center">
                       <button 
                         onClick={() => { setFileSelected(null); setSubtitleFile(null); }}
                         className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition order-3 sm:order-1"
                       >
                         Отменить
                       </button>

                       <input 
                         type="file" 
                         className="hidden" 
                         ref={subtitleInputRef} 
                         onChange={(e) => setSubtitleFile(e.target.files?.[0] || null)}
                         accept=".srt,.vtt,.lrc"
                       />

                       <button 
                         onClick={() => subtitleInputRef.current?.click()}
                         className={cn(
                           "px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 order-2 max-w-[200px] overflow-hidden",
                           subtitleFile 
                             ? "bg-teal-500/10 text-teal-500 border border-teal-500/30" 
                             : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                         )}
                       >
                         <Upload className="w-4 h-4 shrink-0" />
                         <span className="truncate">{subtitleFile ? `Текст: ${subtitleFile.name}` : "Загрузить текст"}</span>
                       </button>

                       {/* MOCK AI BUTTON */}
                       <button 
                         onClick={handleExtractAI}
                         disabled={isExtracting}
                         className="px-6 py-3 rounded-xl bg-teal-500/10 text-teal-500 dark:text-teal-400 font-medium hover:bg-teal-500/20 transition-all flex items-center justify-center gap-2 order-1 sm:order-3 border border-teal-500/20"
                       >
                         {isExtracting ? (
                           <>
                             <Loader2 className="w-5 h-5 animate-spin" />
                             Анализ...
                           </>
                         ) : (
                           <>
                             <Sparkles className="w-5 h-5" />
                             AI: Извлечь
                           </>
                         )}
                       </button>

                       {/* Action Button */}
                       <button 
                         onClick={handleWatchNow}
                         disabled={isExtracting}
                         className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none order-4 sm:order-4"
                       >
                         <Play className="w-5 h-5 fill-current" />
                         Слушать
                       </button>
                    </div>
                 </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
