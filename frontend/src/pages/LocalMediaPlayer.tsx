import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { Play, Pause, Volume2, Maximize, Subtitles, Upload, Music } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatTime } from '../lib/formatTime';
import { parseSrtVtt, parseLrc } from '../lib/subtitleParser';
import { saveSession, loadSession } from '../lib/indexedDB';
import { useProgress } from '../lib/useProgress';
import type { SubtitleBlock, SubtitleWord } from '../types/media';
import PageHeader from '../components/PageHeader';
import SubtitleList from '../components/SubtitleList';
import WordAnalysisSidebar from '../components/WordAnalysisSidebar';

const DB_NAMES = { video: 'BYOC_VIDEO_DB', audio: 'BYOC_AUDIO_DB' } as const;
type MediaType = 'video' | 'audio';
interface SessionData { mediaFile: File; subtitleFile: File | null; }

export default function LocalMediaPlayer() {
  const navigate = useNavigate();
  const location = useLocation();

  const stateMediaType: MediaType = (location.state as any)?.mediaType ?? 'video';
  const [mediaType] = useState<MediaType>(stateMediaType);

  const dbName = DB_NAMES[mediaType];
  const progressKey = mediaType === 'video' ? 'video' : 'audio';

  // ----- File / ready state -----
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleBlock[]>([]);
  const [isReady, setIsReady] = useState(false);

  // ----- Player state -----
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(-1);
  const [hoveredWord, setHoveredWord] = useState<SubtitleWord | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  const { saveProgress, getProgress } = useProgress(progressKey);
  const lastSaveTime = useRef(0);

  // ---- Refs ----
  // Both elements exist in DOM at all times — only one is used depending on mediaType.
  // This avoids React unmounting/remounting the media element on every state change.
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const subtitleListRef = useRef<HTMLDivElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  // The active media element
  const getEl = useCallback(
    (): HTMLVideoElement | HTMLAudioElement | null =>
      mediaType === 'video' ? videoRef.current : audioRef.current,
    [mediaType]
  );

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const parseSubtitleFile = async (file: File): Promise<SubtitleBlock[]> => {
    const text = await file.text();
    return file.name.toLowerCase().endsWith('.lrc') ? parseLrc(text) : parseSrtVtt(text);
  };

  const saveThrottled = useCallback((time: number) => {
    if (!mediaFile || !getEl()) return;
    const now = Date.now();
    if (now - lastSaveTime.current < 3000) return;
    lastSaveTime.current = now;
    saveProgress({
      id: `local_${mediaType}_${mediaFile.name}`,
      title: mediaFile.name,
      source: 'Локальный файл',
      timestamp: time,
      duration: getEl()!.duration || 0,
      isLocal: true,
    });
  }, [mediaFile, mediaType, saveProgress, getEl]);

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    const setupFiles = async (file: File, subFile: File | null) => {
      const url = URL.createObjectURL(file);
      if (mounted) { setMediaFile(file); setMediaUrl(url); setIsReady(true); }
      if (subFile && mounted) {
        setSubtitleFile(subFile);
        const parsed = await parseSubtitleFile(subFile);
        if (mounted) setSubtitles(parsed);
      }
      await saveSession(dbName, { mediaFile: file, subtitleFile: subFile });
      navigate('.', { replace: true, state: null });
    };

    const init = async () => {
      const state = location.state as any;
      if (state?.mediaFile) { await setupFiles(state.mediaFile, state.subtitleFile ?? null); return; }
      const legacy: File | undefined = state?.videoFile ?? state?.audioFile;
      if (legacy) { await setupFiles(legacy, state?.subtitleFile ?? null); return; }
      const saved = await loadSession<SessionData>(dbName);
      if (saved?.mediaFile && mounted) {
        const url = URL.createObjectURL(saved.mediaFile);
        setMediaFile(saved.mediaFile); setMediaUrl(url); setIsReady(true);
        if (saved.subtitleFile) {
          setSubtitleFile(saved.subtitleFile);
          const parsed = await parseSubtitleFile(saved.subtitleFile);
          if (mounted) setSubtitles(parsed);
        }
      }
    };

    init();
    return () => { mounted = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if nothing loaded
  useEffect(() => {
    if (isReady || mediaFile) return;
    const t = setTimeout(() => {
      if (!mediaUrl) navigate(mediaType === 'video' ? '/rooms/video' : '/rooms/audio');
    }, 700);
    return () => clearTimeout(t);
  }, [isReady, mediaFile, mediaUrl, navigate, mediaType]);

  // Volume sync
  useEffect(() => {
    const el = getEl();
    if (el) el.volume = volume;
  }, [volume, getEl]);

  // Revoke blob URL on unmount
  useEffect(() => () => { if (mediaUrl) URL.revokeObjectURL(mediaUrl); }, [mediaUrl]);

  // ---------------------------------------------------------------------------
  // Playback event handlers
  // ---------------------------------------------------------------------------
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleEnded = () => setIsPlaying(false);

  const handleLoadedMetadata = () => {
    const el = getEl();
    if (!el) return;
    setDuration(el.duration);
    if (mediaFile) {
      const saved = getProgress(`local_${mediaType}_${mediaFile.name}`);
      if (saved?.timestamp && saved.timestamp > 0) {
        el.currentTime = saved.timestamp;
        setCurrentTime(saved.timestamp);
      }
    }
  };

  const handleTimeUpdate = () => {
    const el = getEl();
    if (!el) return;
    const time = el.currentTime;
    setCurrentTime(time);
    saveThrottled(time);

    // Subtitle sync
    const idx = subtitles.findIndex(s => time >= s.start && time < s.end);
    if (idx !== -1 && idx !== activeSubtitleIndex) {
      setActiveSubtitleIndex(idx);
      const row = subtitleListRef.current?.querySelector(`[data-idx="${idx}"]`) as HTMLElement;
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (idx === -1) {
      const last = subtitles[subtitles.length - 1];
      setActiveSubtitleIndex(last && time > last.end ? subtitles.length - 1 : -1);
    }
  };

  // ---------------------------------------------------------------------------
  // Controls
  // ---------------------------------------------------------------------------
  const togglePlay = () => {
    const el = getEl();
    if (!el) return;
    // Use the element's actual paused state to avoid React state desync
    // that can happen after rapid pause + seek interactions.
    if (!el.paused) { el.pause(); } else { el.play().catch(console.error); }
  };

  const handleSeek = (time: number) => {
    const el = getEl();
    if (!el) return;
    el.currentTime = time;
    setCurrentTime(time);
    // FIXED: Do NOT auto-play on seek. Playback state should remain
    // whatever it was before the user clicked the progress bar.
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleSeek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Word handlers
  // ---------------------------------------------------------------------------
  const onWordClick = (e: React.MouseEvent, word: SubtitleWord) => {
    e.stopPropagation(); e.preventDefault();
    setHoveredWord(word);
    getEl()?.pause();
  };

  const toggleSaveWord = (wordText: string) => {
    setSavedWords(prev => { const next = new Set(prev); next.has(wordText) ? next.delete(wordText) : next.add(wordText); return next; });
  };

  const handleGenerateBreakdown = (target?: SubtitleWord) => {
    const word = target ?? hoveredWord;
    if (!word) return;
    setIsGenerating(true);
    setTimeout(() => {
      const updated: SubtitleWord = { ...word, translation: '[С сервера] Перевод', grammar: '[С сервера] Разбор.', particles: '[С сервера] Морфология' };
      const phrase = '[С сервера] Перевод фразы.';
      if (word.text === hoveredWord?.text) setHoveredWord(updated);
      setSubtitles(prev => prev.map(b => ({
        ...b,
        translation: b.words.some(w => w.text === word.text) ? phrase : b.translation,
        words: b.words.map(w => w.text === word.text ? updated : w),
      })));
      setIsGenerating(false);
    }, 800);
  };

  const handleTranslateAll = () => {
    setIsTranslatingAll(true);
    setTimeout(() => {
      setSubtitles(prev => prev.map(s => ({
        ...s, translation: '[С сервера] Перевод фразы.',
        words: s.words.map(w => ({ ...w, translation: '[С сервера] Перевод', grammar: '[С сервера] Разбор' })),
      })));
      setIsTranslatingAll(false);
    }, 1500);
  };

  const handleReset = () => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaFile(null); setMediaUrl(''); setSubtitles([]); setIsPlaying(false); setIsReady(false);
    navigate(mediaType === 'video' ? '/rooms/video' : '/rooms/audio');
  };

  // Audio-mode: inline upload handlers
  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    const url = URL.createObjectURL(file);
    setMediaFile(file); setMediaUrl(url); setIsReady(true); setIsPlaying(false); setCurrentTime(0);
    await saveSession(dbName, { mediaFile: file, subtitleFile: subtitleFile });
  };

  const handleSubtitleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setSubtitleFile(file);
    const parsed = await parseSubtitleFile(file);
    setSubtitles(parsed);
    if (mediaFile) await saveSession(dbName, { mediaFile, subtitleFile: file });
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (!isReady && !mediaFile) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="w-12 h-12 rounded-full border-t-2 border-brand-cyan animate-spin" />
          <p>Загрузка медиа...</p>
        </div>
      </div>
    );
  }

  const activeSubtitle = activeSubtitleIndex !== -1 ? subtitles[activeSubtitleIndex] : null;
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Shared progress bar + buttons — plain JSX, NOT a component, avoids remount issues
  const progressBar = (
    <div
      className="w-full h-1.5 bg-slate-800 rounded-full cursor-pointer relative group/prog"
      onClick={handleProgressClick}
    >
      <div
        className="absolute top-0 left-0 bottom-0 bg-brand-cyan rounded-full transition-all duration-100 ease-linear pointer-events-none"
        style={{ width: `${progressPct}%` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/prog:opacity-100 transition-opacity pointer-events-none"
        style={{ left: `calc(${progressPct}% - 6px)` }}
      />
    </div>
  );

  const controlsRow = (overlay: boolean) => (
    <div className="flex items-center justify-between mt-1">
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg shrink-0',
            overlay
              ? 'text-white hover:text-brand-cyan hover:scale-110'
              : 'bg-brand-cyan hover:bg-brand-cyan/80 text-white shadow-brand-cyan/20'
          )}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>
        <span className="text-sm text-slate-400 font-mono tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-400">
          <Volume2
            className="w-4 h-4 cursor-pointer hover:text-white transition-colors shrink-0"
            onClick={() => setVolume(v => v === 0 ? 1 : 0)}
          />
          <div
            className="w-16 sm:w-20 h-1.5 bg-slate-800 rounded-full cursor-pointer relative"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-brand-cyan rounded-full pointer-events-none"
              style={{ width: `${volume * 100}%` }}
            />
          </div>
        </div>
        {subtitles.length > 0 && mediaType === 'video' && (
          <button
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={cn(
              'px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium border',
              showSubtitles
                ? 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20'
                : 'text-slate-400 hover:text-white bg-slate-800 border-slate-700'
            )}
          >
            <Subtitles className="w-4 h-4" />
            <span className="hidden sm:inline">{showSubtitles ? 'Вкл' : 'Выкл'}</span>
          </button>
        )}
        {mediaType === 'video' && (
          <button onClick={toggleFullscreen} className="text-slate-400 hover:text-white transition-colors shrink-0">
            <Maximize className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="h-screen flex flex-col bg-transparent">
      {/*
        CRITICAL: Both <audio> and <video> elements are ALWAYS in the DOM at the top level.
        This prevents React from unmounting/remounting the media element on state changes,
        which would destroy the src and stop playback.
        The unused element is hidden with display:none.
      */}
      <audio
        ref={audioRef}
        src={mediaType === 'audio' ? mediaUrl : undefined}
        onTimeUpdate={mediaType === 'audio' ? handleTimeUpdate : undefined}
        onLoadedMetadata={mediaType === 'audio' ? handleLoadedMetadata : undefined}
        onEnded={mediaType === 'audio' ? handleEnded : undefined}
        onPlay={mediaType === 'audio' ? handlePlay : undefined}
        onPause={mediaType === 'audio' ? handlePause : undefined}
        style={{ display: 'none' }}
      />

      {!isFullscreen && (
        <PageHeader
          onBack={handleReset}
          title={mediaFile?.name ?? ''}
          subtitle={subtitles.length > 0 ? `${subtitles.length} строк субтитров` : 'Без субтитров'}
        />
      )}

      <main className={cn('flex-1 overflow-hidden', !isFullscreen && 'p-4 md:p-6 lg:p-8')}>
        <Group
          orientation="horizontal"
          className={cn(
            'h-full w-full flex overflow-hidden flex-col md:flex-row',
            !isFullscreen && 'bg-[#0c0c0e] rounded-3xl border border-zinc-800/50 shadow-2xl max-w-[1600px] mx-auto'
          )}
        >
          {/* LEFT PANEL */}
          <Panel
            defaultSize={50}
            minSize={20}
            className="flex flex-col bg-[#0c0c0e] overflow-hidden"
          >
            {mediaType === 'audio' ? (
              /* ── AUDIO MODE — player block + subtitle list ── */
              <div className="flex flex-col h-full">
                {/* Visual audio player — styled like PoemReader */}
                <div className="shrink-0 bg-zinc-900/80 p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-brand-cyan/10 opacity-20 blur-3xl pointer-events-none" />

                  {/* Cover / upload area */}
                  <div
                    onClick={() => audioInputRef.current?.click()}
                    className="relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-xl border border-white/10 shrink-0 bg-zinc-900 flex items-center justify-center cursor-pointer group"
                    title="Нажмите чтобы загрузить аудио"
                  >
                    <Music className="w-10 h-10 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-brand-cyan" />
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-3 relative z-10">
                    <h2 className="text-brand-cyan text-sm font-semibold uppercase tracking-wider">
                      {mediaFile?.name ?? 'Аудиофайл'}
                    </h2>

                    {/* Upload buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => audioInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-all"
                      >
                        <Upload className="w-4 h-4 text-brand-cyan shrink-0" />
                        Загрузить аудио
                      </button>
                      <button
                        onClick={() => subtitleInputRef.current?.click()}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 border rounded-xl text-xs font-bold transition-all',
                          subtitleFile
                            ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20'
                            : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                        )}
                      >
                        <Subtitles className="w-4 h-4 shrink-0" />
                        <span>{subtitleFile ? ('Текст: ' + subtitleFile.name.slice(0, 16) + '…') : 'Загрузить субтитры'}</span>
                      </button>
                    </div>

                    {/* Progress + controls */}
                    <div className="space-y-2">
                      {progressBar}
                      {controlsRow(false)}
                    </div>
                  </div>

                  {/* Hidden file inputs */}
                  <input ref={audioInputRef} type="file" className="hidden" accept="audio/*" onChange={handleAudioFileChange} />
                  <input ref={subtitleInputRef} type="file" className="hidden" accept=".srt,.vtt,.lrc" onChange={handleSubtitleFileChange} />
                </div>

                {/* Subtitle list */}
                <div className="flex-1 overflow-hidden">
                  <SubtitleList
                    subtitles={subtitles}
                    activeIndex={activeSubtitleIndex}
                    hoveredWord={hoveredWord}
                    savedWords={savedWords}
                    isTranslatingAll={isTranslatingAll}
                    onSeek={handleSeek}
                    onWordClick={onWordClick}
                    onTranslateAll={handleTranslateAll}
                    containerRef={subtitleListRef}
                  />
                </div>
              </div>
            ) : (
              /* ── VIDEO MODE — video + overtime subtitle overlay + subtitle list ── */
              <Group orientation="vertical" className="h-full">
                <Panel defaultSize={55} minSize={25} className="relative bg-black overflow-hidden">
                  <div ref={playerContainerRef} className="w-full h-full relative">
                    {/* Video element — always rendered, never inside an inner component */}
                    <video
                      ref={videoRef}
                      src={mediaUrl}
                      className="w-full h-full object-contain"
                      onClick={togglePlay}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleEnded}
                      onPlay={handlePlay}
                      onPause={handlePause}
                      playsInline
                    />

                    {/* On-video subtitle overlay */}
                    {showSubtitles && activeSubtitle && (
                      <div className="absolute bottom-[72px] left-0 right-0 flex justify-center z-30 px-6 pointer-events-none">
                        <div className="bg-black/75 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-2xl inline-block pointer-events-auto max-w-[90%]">
                          <div className={cn(
                            'flex flex-wrap justify-center gap-x-1 gap-y-1 font-korean tracking-wide',
                            isFullscreen ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'
                          )}>
                            {activeSubtitle.words.map((word, wIdx) => (
                              <span
                                key={wIdx}
                                onClick={e => onWordClick(e, word)}
                                className={cn(
                                  'cursor-pointer transition-all duration-200 rounded-xl px-1.5 py-1 hover:bg-brand-cyan/20 hover:text-white drop-shadow-lg',
                                  hoveredWord?.text === word.text
                                    ? 'bg-brand-cyan text-white font-bold scale-110 shadow-[0_0_20px_rgba(112,161,215,0.4)]'
                                    : 'text-white'
                                )}
                              >
                                {word.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Controls pinned to bottom — NOT hover-only to avoid scrollbar ghost */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent px-5 pb-4 pt-10 z-20 flex flex-col gap-2">
                      {progressBar}
                      {controlsRow(true)}
                    </div>
                  </div>
                </Panel>

                {!isFullscreen && (
                  <>
                    <Separator className="h-px bg-zinc-800 hover:bg-brand-cyan/50 transition-colors cursor-row-resize" />
                    <Panel defaultSize={45} minSize={20} className="bg-[#0c0c0e] overflow-hidden">
                      <SubtitleList
                        subtitles={subtitles}
                        activeIndex={activeSubtitleIndex}
                        hoveredWord={hoveredWord}
                        savedWords={savedWords}
                        isTranslatingAll={isTranslatingAll}
                        onSeek={handleSeek}
                        onWordClick={onWordClick}
                        onTranslateAll={handleTranslateAll}
                        containerRef={subtitleListRef}
                      />
                    </Panel>
                  </>
                )}
              </Group>
            )}
          </Panel>

          {/* RIGHT PANEL — word analysis */}
          {!isFullscreen && (
            <>
              <Separator className="w-px bg-zinc-800 hover:bg-brand-cyan/50 transition-colors cursor-col-resize hidden md:block" />
              <Panel defaultSize={50} minSize={30} className="flex flex-col">
                <WordAnalysisSidebar
                  word={hoveredWord}
                  savedWords={savedWords}
                  isGenerating={isGenerating}
                  phraseTranslation={activeSubtitle?.translation}
                  onSave={toggleSaveWord}
                  onGenerate={() => handleGenerateBreakdown()}
                  emptyHint="Нажмите на любое слово в субтитрах, чтобы увидеть перевод и разбор."
                />
              </Panel>
            </>
          )}
        </Group>
      </main>
    </div>
  );
}
