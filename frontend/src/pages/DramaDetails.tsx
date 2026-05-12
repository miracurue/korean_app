import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Play, Clock, BookOpen, Tv } from 'lucide-react';

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

export default function DramaDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Get series data from router state (passed from Dramas page)
  const [series, setSeries] = useState<DramaSeries | null>(
    (location.state as { series?: DramaSeries })?.series || null
  );
  const [loading, setLoading] = useState(!series);

  // If no state, try fetching from API
  useEffect(() => {
    if (series) {
      setLoading(false);
      return;
    }

    fetch('/api/dramas')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: DramaSeries[]) => {
        const found = data[Number(id)] || null;
        setSeries(found);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch drama:', err);
        setLoading(false);
      });
  }, [id, series]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-t-2 border-brand-cyan rounded-full animate-spin" />
        <span className="ml-3 text-slate-400">Загрузка...</span>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="p-8 flex items-center justify-center h-full text-slate-400">
        <p>Дорама не найдена</p>
      </div>
    );
  }

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
          <div className="relative aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800 bg-slate-900 flex items-center justify-center">
            <Tv className="w-24 h-24 text-slate-600" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="text-sm font-medium">{series.tags || 'Дорама'}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {series.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 mb-12">
            {series.episodes.length > 0 && (
              <Link
                to={`/player/video/${series.episodes[0].id}`}
                className="px-8 py-4 bg-brand-cyan text-white rounded-2xl font-semibold flex items-center gap-3 hover:bg-brand-cyan/90 transition-all hover:scale-105"
              >
                <Play className="w-6 h-6 fill-current" />
                Начать просмотр
              </Link>
            )}

            <div className="flex gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex flex-col">
                <span className="text-sm opacity-75">Эпизодов</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{series.episodes.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes List */}
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Список сцен</h2>
        <div className="space-y-4 max-w-4xl">
          {series.episodes.map((episode) => (
            <Link
              to={`/player/video/${episode.id}`}
              key={episode.id}
              className="block bg-slate-900 dark:bg-slate-700 border border-slate-800 rounded-[24px] p-5 transition-all duration-300 hover:bg-slate-800 dark:hover:bg-slate-600 group hover:scale-[1.01] hover:-translate-y-0.5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div className="w-24 h-16 rounded-[14px] bg-slate-900 border border-white/10 overflow-hidden flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-50" />
                    <div className="w-8 h-8 rounded-full border-2 border-brand-pink/50 text-brand-pink flex items-center justify-center relative z-10 bg-black/40 backdrop-blur-sm shadow-lg">
                      <Play className="w-4 h-4 ml-0.5 fill-current" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[18px] font-bold text-white mb-2 group-hover:text-brand-pink transition-colors drop-shadow-md">
                      Эпизод {episode.episode_number}
                    </h3>
                    <div className="flex items-center gap-4 text-[13px] font-medium text-slate-200">
                      <span className="flex items-center gap-1.5">
                        ID: {episode.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-brand-cyan">
                  <span className="text-sm font-medium">Смотреть</span>
                  <Play className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}