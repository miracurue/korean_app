import { useParams, Navigate, Link } from 'react-router-dom';
import { sampleClips } from '../data/clips';
import SmartPlayer from '../components/SmartPlayer';
import { ArrowLeft } from 'lucide-react';

export default function ClipDetails() {
  const { id } = useParams();
  const clip = sampleClips.find(c => c.id === id);

  if (!clip) {
    return <Navigate to="/clips" />;
  }

  return (
    <div className="p-4 md:p-6 pb-0 w-full max-w-[1600px] mx-auto lg:h-[calc(100vh-24px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <div>
          <Link to="/clips" className="text-zinc-500 hover:text-indigo-400 font-medium flex items-center gap-2 w-max transition-colors mb-2">
            <ArrowLeft size={16} /> К списку сцен
          </Link>
          <div className="flex items-end gap-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none">{clip.title}</h1>
            <p className="flex items-center gap-2 text-zinc-400 font-medium text-sm mb-0.5">
              <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-zinc-300">{clip.source}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{clip.level}</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <SmartPlayer clip={clip} />
      </div>
    </div>
  );
}
