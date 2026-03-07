import { Search, Filter, Play, Music as MusicIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const MUSIC = [
  { id: 101, title: 'Ditto', artist: 'NewJeans', year: 2022, tags: ['K-Pop', 'R&B'], image: 'https://picsum.photos/seed/ditto/400/400' },
  { id: 102, title: 'Spring Day', artist: 'BTS', year: 2017, tags: ['K-Pop', 'Баллада'], image: 'https://picsum.photos/seed/spring/400/400' },
  { id: 103, title: 'Love Dive', artist: 'IVE', year: 2022, tags: ['K-Pop', 'Dance'], image: 'https://picsum.photos/seed/lovedive/400/400' },
  { id: 104, title: 'Tomboy', artist: '(G)I-DLE', year: 2022, tags: ['K-Pop', 'Rock'], image: 'https://picsum.photos/seed/tomboy/400/400' },
  { id: 105, title: 'Hype Boy', artist: 'NewJeans', year: 2022, tags: ['K-Pop', 'R&B'], image: 'https://picsum.photos/seed/hypeboy/400/400' },
  { id: 106, title: 'Stay With Me', artist: 'Chanyeol, Punch', year: 2016, tags: ['OST', 'Баллада'], image: 'https://picsum.photos/seed/staywithme/400/400' },
];

export default function Music() {
  return (
    <div className="p-8 space-y-8 relative">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-transparent dark:bg-brand-gold/10 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="flex justify-between items-center relative z-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Каталог музыки</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Поиск песен..." 
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
        {['Все', 'K-Pop', 'OST', 'Баллада', 'Хип-хоп', 'R&B', 'Dance'].map(tag => (
          <button key={tag} className="px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-brand-cyan transition-colors whitespace-nowrap shadow-sm">
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {MUSIC.map(song => (
          <Link key={song.id} to={`/player/${song.id}`} className="group block">
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-900 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 group-hover:shadow-[0_0_30px_-5px_rgba(0,184,169,0.3)] transition-shadow duration-500">
              <img src={song.image} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-brand-cyan text-white flex items-center justify-center shadow-lg shadow-brand-cyan/30 transform scale-75 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 ml-1" />
                </div>
              </div>
              <div className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 backdrop-blur-md text-white">
                <MusicIcon className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-slate-900 dark:text-white font-medium truncate group-hover:text-brand-cyan transition-colors">{song.title}</h3>
            <p className="text-sm text-slate-500 truncate mt-1">{song.artist}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
