import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Panel, Group, Separator } from 'react-resizable-panels';
import {
  Sparkles, Loader2, ArrowLeft, Heart, Bookmark, Share2,
  Upload, Music, RotateCcw
} from 'lucide-react';
import { MOCK_QUOTES } from '../data/quotes';
import { cn } from '../lib/utils';
import FontSizeControl from '../components/FontSizeControl';

export default function QuoteReader() {
  const { id } = useParams();
  const activeQuote = id ? MOCK_QUOTES.find(q => q.id === id) : MOCK_QUOTES[0];

  const [selectedWord, setSelectedWord] = useState<{
    text: string;
    translation: string;
    baseForm?: string;
    particles?: string;
    grammar?: string;
  } | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  // Track social interactions locally
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!activeQuote) return <Navigate to="/quotes" />;

  const words = activeQuote.textKor.split(' ').map(word => ({
    text: word,
    translation: 'Перевод слова...',
    baseForm: word.replace(/[은는이가을를요]$/, ''),
    particles: 'Окончание / Частица',
    grammar: 'Грамматическое пояснение для этого слова в контексте.',
  }));

  const handleWordClick = (word: typeof words[0]) => setSelectedWord(word);

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (selectedWord) {
        setSelectedWord({
          ...selectedWord,
          grammar: '[ИИ] В данной фразе используется специфическая конструкция, выражающая намерение или вежливую просьбу.',
          particles: '[ИИ] Морфема: корень + суффикс вежливости.',
        });
      }
      setIsGenerating(false);
    }, 1500);
  };

  const handleGenerateAudio = () => {
    setIsGeneratingAudio(true);
    setTimeout(() => { setIsGeneratingAudio(false); }, 2000);
  };

  return (
    <div className="p-4 md:p-6 pb-0 w-full max-w-[1600px] mx-auto lg:h-[calc(100vh-24px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page header — same as PoemReader */}
      <div className="mb-4 shrink-0 flex items-center justify-between px-2">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Link to="/quotes" className="p-2 -ml-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white leading-tight">
              {activeQuote.textKor.slice(0, 30)}{activeQuote.textKor.length > 30 ? '…' : ''}{' '}
              <span className="text-sm text-zinc-500 font-normal ml-1">({activeQuote.source})</span>
            </h1>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">— Цитатник</span>
          </div>
        </div>
        <FontSizeControl fontSize={fontSize} min={16} max={120} step={4} onChange={setFontSize} />
      </div>

      {/* Main two-column layout — identical structure to PoemReader */}
      <Group
        orientation="horizontal"
        className="flex flex-col lg:flex-row gap-0 bg-zinc-950 rounded-2xl border border-zinc-800/50 overflow-hidden shadow-2xl h-auto lg:h-full w-full max-w-[1400px] mx-auto min-h-0"
      >
        {/* LEFT COLUMN — audio block + content + social buttons */}
        <Panel defaultSize={40} minSize={20} className="flex flex-col min-h-0 bg-zinc-950">

          {/* Audio / TTS area — same structure as PoemReader audio block */}
          <div className="w-full shrink-0 bg-zinc-900/80 p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-cyan/10 opacity-20 blur-3xl pointer-events-none" />

            {/* Cover art / quote icon */}
            <div className="relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-xl border border-white/10 shrink-0 bg-zinc-900 flex items-center justify-center">
              <Music className="w-10 h-10 text-zinc-700" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={handleGenerateAudio}>
                <div className="w-12 h-12 rounded-full bg-brand-cyan flex items-center justify-center shadow-lg">
                  {isGeneratingAudio
                    ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                    : <Sparkles className="w-5 h-5 text-white" />}
                </div>
              </div>
            </div>

            <div className="flex-1 w-full space-y-4 relative z-10">
              <div>
                <h2 className="text-brand-cyan text-sm font-semibold uppercase tracking-wider mb-1">Озвучка цитаты</h2>
                <p className="text-xs text-zinc-500 mb-3">Загрузите свой файл или сгенерируйте ИИ-войслайн</p>
                <div className="flex gap-3 flex-wrap">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all border border-zinc-700"
                    onClick={() => alert('Открытие диалога выбора файла...')}
                  >
                    <Upload className="w-4 h-4 text-brand-cyan" />
                    ЗАГРУЗИТЬ
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan rounded-xl text-xs font-bold transition-all border border-brand-cyan/20"
                    onClick={handleGenerateAudio}
                    disabled={isGeneratingAudio}
                  >
                    {isGeneratingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    СГЕНЕРИРОВАТЬ ИИ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-6 lg:p-10 bg-zinc-950/20 relative">
            <div className="max-w-3xl mx-auto space-y-10">

              {/* Interactive Korean text — same clickable pattern as PoemReader words */}
              <div className="group flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <div
                  className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-korean"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {words.map((word, wIdx) => (
                    <span
                      key={wIdx}
                      onClick={() => handleWordClick(word)}
                      className={cn(
                        'font-korean px-1 -mx-0.5 rounded transition-colors cursor-pointer',
                        selectedWord?.text === word.text
                          ? 'bg-brand-cyan text-white shadow shadow-brand-cyan/20'
                          : 'text-white hover:text-brand-cyan hover:bg-brand-cyan/20'
                      )}
                    >
                      {word.text}
                    </span>
                  ))}
                </div>
                <div className="text-[13px] font-medium text-white/60">{activeQuote.textRus}</div>
              </div>

              {/* Source & context */}
              <div className="pt-8 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 text-brand-cyan font-bold uppercase tracking-[0.2em] text-[10px] mb-3">
                  <span className="w-8 h-px bg-brand-cyan/30" />
                  Источник
                </div>
                <p className="text-zinc-400 text-base italic">{activeQuote.source}</p>
              </div>

              {/* Social action buttons — compact, inline below the quote */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setLiked(l => !l)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all',
                    liked
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-500/30'
                  )}
                >
                  <Heart className={cn('w-3.5 h-3.5', liked && 'fill-current')} />
                  ЛАЙК
                </button>
                <button
                  onClick={() => setSaved(s => !s)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all',
                    saved
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-amber-400 hover:border-amber-500/30'
                  )}
                >
                  <Bookmark className={cn('w-3.5 h-3.5', saved && 'fill-current')} />
                  СОХРАНИТЬ
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  ПОДЕЛИТЬСЯ
                </button>
              </div>
            </div>
          </div>
        </Panel>

        <Separator className="w-px bg-transparent hover:bg-brand-cyan/50 transition-colors cursor-col-resize hidden lg:block" />

        {/* RIGHT COLUMN — word breakdown — same as PoemReader */}
        <Panel defaultSize={60} minSize={30} className="flex flex-col min-h-0 bg-zinc-900/95 backdrop-blur-md">
          {selectedWord ? (
            <div className="p-5 lg:p-8 flex-1 min-h-0 overflow-y-auto scrollbar-hide animate-in slide-in-from-right-4 fade-in duration-300 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-2 font-korean">{selectedWord.text}</h3>
                  {selectedWord.baseForm && (
                    <div className="text-sm font-medium text-zinc-400 bg-zinc-800/80 inline-block px-2.5 py-1 rounded border border-zinc-700/50">
                      н.ф: <span className="text-zinc-200 font-korean">{selectedWord.baseForm}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                  aria-label="Закрыть"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="grid gap-6 flex-1">
                {/* Translation card */}
                <div className="p-6 bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl relative overflow-hidden group">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-cyan/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <h4 className="text-xs font-bold text-brand-cyan uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0" />
                    Перевод
                  </h4>
                  <p className="text-2xl md:text-3xl font-bold text-white leading-tight">{selectedWord.translation}</p>
                </div>

                {/* Particles */}
                {selectedWord.particles && (
                  <div className="p-6 bg-zinc-800/40 border border-zinc-700/50 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-brand-cyan mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0" />
                      Частицы / Морфемы
                    </h4>
                    <div className="text-base text-zinc-200 bg-brand-cyan/5 border border-brand-cyan/20 p-4 rounded-xl leading-relaxed">
                      {selectedWord.particles}
                    </div>
                  </div>
                )}

                {/* Grammar */}
                {selectedWord.grammar && (
                  <div className="p-6 bg-zinc-800/40 border border-zinc-700/50 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0" />
                      Грамматика
                    </h4>
                    <div className="text-base text-zinc-200 bg-zinc-800/40 border border-zinc-700/50 p-4 rounded-xl leading-relaxed">
                      {selectedWord.grammar}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-6">
                <button
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="w-full lg:w-max px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-200 font-medium rounded-xl transition-all border border-zinc-700 flex items-center justify-center gap-2"
                >
                  {isGenerating
                    ? <><Loader2 className="w-5 h-5 animate-spin text-brand-cyan" />Генерация...</>
                    : <><Sparkles className="w-5 h-5 text-brand-cyan" />Сгенерировать ИИ-разбор</>}
                </button>
                <button className="w-full lg:w-max px-8 py-3.5 bg-brand-cyan hover:bg-brand-cyan/90 text-white font-medium rounded-xl transition-all shadow-lg shadow-brand-cyan/20 active:scale-[0.98]">
                  Добавить в личный словарь
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8 opacity-40">
              <div className="w-24 h-24 rounded-3xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mb-6 shadow-inner">
                <span className="text-5xl font-korean text-zinc-500">가</span>
              </div>
              <h3 className="text-2xl font-bold text-zinc-300 mb-2">Разбор предложения</h3>
              <p className="text-zinc-400 font-medium max-w-sm text-lg">
                Кликните на любое слово в цитате слева, чтобы увидеть подробный разбор и перевод.
              </p>
            </div>
          )}
        </Panel>
      </Group>
    </div>
  );
}
