import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, PlayCircle, Star, BookOpen, Clock } from 'lucide-react';
import { DRAMAS } from '../data/dramas';
import { cn } from '../lib/utils';

export default function DramaDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const drama = DRAMAS.find(d => d.id === Number(id));

  if (!drama) {
    return (
      <div className="p-8 flex items-center justify-center h-full text-slate-400">
        <p>Дорама не найдена</p>
      </div>
    );
  }

  // Find next unwatched/in-progress episode
  const nextUpEpisode = drama.episodes.find(e => e.progressPercent < 100) || drama.episodes[0];
  const totalWords = drama.episodes.reduce((sum, ep) => sum + ep.wordsLearned, 0);

  return (
    <div className="p-8 md:p-12 space-y-12">
      {/* Background elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 relative z-10">
        <div className="w-full md:w-80 flex-shrink-0">
           <button 
             onClick={() => navigate(-1)} 
             className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
           >
             <div className="p-2 rounded-full group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
               <ArrowLeft className="w-5 h-5" />
             </div>
             <span>Назад к каталогу</span>
           </button>
           <div className="relative aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800">
             <img src={drama.image} alt={drama.title} className="w-full h-full object-cover" />
             <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
             <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl font-medium">
                  <Star className="w-4 h-4 text-brand-gold fill-current" />
                  {drama.rating}
                </div>
                <div className="text-sm font-medium">{drama.year}</div>
             </div>
           </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="flex flex-wrap gap-2 mb-4">
            {drama.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {drama.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl leading-relaxed">
            {drama.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 mb-12">
            <Link 
              to={`/player/video/${drama.id}/${nextUpEpisode?.id || 1}`}
              className="px-8 py-4 bg-brand-cyan text-white rounded-2xl font-semibold flex items-center gap-3 hover:bg-brand-cyan/90 transition-all hover:scale-105"
            >
              <Play className="w-6 h-6 fill-current" />
              {nextUpEpisode?.progressPercent > 0 ? "Продолжить просмотр" : "Начать просмотр"}
            </Link>
            
            <div className="flex gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex flex-col">
                <span className="text-sm opacity-75">Серий доступно</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{drama.episodes.length}</span>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-sm opacity-75">Выучено слов</span>
                <span className="text-xl font-bold text-brand-gold">{totalWords}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes List */}
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Список серий</h2>
        <div className="space-y-4 max-w-4xl">
          {drama.episodes.map((episode) => {
            const isCompleted = episode.progressPercent === 100;
            const isWatching = episode.progressPercent > 0 && episode.progressPercent < 100;

            return (
              <Link
                to={`/player/video/${drama.id}/${episode.id}`}
                key={episode.id}
                className="block bg-slate-900 dark:bg-slate-700 border border-slate-800 rounded-[24px] p-5 transition-all duration-300 hover:bg-slate-800 dark:hover:bg-slate-600 group hover:scale-[1.01] hover:-translate-y-0.5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Info */}
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      {/* Thumbnail Container */}
                      <div className="w-24 h-16 rounded-[14px] bg-slate-900 border border-white/10 overflow-hidden flex items-center justify-center relative transition-shadow">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-50" />
                        <div className="w-8 h-8 rounded-full border-2 border-brand-pink/50 text-brand-pink flex items-center justify-center relative z-10 bg-black/40 backdrop-blur-sm shadow-lg">
                           <Play className="w-4 h-4 ml-0.5 fill-current" />
                        </div>
                      </div>
                      
                      {/* Status Pill */}
                      {isCompleted && (
                        <div className="absolute -top-3 -left-2 bg-brand-pink text-[10px] font-bold px-2 py-0.5 rounded-[8px] shadow-lg z-20 text-white">
                          Просмотрено
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-[18px] font-bold text-white mb-2 group-hover:text-brand-pink transition-colors drop-shadow-md">
                        {episode.title}
                      </h3>
                      <div className="flex items-center gap-4 text-[13px] font-medium text-slate-200">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-brand-pink" /> {episode.duration}</span>
                        {episode.wordsLearned > 0 && (
                          <span className="flex items-center gap-1.5 text-[#FFD700]"><BookOpen className="w-3.5 h-3.5" /> {episode.wordsLearned} слов</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Progress */}
                  <div className="w-full md:w-60 flex-shrink-0">
                    <div className="flex justify-between text-[11px] font-bold mb-2">
                       <span className={isCompleted || isWatching ? "text-[#00F9E1]" : "text-slate-400"}>Прогресс</span>
                       <span className={isWatching || isCompleted ? "text-[#00F9E1]" : "text-slate-400"}>{episode.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10 shadow-inner">
                       <div 
                         className="h-full bg-gradient-to-r from-[#00A896] to-[#01F9E1] rounded-full transition-all duration-1000 ease-in-out" 
                         style={{ width: `${episode.progressPercent}%` }}
                       />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
