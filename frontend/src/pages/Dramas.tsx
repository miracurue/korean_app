import { useState, useEffect } from 'react';
import { Search, Filter, Play, Tv } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DramaEpisode {
  id: string;
  series_title: string;
  episode_number: string;
  video_url: string;
}

interface DramaSeries {
  title: string;
  tags: string | null;
  episodes: DramaEpisode[];
}

interface FlatVideo {
  id: string;
  series_title: string;
  episode_number: string;
  video_url: string;
  tags: string | null;
}

export default function Dramas() {
  const [videos, setVideos] = useState<FlatVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dramas')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: DramaSeries[]) => {
        // Flatten episodes into a flat video list
        const flat: FlatVideo[] = data.flatMap(drama =>
          drama.episodes.map(ep => ({
            id: ep.id,
            series_title: ep.series_title,
            episode_number: ep.episode_number,
            video_url: ep.video_url,
            tags: drama.tags,
          }))
        );
        setVideos(flat);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch dramas:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 space-y-8 relative">
      <div className="flex justify-between items-center relative z-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Каталог дорам</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Поиск дорам..." 
              className="pl-10 pr-4 py-2 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan transition-colors w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-xl text-slate-700 dark:text-white hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
            Фильтры
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['Все', 'Романтика', 'Комедия', 'Триллер', 'Фэнтези', 'Исторический', 'Школа'].map(tag => (
          <button key={tag} className="px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-brand-cyan transition-colors whitespace-nowrap shadow-sm">
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-t-2 border-brand-cyan rounded-full animate-spin" />
          <span className="ml-3 text-slate-400">Загрузка видео...</span>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg mb-2">Ошибка загрузки</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg">Нет видео в базе данных</p>
          <p className="text-sm mt-2">Добавьте видео через страницу администратора</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <Link
              key={video.id}
              to={`/player/video/${video.id}`}
              className="group block bg-[#13141f] border border-slate-800/80 rounded-[28px] overflow-hidden hover:shadow-[0_8px_30px_-5px_rgba(0,184,169,0.2)] hover:border-brand-cyan/40 transition-all duration-500 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/5] overflow-hidden m-2 rounded-[20px] isolate bg-slate-900">
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <Tv className="w-16 h-16 text-slate-600" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#13141f]/80 via-transparent to-black/60 opacity-80" />

                {/* Title at Bottom */}
                <div className="absolute bottom-0 inset-x-0 p-4 pt-10 bg-gradient-to-t from-[#13141f] via-[#13141f]/40 to-transparent z-10">
                  <h3 className="text-white font-bold text-xl leading-tight drop-shadow-md">{video.series_title}</h3>
                  <p className="text-slate-300 text-sm mt-1">Эпизод {video.episode_number}</p>
                </div>

                {/* Play button overlay on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-brand-cyan text-white flex items-center justify-center shadow-[0_0_20px_rgba(0,184,169,0.6)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-6 h-6 ml-1 fill-current" />
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-1">
                <div className="text-slate-400 text-sm mb-4 truncate font-medium">
                  {video.tags || 'Дорама'}
                </div>

                <div className="border-t border-slate-800 pt-4 flex items-center">
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <Play className="w-4 h-4 text-brand-cyan" />
                    <span className="text-sm font-medium text-brand-cyan">Смотреть</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}